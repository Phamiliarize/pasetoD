import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { isObject, isString } from "./validation.ts";

Deno.test("[Util][Happy] Classifies the input correctly as an object", () => {
  assertEquals(isObject({}), true);
  assertEquals(isObject({ "hello": "world" }), true);
});

Deno.test("[Util][Unhappy] Fails 'not true' objects", () => {
  assertEquals(isObject(() => {}), false);
  assertEquals(isObject(new Date()), false);
});

Deno.test("[Util][Happy] Classifies the input correctly as string", () => {
  assertEquals(isString("hello world"), true);
  assertEquals(isString(""), true); // Check empty string
});

Deno.test("[Util][Unhappy] Fails non-string values", () => {
  assertEquals(isString(42), false);
  assertEquals(isString(true), false);
  assertEquals(isString(null), false);
  assertEquals(isString(undefined), false);
});
