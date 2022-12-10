import { ProviderError } from "../error/mod.ts";

function isObject(input: object) {
  return !!input && input.constructor === Object;
}

function isString(input: string) {
  return typeof input === 'string';
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

export { isObject, validatePayload, validateFooter };
