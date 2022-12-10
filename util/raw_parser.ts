import { InvalidToken } from "../error/mod.ts";
import { normalizeURLSafeBase64 } from "../util/url_safe_b64.ts";

type VersionData = {
  "sigLength": number;
  "purpose": string[];
};
const SUPPORTED_VERSIONS: Record<string, VersionData> = {
  "v1": {
    "sigLength": 256,
    "purpose": ["local", "public"],
  },
  "v2": {
    "sigLength": 64,
    "purpose": ["local", "public"],
  },
  "v3": {
    "sigLength": 96,
    "purpose": ["local", "public"],
  },
  "v4": {
    "sigLength": 64,
    "purpose": ["local", "public"],
  },
};

type ParsedPaseto = {
  version: string;
  purpose: string;
  payload: unknown;
  footer: string | undefined;
  raw?: {
    payload: string;
    signatureBytes: Uint8Array;
  };
};

/**
 * Parses a paseto token but does NOT verify it.
 * [WARNING] A parsed paseto IS NOT a verified token.
 * This is intended for internal usage.
 */
function _parse_raw_token(token: string): ParsedPaseto {
  // Tokens must be UTF-8 strings
  if (typeof token !== "string") {
    throw new InvalidToken("Token is not a valid string.");
  }

  const { 0: version, 1: purpose, 2: payload, 3: footer, length } = token.split(
    ".",
  );

  if (!version || !purpose || !payload || length > 4) {
    throw new InvalidToken(
      "Token is malformed and does not conform to paseto specifications.",
    );
  }

  if (!SUPPORTED_VERSIONS[version]) {
    throw new InvalidToken("The designated paseto version is unsupported.");
  }

  if (!SUPPORTED_VERSIONS[version].purpose.includes(purpose)) {
    throw new InvalidToken("The designated paseto purpose is unsupported.");
  }

  const result: ParsedPaseto = {
    version,
    purpose,
    payload: undefined,
    footer: undefined,
  };

  // If present, pasetoD expects a footer to be base64-encoded
  if (footer) {
    try {
      result.footer = atob(normalizeURLSafeBase64(footer));
    } catch {
      throw new InvalidToken(
        "Token footer is not a valid base64-encoded string.",
      );
    }
  }

  if (purpose === "local") {
    return result;
  }

  const sigLength = SUPPORTED_VERSIONS[version].sigLength;
  let rawPayload;
  let signature;
  try {
    // atob does not support URLSafe Base64
    let b64Decoded = atob(normalizeURLSafeBase64(payload));
    rawPayload = b64Decoded.slice(0, -sigLength);
    signature = b64Decoded.slice(-sigLength);
  } catch {
    throw new InvalidToken(
      "Token payload is not a valid base64-encoded string.",
    );
  }

  try {
    // Save the "raw" values for use in verification
    result.raw = {
      payload: rawPayload,
      signatureBytes: Uint8Array.from(signature, (x) => {
        return x.charCodeAt(0);
      }),
    };
  } catch {
    throw new InvalidToken(
      "Token payload and signature is invalid.",
    );
  }

  try {
    result.payload = JSON.parse(rawPayload);
  } catch {
    throw new InvalidToken("Token payload is not valid JSON.");
  }

  return result;
}

export { _parse_raw_token };
