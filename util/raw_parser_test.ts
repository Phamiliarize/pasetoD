import {
  assertEquals,
  assertThrows
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { InvalidToken } from "../error/mod.ts";
import { _parse_raw_token } from "./raw_parser.ts";

const LOCAL_TOKEN =
  "v2.local.QAxIpVe-ECVNI1z4xQbm_qQYomyT3h8FtV8bxkz8pBJWkT8f7HtlOpbroPDEZUKop_vaglyp76CzYy375cHmKCW8e1CCkV0Lflu4GTDyXMqQdpZMM1E6OaoQW27gaRSvWBrR3IgbFIa0AkuUFw";
const PUBLIC_TOKEN =
  "v2.public.eyJleHAiOiIyMDM5LTAxLTAxVDAwOjAwOjAwKzAwOjAwIiwiZGF0YSI6InRoaXMgaXMgYSBzaWduZWQgbWVzc2FnZSJ91gC7-jCWsN3mv4uJaZxZp0btLJgcyVwL-svJD7f4IHyGteKe3HTLjHYTGHI1MtCqJ-ESDLNoE7otkIzamFskCA";
const FOOTER = ".aGVsbG8gd29ybGQ="; // HelloWorld
const BAD_VER_TOKEN =
  "20.public.eyJleHAiOiIyMDM5LTAxLTAxVDAwOjAwOjAwKzAwOjAwIiwiZGF0YSI6InRoaXMgaXMgYSBzaWduZWQgbWVzc2FnZSJ91gC7-jCWsN3mv4uJaZxZp0btLJgcyVwL-svJD7f4IHyGteKe3HTLjHYTGHI1MtCqJ-ESDLNoE7otkIzamFskCA";
const BAD_PURPOSE_TOKEN =
  "v2.glorious.eyJleHAiOiIyMDM5LTAxLTAxVDAwOjAwOjAwKzAwOjAwIiwiZGF0YSI6InRoaXMgaXMgYSBzaWduZWQgbWVzc2FnZSJ91gC7-jCWsN3mv4uJaZxZp0btLJgcyVwL-svJD7f4IHyGteKe3HTLjHYTGHI1MtCqJ-ESDLNoE7otkIzamFskCA";

Deno.test("[Parser][Happy] Parse a local token", () => {
  const paseto = _parse_raw_token(LOCAL_TOKEN, { version: "v2", purpose: "public", signatureLength: 64 });
  assertEquals(paseto, {
    version: "v2",
    purpose: "local",
    payload: undefined,
    footer: undefined,
  });
});

Deno.test("[Parser][Happy] Parse a local token w/ footer", () => {
  const paseto = _parse_raw_token(LOCAL_TOKEN + FOOTER, { version: "v2", purpose: "public", signatureLength: 64 });
  assertEquals(paseto, {
    version: "v2",
    purpose: "local",
    payload: undefined,
    footer: "hello world",
  });
});

Deno.test("[Parser][Happy] Parse a public token", () => {
  const paseto = _parse_raw_token(PUBLIC_TOKEN, { version: "v2", purpose: "public", signatureLength: 64 });
  assertEquals(paseto, {
    version: "v2",
    purpose: "public",
    payload: {
      exp: "2039-01-01T00:00:00+00:00",
      data: "this is a signed message",
    },
    footer: undefined,
  });
});

Deno.test("[Parser][Happy] Parse a public token w/ footer", () => {
  const paseto = _parse_raw_token(PUBLIC_TOKEN + FOOTER, { version: "v2", purpose: "public", signatureLength: 64 });
  assertEquals(paseto, {
    version: "v2",
    purpose: "public",
    payload: {
      exp: "2039-01-01T00:00:00+00:00",
      data: "this is a signed message",
    },
    footer: "hello world",
  });
});

Deno.test("[Parser][Unhappy] Passing Non-string token value", () => {
  assertThrows(
    () => _parse_raw_token(42, { version: "v2", purpose: "public", signatureLength: 64 }),
    InvalidToken,
    "Token is not a valid string.",
  );
});

Deno.test("[Parser][Unhappy] Empty Token Fails", () => {
  assertThrows(
    () => _parse_raw_token("", { version: "v2", purpose: "public", signatureLength: 64 }),
    InvalidToken,
    "Token is malformed and does not conform to paseto specifications.",
  );
});

Deno.test("[Parser][Unhappy] Partial Token Fails", () => {
  assertThrows(
    () => _parse_raw_token("v2.public", { version: "v2", purpose: "public", signatureLength: 64 }),
    InvalidToken,
    "Token is malformed and does not conform to paseto specifications.",
  );
});

Deno.test("[Parser][Unhappy] Bad Version", () => {
  assertThrows(
    () => _parse_raw_token(BAD_VER_TOKEN, { version: "v2", purpose: "public", signatureLength: 64 }),
    InvalidToken,
    "The designated paseto version is unsupported.",
  );
});

Deno.test("[Parser][Unhappy] Bad Purpose", () => {
  assertThrows(
    () => _parse_raw_token(BAD_PURPOSE_TOKEN, { version: "v2", purpose: "public", signatureLength: 64 }),
    InvalidToken,
    "The designated paseto purpose is unsupported.",
  );
});

Deno.test("[Parser][Unhappy] Bad Footer - not b64", () => {
  assertThrows(
    () => _parse_raw_token(PUBLIC_TOKEN + ".undefined", { version: "v2", purpose: "public", signatureLength: 64 }),
    InvalidToken,
    "Token footer is not a valid base64-encoded string.",
  );
});

Deno.test("[Parser][Unhappy] Bad Payload - not b64", () => {
  assertThrows(
    () => {
      const { 0: version, 1: purpose } = PUBLIC_TOKEN.split(".");
      _parse_raw_token(`${version}.${purpose}.undefined`, { version: "v2", purpose: "public", signatureLength: 64 });
    },
    InvalidToken,
    "Token payload is not a valid base64-encoded string.",
  );
});

Deno.test("[Parser][Unhappy] Bad Payload - b64 but not JSON", () => {
  // According to specification; payloads must be JSON object
  assertThrows(
    () => {
      const { 0: version, 1: purpose } = PUBLIC_TOKEN.split(".");
      _parse_raw_token(`${version}.${purpose}${FOOTER}`, { version: "v2", purpose: "public", signatureLength: 64 });
    },
    InvalidToken,
    "Token payload is not valid JSON.",
  );
});
