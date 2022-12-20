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

interface LocalPurpose {
  version: string;
  purpose: string;
  encrypt: (payload: Record<string, unknown>, footer: string) => void;
  decrypt: () => void;
  generateKey: () => void;
}

interface PublicPurpose {
  version: string;
  purpose: string;
  signatureLength: number;
  sign: (payload: Record<string, unknown>, footer: string) => Promise<string>;
  verify: (rawToken: string) => Promise<VerifiedPasetoToken>;
  generateKey: () => Promise<void>;
}

interface VerifiedPasetoToken {
  message: unknown;
  footer: string | undefined;
}

class BaseProtocol {
  /**
   * The base protocol object
   * @param {string} message - A human explanation for why go bad boom.
   */
  version: string;
  purpose: string;

  constructor(version: string, purpose: string) {
    this.version = version;
    this.purpose = purpose;
  }
}

/* Maps the usage against the required WebAPI Crypto Key type */
const REQUIRED_KEY_TYPE: Record<string, string> = {
  "verify": "public",
  "sign": "private",
  "decrypt": "secret",
  "encrypt": "secret",
};

//   v1 sigLength: 256,
//   v3 sigLength: 96,
//   v2/v4 siglength: 64,

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
