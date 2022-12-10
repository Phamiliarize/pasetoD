
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
  verify: (rawToken: string) => Promise<boolean>;
  generateKey: () => Promise<void>;
}

interface IPasetoToken {
    version: string;
    purpose: string;
    payload: unknown;
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

const SUPPORTED_PROTOCOLS = {
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
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-384" },
      },
      pss: {
        name: "RSA-PSS",
        saltLength: 48,
      }
    },
  },
};

// /** Confirm a supported key is being used */
// function checkKey(version: string, purpose: string, key: CryptoKey) {
//   const protocol = SUPPORTED_PROTOCOLS[version][purpose];
//   if(purpose === "local"){
//     // Check Key Type, Algorithm
//     if(protocol.type !== key.type) {
//       throw new ProviderError(
//         `Providers key is not valid for paseto protocol version ${version}.`,
//       );
//     }
//   }


//   if(purpose === "public"){
//   }

//   if


//   key.type
//   key.algorithm
//   key.usages


//   if (!VERSION[purpose]) {
//     throw new ProviderError(
//       `Providers key is not valid for paseto protocol version ${version}.`,
//     );
//   }
// }

export { BaseProtocol, SUPPORTED_PROTOCOLS, V1_PUBLIC_EXPONENT };
export type { ILocalPurpose, IPublicPurpose };

