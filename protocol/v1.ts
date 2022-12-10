import { ProviderError, VerificationError } from "../error/mod.ts";
import { packer } from "../util/packer.ts";
import { PAE } from "../util/pae.ts";
import { _parse_raw_token } from "../util/raw_parser.ts";
import {
  validateFooter,
  validateHeader,
  validateKeyUsage,
  validatePayload
} from "../util/validation.ts";
import {
  BaseProtocol,
  ILocalPurpose,
  IPublicPurpose,
  IVerifiedPasetoToken,
  SUPPORTED_PROTOCOLS
} from "./common.ts";

const encoder = new TextEncoder();

interface V1LocalSecretKey extends CryptoKey {
  algorithm: AesKeyGenParams;
}

/** Implements a local paseto provider for protocol v1 */
class V1Local extends BaseProtocol implements ILocalPurpose {
  /**
   * Create a local paseto provider for protocol v1
   * @param {V1LocalSecretKey | undefined } secretKey - Optionally initialize with predefined key
   */
  secretKey: V1LocalSecretKey | undefined;

  constructor(secretKey = undefined) {
    super("v1", "local");
    this.secretKey = secretKey;
  }

  /**
   * Generate a v1 secret key and set it to the instance.
   * @return {void}
   */
  async generateKey(): Promise<void> {
    if (this.secretKey) {
      throw new ProviderError("This provider already has a secret key.");
    }

    this.secretKey = <V1LocalSecretKey> await crypto.subtle.generateKey(
      {
        name: "AES-CTR",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );
  }

  /**
   * Encrypt a v1 paseto for local usage
   * @return {string} the generated private key.
   */
  encrypt(): void {
    console.log("develop an app");
  }

  /**
   * Decrypt a v1 paseto for local usage
   * @return {string} the generated private key.
   */
  decrypt(): void {
    console.log("develop an app");
  }
}

interface V1PublicKey extends CryptoKey {
  type: "public";
  algorithm: RsaHashedKeyGenParams;
}

interface V1PrivateKey extends CryptoKey {
  type: "private";
  algorithm: RsaHashedKeyGenParams;
}
interface V1PublicKeyPair extends CryptoKeyPair {
  publicKey: V1PublicKey;
  privateKey: V1PrivateKey;
}

/** Implements a public paseto provider for protocol v1 */
class V1Public extends BaseProtocol implements IPublicPurpose {
  /**
   * Create a public paseto provider for protocol v1
   * @param {V1PublicKeyPair | undefined} keyPair - Optionally initialize with predefined key pair
   */
  keyPair: V1PublicKeyPair | undefined;
  signatureLength: number;

  constructor(keyPair = undefined) {
    super("v1", "public");
    this.keyPair = keyPair;
    this.signatureLength = 256;
  }

  /**
   * Generate a v1 key pair and set it to the instance.
   * @return {void}
   */
  async generateKey(): Promise<void> {
    if (this.keyPair) {
      throw new ProviderError("This provider already has a key pair.");
    }

    this.keyPair = <V1PublicKeyPair> await crypto.subtle.generateKey(
      SUPPORTED_PROTOCOLS.v1.public.algorithm,
      true,
      ["sign", "verify"],
    );
  }

  /**
   * Signs/generates a V1 Public Paseto Token
   * @param {Record<string, unknown>} message - An object representing payload; must be serializable as JSON.
   * @param {Record<string, unknown>} footer - An arbitrary text string to append to the end of a paseto token
   * @return {Promise<string>} a signed V1 Public Paseto Token
   */
  async sign(message: Record<string, unknown>, footer = ""): Promise<string> {
    validateKeyUsage("sign", this.keyPair.privateKey);
    // TODO: Validate message/claims

    const h = `${this.version}.${this.purpose}`;
    const m = validatePayload(message);
    const u8msg = encoder.encode(JSON.stringify(m));
    const f = validateFooter(footer);
    const m2 = PAE([h, u8msg, f]);

    const signature = await crypto.subtle.sign(
      SUPPORTED_PROTOCOLS.v1.public.pss,
      this.keyPair.privateKey,
      m2,
    );

    return packer(h, u8msg, signature, f);
  }

  /**
   * Verifies a V1 Public Paseto Token
   * @param {string} rawToken - A V1 Public Paseto Token in transit form
   * @return {Promise<IVerifiedPasetoToken>} the message and footer for a verified V1 Public Paseto Token
   */
  async verify(rawToken: string): Promise<IVerifiedPasetoToken> {
    validateKeyUsage("verify", this.keyPair.publicKey);

    const { version, purpose, payload, footer, raw } = _parse_raw_token(
      rawToken,
      { version: this.version, purpose: this.purpose, signatureLength: this.signatureLength }
    );
    const h = validateHeader(this.version, this.purpose, version, purpose);
    const f = footer || "";
    const s = raw?.signatureBytes;
    const m = raw?.payload;
    const m2 = PAE([h, m, f]);

    const isVerified = await crypto.subtle.verify(
      SUPPORTED_PROTOCOLS.v1.public.pss,
      this.keyPair.publicKey,
      s,
      m2,
    );

    // TODO: validate claims somewhere around here

    if (isVerified) {
      return { message: payload, footer };
    }

    throw new VerificationError("The token failed verification.");
  }
}

export { V1Local, V1Public };
