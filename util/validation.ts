import { ProviderError, VerificationError } from "../error/mod.ts";
import { REQUIRED_KEY_TYPE } from "../protocol/common.ts";

function isObject(input: object) {
  return !!input && input.constructor === Object;
}

function isString(input: string) {
  return typeof input === "string";
}

function validatePayload(input: object) {
  if (!isObject(input)) {
    throw new ProviderError("Payloads must be an object.");
  }
  return input;
}

function validateFooter(input: string) {
  if (!isString(input)) {
    throw new ProviderError("Footer must be a string.");
  }
  return input;
}

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

export {
  isObject,
  validateFooter,
  validateHeader,
  validateKeyUsage,
  validatePayload,
};
