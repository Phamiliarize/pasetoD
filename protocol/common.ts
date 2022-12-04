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

export { BaseProtocol };
export type { ILocalPurpose, IPublicPurpose };
