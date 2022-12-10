import { ProviderError, VerificationError } from "../error/mod.ts";
import { packer } from "../util/packer.ts";
import { PAE } from "../util/pae.ts";
import { _parse_raw_token } from "../util/raw_parser.ts";
import { validateFooter, validatePayload } from "../util/validation.ts";
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

  async sign(message: Record<string, unknown>, footer = ""): Promise<string> {
    if (this.keyPair?.privateKey.type != "private") {
      throw new ProviderError("Tokens must be signed with a private key.");
    }

    const h = `${this.version}.${this.purpose}`;
    const m = validatePayload(message);
    const f = validateFooter(footer);

    const encoded_header = encoder.encode(h);
    const encoded_message = encoder.encode(JSON.stringify(m));
    const encoded_footer = encoder.encode(f);

    const m2 = PAE([
      encoded_header,
      encoded_message,
      encoded_footer,
    ]);

    const signature = await crypto.subtle.sign(
      SUPPORTED_PROTOCOLS.v1.public.pss,
      this.keyPair.privateKey,
      m2,
    );

    return packer(h, encoded_message, signature, f);
  }

  async verify(rawToken: string): Promise<IVerifiedPasetoToken> {
    const { version, purpose, payload, footer, raw } = _parse_raw_token(
      rawToken,
    );
    const rawHeader = `${version}.${purpose}`;
    if (rawHeader !== `${this.version}.${this.purpose}`) {
      throw new VerificationError(
        `Token header is not valid, expected: ${this.version}.${this.purpose}`,
      );
    }

    const s = raw?.signatureBytes;
    const encoded_header = encoder.encode(rawHeader);
    const encoded_message = encoder.encode(raw?.payload);
    const encoded_footer = encoder.encode(footer);

    const m2 = PAE([
      encoded_header,
      encoded_message,
      encoded_footer,
    ]);

    const isVerified = await crypto.subtle.verify(
      SUPPORTED_PROTOCOLS.v1.public.pss,
      this.keyPair.publicKey,
      s,
      m2,
    );

    if (isVerified) {
      return { message: payload, footer };
    }

    throw new VerificationError("The token failed verification.");
  }
}

export { V1Local, V1Public };
