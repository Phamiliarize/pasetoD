import {
  DecryptionError,
  InvalidToken,
  InvalidTokenClaim,
  PasetoDError,
  VerificationError,
} from "./error/mod.ts";
import { v1 as v1protocol } from "./protocol/mod.ts";
import { checkKeyVersion } from "./util/key.ts";

const v1 = {
  local: (key: undefined) => {
    if (key !== undefined) checkKeyVersion("v1", "local", key);
    return new v1protocol.local(key);
  },
  public: (key: undefined) => {
    if (key !== undefined) checkKeyVersion("v1", "public", key);
    return new v1protocol.public(key);
  },
};

// Export only "public" APIs for end users
export {
  DecryptionError,
  InvalidToken,
  InvalidTokenClaim,
  PasetoDError,
  v1,
  VerificationError,
};
