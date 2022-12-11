import { ProviderError, VerificationError } from "../error/mod.ts";

function isObject(input: unknown): boolean {
  return input?.constructor === Object;
}

function isString(input: unknown): boolean {
  return typeof input === "string";
}

function isDate(input: unknown): boolean {
  return input?.constructor === Date && !isNaN(input);
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

const REGISTERED_CLAIMS_TYPES: Record<string, string> = {
  "iss": "string",
  "sub": "string",
  "aud": "string",
  "exp": "date",
  "nbf": "date",
  "iat": "date",
  "jti": "string",
};

const CLAIMS_VALIDATOR: Record<string, Function> = {
  "string": isString,
  "date": isDate,
};

/**
 * Checks that message is an object and denies registered claims being set manually
 * @see {@link https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/04-Claims.md
 */
function validateMessage(input: unknown): string {
  if (!isObject(input)) throw new ProviderError("Payloads must be an object.");
  const now = new Date();
  const defaultExp = new Date(now);
  defaultExp.setMinutes(defaultExp.getMinutes() + 10);

  // Set default claims for safety purposes
  const registeredClaims: Record<string, string> = {
    "exp": defaultExp.toISOString(),
    "iat": now.toISOString(),
  };

  for (const [key, value] of Object.entries(<object> input)) {
    // Null is not allowed for any registeredClaims, so null
    // can be used to empty out default values
    if (key in REGISTERED_CLAIMS_TYPES) {
      if (value === null) {
        delete (<Record<string, unknown>> input)[key];
        delete registeredClaims[key];
        continue;
      }
      const t = REGISTERED_CLAIMS_TYPES[key];
      if (CLAIMS_VALIDATOR[t](value)) {
        registeredClaims[key] = t === "date" ? value.toISOString() : value;
      }
    }
  }

  try {
    return JSON.stringify({ ...(<object> input), ...registeredClaims });
  } catch {
    throw new ProviderError("Payloads must be a JSON-serializable object.");
  }
}

function validateFooter(input: string) {
  if (!isString(input)) {
    throw new ProviderError("Footer must be a string.");
  }
  return input;
}

export { isObject, isString, validateFooter, validateHeader, validateMessage };
