interface ILocalPurpose {
  version: string;
  purpose: string;
  encrypt: (payload: Record<string, unknown>, footer: string) => void;
  decrypt: () => void;
  generateKey: () => void;
}

interface IPublicPurpose {
  version: string;
  purpose: string;
  signatureLength: number;
  sign: (payload: Record<string, unknown>, footer: string) => Promise<string>;
  verify: (rawToken: string) => Promise<IVerifiedPasetoToken>;
  generateKey: () => Promise<void>;
}

interface IVerifiedPasetoToken {
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

const V1_PUBLIC_EXPONENT = new Uint8Array([0x01, 0x00, 0x01]);

interface IProtocol {
  type: string;
  algorithm: RsaHashedKeyAlgorithm | AesKeyAlgorithm;
  pss?: RsaPssParams;
}

type SupportedProtocols = {
  [v1: string]: {
    [key: string]: IProtocol;
  };
};

const SUPPORTED_PROTOCOLS: SupportedProtocols = {
  v1: {
    local: {
      type: "secret",
      algorithm: {
        name: "AES-CTR",
        length: 256,
      },
    },
    public: {
      type: "keyPair",
      algorithm: {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: V1_PUBLIC_EXPONENT,
        hash: { name: "SHA-384" },
      },
      pss: {
        name: "RSA-PSS",
        saltLength: 48,
      },
    },
  },
};

const REQUIRED_KEY_TYPE: Record<string, string> = {
  "verify": "public",
  "sign": "private",
  "decrypt": "secret",
  "encrypt": "secret",
};

export { BaseProtocol, REQUIRED_KEY_TYPE, SUPPORTED_PROTOCOLS };
export type { ILocalPurpose, IPublicPurpose, IVerifiedPasetoToken };

