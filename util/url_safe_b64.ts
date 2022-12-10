const B64_TO_NORMAL: Record<string, string> = {
  "-": "+",
  "_": "/",
};

const B64_TO_URL_SAFE: Record<string, string> = {
  "+": "-",
  "/": "_",
  "=": "",
};

/** Convert a URL Safe Base64 value to a normal base64 */
function normalizeURLSafeBase64(URLSafeB64: string) {
  // Replace safe characters for normal characters
  return URLSafeB64.replace(/[-_]/g, (m) => B64_TO_NORMAL[m]);
}

/** Convert a normal base64 string to a URL Safe base64*/
function urlSafeBase64(NormalB64: string) {
  // Replace URL unsafe characters with their safe alternatives + remove padding
  return NormalB64.replace(/[+/]/g, (m) => B64_TO_URL_SAFE[m]);
}

export { normalizeURLSafeBase64, urlSafeBase64 };
