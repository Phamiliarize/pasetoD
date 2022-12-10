import { ProviderError, VerificationError } from "../error/mod.ts";
import { REQUIRED_KEY_TYPE } from "../protocol/common.ts";

function isObject(input: object) {
  return !!input && input.constructor === Object;
}

function isString(input: string) {
  return typeof input === "string";
}

/* Algorithm Lucidity - we should make sure the right keys are being used in the right places. */
function validateKeyUsage(
  usage: string,
  key: CryptoKey | undefined,
): void {
  if (!key) {
    throw new ProviderError(
      "The provider has no key pair and cannot be used to sign or verify tokens.",
    );
  }
  if (key.type !== REQUIRED_KEY_TYPE[usage]) {
    throw new ProviderError(
      `Provider key and usage mismatch. ${key.type} cannot be used to ${usage}.`,
    );
  }
  if (!key.usages.includes(<KeyUsage> usage)) {
    throw new ProviderError(
      `Provider key and usage mismatch. Key usage definition does not include ${usage}.`,
    );
  }
}

function validateHeader(
  providerVersion: string,
  providerPurpose: string,
  version: string,
  purpose: string,
): string {
  if (providerVersion !== version || providerPurpose !== purpose) {
    throw new VerificationError(
      `Token header is not valid, expected: ${version}.${purpose}`,
    );
  }

  return `${providerVersion}.${providerPurpose}`;
}

function validatePayload(input: object) {
  if (!isObject(input)) {
    throw new ProviderError("Payloads must be an object.");
  }
  return input;
}

/**
 * Denies top level claims being set manually
 * @see {@link https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/04-Claims.md
 */
function validateClaims(input: object) {
  const registeredClaims = ["iss", "sub", "aud", "exp", "nbf", "iat", "jti"];
  Object.keys(input)


  //   Key	Name	Type	Example
  // iss	Issuer	string	{"iss":"paragonie.com"}
  // sub	Subject	string	{"sub":"test"}
  // aud	Audience	string	{"aud":"pie-hosted.com"}
  // exp	Expiration	DateTime	{"exp":"2039-01-01T00:00:00+00:00"}
  // nbf	Not Before	DateTime	{"nbf":"2038-04-01T00:00:00+00:00"}
  // iat	Issued At	DateTime	{"iat":"2038-03-17T00:00:00+00:00"}
  // jti	Token Identifier	string	{"jti":"87IFSGFgPNtQNNuw0AtuLttPYFfYwOkjhqdWcLoYQHvL"}
}

function validateFooter(input: string) {
  if (!isString(input)) {
    throw new ProviderError("Footer must be a string.");
  }
  return input;
}

export {
  isObject,
  validateFooter,
  validateHeader,
  validateKeyUsage,
  validatePayload,
};
