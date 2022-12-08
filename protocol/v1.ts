import { ProviderError } from "../error/mod.ts";
import { BaseProtocol, ILocalPurpose, IPublicPurpose } from "./common.ts";

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
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA384" },
      },
      true,
      ["sign", "verify"],
    );
  }

  sign(message = "", footer = ""): void {
    if (this.keyPair?.privateKey.type != "private") {
      throw new ProviderError("Tokens must be signed with a private key.");
    }
    const h = 'v1.public';
    const m = encoder.encode(message);

    const m2 = PA;
  }

  verify(): void {
    console.log("develop an app");
  }
}

export { V1Local, V1Public };
