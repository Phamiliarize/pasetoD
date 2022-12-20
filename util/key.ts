import { ProviderError } from "../error/mod.ts";
import { PROTOCOLS, REQUIRED_KEY_TYPE } from "../protocol/common.ts";

/* Algorithm Lucidity - since keys can be "imported" we should ensure the algorithm of a key matches our defined protocols. */
function checkKeyVersion(
  version: string,
  usage: string,
  key: CryptoKey | CryptoKeyPair | undefined,
): void {
  const protocol = PROTOCOLS[version][usage];
  const keyPairType = (<Record<string, string>> protocol.type);

  if (usage === "local") {
    // Check the key
    if (!(<CryptoKey> key)?.type) {
      throw new ProviderError(`Key is not a valid CryptoKey or CryptoKeyPair.`);
    }

    if ((<CryptoKey> key).type !== protocol.type) {
      throw new ProviderError(
        `Provider received unsupported key type.`,
      );
    }

    if ((<CryptoKey> key).algorithm !== protocol.algorithm) {
      throw new ProviderError(
        `Provider received unsupported key algorithm.`,
      );
    }
  }

  if (
    !(<CryptoKeyPair> key)?.privateKey?.type ||
    !(<CryptoKeyPair> key)?.publicKey?.type
  ) throw new ProviderError(`Key is not a valid CryptoKey or CryptoKeyPair.`);

  // To avoid issues with deep comparison/typings, cast to string
  const privateKey = {
    type: (<CryptoKeyPair> key).privateKey.type,
    algorithm: JSON.stringify((<CryptoKeyPair> key).privateKey.algorithm),
  };
  const publicKey = {
    type: (<CryptoKeyPair> key).publicKey.type,
    algorithm: JSON.stringify((<CryptoKeyPair> key).publicKey.algorithm),
  };

  if (usage === "public") {
    if (privateKey.type !== keyPairType.privateKey) {
      throw new ProviderError(
        `Provider received unsupported key type for private key.`,
      );
    }

    if (publicKey.type !== keyPairType.publicKey) {
      throw new ProviderError(
        `Provider received unsupported key type for public key.`,
      );
    }

    if (privateKey.algorithm !== JSON.stringify(protocol.algorithm)) {
      throw new ProviderError(
        `Provider received unsupported private key algorithm.`,
      );
    }

    if (publicKey.algorithm !== JSON.stringify(protocol.algorithm)) {
      throw new ProviderError(
        `Provider received unsupported public key algorithm.`,
      );
    }
  }
}

/* We should make sure the right keys are being used for a given purpose/usage. */
function checkKeyPurpose(
  usage: string,
  key: CryptoKey | undefined,
): void {
  if (!key) {
    throw new ProviderError(
      "Provider has no appropriate key set.",
    );
  }
  if (key.type !== REQUIRED_KEY_TYPE[usage]) {
    throw new ProviderError(
      `Provider key and usage mismatch. ${key.type} cannot be used to ${usage} tokens.`,
    );
  }
  if (!key.usages.includes(<KeyUsage> usage)) {
    throw new ProviderError(
      `Provider key and usage mismatch. Key usage definition does not include ${usage}.`,
    );
  }
}

export { checkKeyPurpose, checkKeyVersion };
