import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { normalizeURLSafeBase64, urlSafeBase64 } from "./url_safe_b64.ts";

const URL_SAFE = "bG9yZW0gaXBzdW0gZWFzdGVyIGVnZ3kgYn__d-XQgYWxs--IG92Z_XI";
const NORMAL = "bG9yZW0gaXBzdW0gZWFzdGVyIGVnZ3kgYn//d+XQgYWxs++IG92Z/XI";

Deno.test("[Util][Happy] Convert a normal b64 srring to URL Safe", () => {
  assertEquals(urlSafeBase64(NORMAL), URL_SAFE);
});

Deno.test("[Util][Happy] Convert a URL Safe b64 string to normal b64", () => {
  assertEquals(normalizeURLSafeBase64(URL_SAFE), NORMAL);
});
