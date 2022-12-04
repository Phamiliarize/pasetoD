import { BaseProtocol, ILocalPurpose, IPublicPurpose } from "./common.ts";

/** Implements a local paseto provider for protocol v1 */
class V1Local extends BaseProtocol implements ILocalPurpose {
  /**
   * Create a paseto local provider for protocol v1
   * @param {string | undefined } private_key - Initialize with an already existing private key
   */
  private_key: string | undefined;

  constructor() {
    super("v1", "local");
    this.private_key = undefined;
  }

  generateKey(): void {
    console.log("develop an app");
  }

  encrypt(): void {
    console.log("develop an app");
  }

  decrypt(): void {
    console.log("develop an app");
  }
}

/** Implements a public paseto public provider under protocol v1 */
class V1Public extends BaseProtocol implements IPublicPurpose {
  /**
   * Create a paseto provider for protocol v1
   * @param {string | undefined} private_key - Initialize with an already existing private key
   * @param {string | undefined} public_key  - Initialize with an already existing private key
   */

  private_key: string | undefined;
  public_key: string | undefined;
  signatureLength: number;

  constructor() {
    super("v1", "public");
    this.private_key = undefined;
    this.public_key = undefined;
    this.signatureLength = 256;
  }

  generateKey(): void {
    console.log("develop an app");
  }

  sign(): void {
    console.log("develop an app");
  }

  verify(): void {
    console.log("develop an app");
  }
}

export { V1Local, V1Public };
