const CODES: Record<string, string> = {
  InvalidToken: "INVALID_TOKEN",
  InvalidTokenClaim: "INVALID_TOKEN_CLAIM",
  ProviderError: "PROVIDER_ERROR",
  DecryptionError: "DECRYPTION_ERROR",
  VerificationError: "VERIFICATION_ERROR",
};

/** Base error class for pasetoD */
class PasetoDError extends Error {
  /**
   * The base error for pasetoD
   * @param {string} message - A human explanation for why go bad boom.
   */
  code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = CODES[this.constructor.name];
    Error.captureStackTrace(this, this.constructor);
  }
}

class InvalidToken extends PasetoDError {}
class InvalidTokenClaim extends PasetoDError {}
class DecryptionError extends PasetoDError {}
class VerificationError extends PasetoDError {}
class ProviderError extends PasetoDError {}

export {
  DecryptionError,
  InvalidToken,
  InvalidTokenClaim,
  PasetoDError,
  ProviderError,
  VerificationError,
};
