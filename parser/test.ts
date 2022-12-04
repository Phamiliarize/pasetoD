import {
  assertEquals,
  assertThrows
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { InvalidToken } from "../error/mod.ts";
import { _parse } from "./mod.ts";

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
  const paseto = _parse(LOCAL_TOKEN);
  assertEquals(paseto, {
    version: "v2",
    purpose: "local",
    payload: undefined,
    footer: undefined,
  });
});

Deno.test("[Parser][Happy] Parse a local token w/ footer", () => {
  const paseto = _parse(LOCAL_TOKEN + FOOTER);
  assertEquals(paseto, {
    version: "v2",
    purpose: "local",
    payload: undefined,
    footer: "hello world",
  });
});

Deno.test("[Parser][Happy] Parse a public token", () => {
  const paseto = _parse(PUBLIC_TOKEN);
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
  const paseto = _parse(PUBLIC_TOKEN + FOOTER);
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
    () => _parse(42),
    InvalidToken,
    "Token is not a valid string.",
  );
});

Deno.test("[Parser][Unhappy] Empty Token Fails", () => {
  assertThrows(
    () => _parse(""),
    InvalidToken,
    "Token is malformed and does not conform to paseto specifications.",
  );
});

Deno.test("[Parser][Unhappy] Partial Token Fails", () => {
  assertThrows(
    () => _parse("v2.public"),
    InvalidToken,
    "Token is malformed and does not conform to paseto specifications.",
  );
});

Deno.test("[Parser][Unhappy] Bad Version", () => {
  assertThrows(
    () => _parse(BAD_VER_TOKEN),
    InvalidToken,
    "The designated paseto version is unsupported.",
  );
});

Deno.test("[Parser][Unhappy] Bad Purpose", () => {
  assertThrows(
    () => _parse(BAD_PURPOSE_TOKEN),
    InvalidToken,
    "The designated paseto purpose is unsupported.",
  );
});

Deno.test("[Parser][Unhappy] Bad Footer - not b64", () => {
  assertThrows(
    () => _parse(PUBLIC_TOKEN + ".undefined"),
    InvalidToken,
    "Token footer is not a valid base64-encoded string.",
  );
});

Deno.test("[Parser][Unhappy] Bad Payload - not b64", () => {
  assertThrows(
    () => {
      const { 0: version, 1: purpose } = PUBLIC_TOKEN.split(".");
      _parse(`${version}.${purpose}.undefined`);
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
      _parse(`${version}.${purpose}${FOOTER}`);
    },
    InvalidToken,
    "Token payload is not valid JSON.",
  );
});
