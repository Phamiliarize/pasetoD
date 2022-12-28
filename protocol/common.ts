interface Protocol {
  type: string | Record<string, string>;
  algorithm: RsaHashedKeyAlgorithm | AesKeyAlgorithm;
  pss?: RsaPssParams;
}

type Protocols = {
  [v1: string]: {
    [key: string]: Protocol;
  };
};

type VerifiedPasetoToken = {
  message: unknown;
  footer: string | undefined;
}

/**
 * Local purposes should implement encrypt & decrypt methods
 */
interface LocalPurpose {
  version: string;
  purpose: string;
  encrypt: (payload: Record<string, unknown>, footer: string) => void;
  decrypt: () => void;
  generateKey: () => void;
}

/**
 * Public purposes should implement sign & verify methods
 */
interface PublicPurpose {
  version: string;
  purpose: string;
  signatureLength: number;
  sign: (payload: Record<string, unknown>, footer: string) => Promise<string>;
  verify: (rawToken: string) => Promise<VerifiedPasetoToken>;
  generateKey: () => Promise<void>;
}

/**
 * The base protocol object, created for each version and purpose.
 * @param {string} version - The version of the protocol object.
 * @param {string} purpose - The purpose of the protocol object.
 */
class BaseProtocol {
  version: string;
  purpose: string;

  constructor(version: string, purpose: string) {
    this.version = version;
    this.purpose = purpose;
  }
}

/** Defines the WebAPI Crypto Key type required for a given usage. */
const REQUIRED_KEY_TYPE: Record<string, string> = {
  "verify": "public",
  "sign": "private",
  "decrypt": "secret",
  "encrypt": "secret",
};

/** Constant values defining the properties of each supported protocol. */
const PROTOCOLS: Protocols = {
  v1: {
    local: {
      type: "secret",
      algorithm: {
        name: "AES-CTR",
        length: 256,
      },
    },
    public: {
      type: { privateKey: "private", publicKey: "public" },
      algorithm: {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-384" },
      },
      pss: {
        name: "RSA-PSS",
        saltLength: 48,
      },
    },
  },
};

export { BaseProtocol, REQUIRED_KEY_TYPE, PROTOCOLS };
export type { LocalPurpose, PublicPurpose, VerifiedPasetoToken };

