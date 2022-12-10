import { ProviderError } from "../error/mod.ts";

const encoder = new TextEncoder();

function le64(count: number) {
  if (!Number.isSafeInteger(count)) {
    throw new ProviderError(
      "Message is too large for JavaScript to safely process.",
    );
  }

  const high = (count / 0x100000000) | 0;
  const low = (count & 0x0ffffffff);
  const out = new Uint8Array(8);
  out[0] = low & 0xff;
  out[1] = (low >>> 8) & 0xff;
  out[2] = (low >>> 16) & 0xff;
  out[3] = (low >>> 24) & 0xff;
  out[4] = high & 0xff;
  out[5] = (high >>> 8) & 0xff;
  out[6] = (high >>> 16) & 0xff;
  out[7] = (high >>> 24) & 0xff;
  return out;
}

function PAE(pieces: (string | Uint8Array | undefined)[]) {
  if (!Array.isArray(pieces)) {
    throw new ProviderError("Signing failed at PAE; expected an array.");
  }

  let output = le64(pieces.length);

  for (const piece of pieces) {
    const p: Uint8Array = piece instanceof Uint8Array
      ? piece
      : encoder.encode(piece);
    const len = le64(p.length);
    output = new Uint8Array([...output, ...len, ...p]);
  }

  return output;
}

export { PAE };
