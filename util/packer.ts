import { urlSafeBase64 } from "./url_safe_b64.ts";

function u8_concat(...arrs: Uint8Array[]) {
  let len = 0;
  for (const arr of arrs) {
    if (arr.length) {
      len += arr.length;
    }
  }
  const u8 = new Uint8Array(len);
  let start = 0;
  for (const arr of arrs) {
    u8.set(arr, start);
    start += arr.length;
  }
  return u8;
}

function packer(
  h: string,
  encoded_message: Uint8Array,
  signature: ArrayBuffer,
  f: string,
) {
  const p = u8_concat(encoded_message, new Uint8Array(signature));
  let ps = "";

  // Build URL Safe b64 string from u8
  const len = p.byteLength;
  for (let i = 0; i < len; i++) {
    ps += String.fromCharCode(p[i]);
  }

  const payload = urlSafeBase64(btoa(ps));

  if (f.length > 0) {
    return [h, payload, urlSafeBase64(f)].join(".");
  }

  return [h, payload].join(".");
}

export { packer };
