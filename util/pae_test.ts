import {
  assertEquals,
  assertThrows
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { ProviderError } from "../error/mod.ts";
import { PAE } from "./pae.ts";

Deno.test("[Util][Happy] PAE Empty Array", () => {
  assertEquals(
    PAE([]),
    new Uint8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]),
  );
});

Deno.test("[Util][Happy] PAE Array with empty string", () => {
  assertEquals(
    PAE([""]),
    new Uint8Array([
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]),
  );
});

Deno.test("[Util][Happy] PAE Array with 'test'", () => {
  assertEquals(
    PAE(["test"]),
    new Uint8Array([
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      4,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      115,
      116,
    ]),
  );
});

Deno.test("[Util][Unhappy] Value cannot be processed", () => {
  assertThrows(
    () => {
      PAE("test");
    },
    ProviderError,
    "Signing failed at PAE; expected an array.",
  );
});
