import { ProviderError } from "../error/mod.ts";

interface ILocalPurpose {
  version: string;
  purpose: string;
  encrypt: () => void;
  decrypt: () => void;
  generateKey: () => void;
}

interface IPublicPurpose {
  version: string;
  purpose: string;
  signatureLength: number;
  sign: () => void;
  verify: () => void;
  generateKey: () => void;
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

type VersionKeyMap = Record<string, {
  local: {
    type: "secret";
    algorithm: AesKeyGenParams;
  };
  public: {
    publicKey: {
      type: "public";
      algorithm: RsaHashedKeyGenParams;
    };
    privateKey: {
      type: "private";
      algorithm: RsaHashedKeyGenParams;
    };
  };
}>;

const V1_PUBLIC_EXPONENT = new Uint8Array([0x01, 0x00, 0x01]);

const SUPPORTED_PROTOCOLS: Record<string, VersionKeyMap> = {
  v1: {
    local: {
      type: "secret",
      algorithm: {
        name: "AES-CTR",
        length: 256,
      },
    },
    public: {
      privateKey: {
        type: "private",
        algorithm: {
          name: "RSA-PSS",
          modulusLength: 2048,
          publicExponent: V1_PUBLIC_EXPONENT,
          hash: { name: "SHA384" },
        },
      },
      publicKey: {
        type: "public",
        algorithm: {
          name: "RSA-PSS",
          modulusLength: 2048,
          publicExponent: V1_PUBLIC_EXPONENT,
          hash: { name: "SHA384" },
        },
      },
    },
  },
};

/** Confirm a supported key is being used */
function checkKey(version: string, purpose: string, key: CryptoKey) {
  const VERSION = SUPPORTED_PROTOCOLS[version]
  if(!VERSION){
    throw new ProviderError(`Providers key is not valid for paseto protocol version ${version}.`)
  }
  if(!VERSION[purpose])
}

export { BaseProtocol, SUPPORTED_PROTOCOLS, checkKey };
export type { ILocalPurpose, IPublicPurpose };

