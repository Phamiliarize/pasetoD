# pasetoD (WIP)

Zero-dependency Deno solution for working with
[Paseto tokens](https://github.com/paseto-standard/paseto-spec) in Web Crypto
API/Web Standards compatible runtimes.

**NOTE:** !!!This is an unstable, WIP implementation. Do not use this in any
REAL WORLD cases yet.

## Supported Platforms

- Deno (^1.27.2)

## Supported PASETO versions

Being Web Crypto API based has limitations, be aware that only the following is
supported:

|          | v1 | v2 | v3 | v4 |
| -------- | -- | -- | -- | -- |
| `local`  | ⛔  | ⛔  | ⛔  | ⛔  |
| `public` | ✅  | ⛔  | ⛔  | ⛔  |

## Usage

```js
import { v1 } from "./mod.ts";

const v1PublicProvider = new v1.public(); // Create a new provider
await v1PublicProvider.generateKey(); // Generate a new key
let token = await v1PublicProvider.sign({"hi":"there"}); // Generate a new signed token
let verifiedToken = await test.verify(token); // Verify the token
```

### Testing

pasetoD uses the "happy/unhappy" path mental model for testing. You must run
tests with `--no-check` since we want to test what happens when we pass bad
values.

Tests are tagged by `[module]` then `[Happy]`/`[Unhappy]` path. For example, to
run only happy path tests:

```
deno test --filter "[Happy]" --no-check
```

To run only `Parser` module tests:

```
deno test --filter "[Parser]" --no-check
```

For coverage, generate a report and then view it with:

```
deno test --coverage=cov_profile --no-check
deno coverage cov_profile
```

## Reference Implementations

In addition to the
[paseto specifications](https://github.com/paseto-standard/paseto-spec) the
following paseto implementations were referenced.

- [paragonie/paseto](https://github.com/paragonie/paseto)
- [paragonie/paseto-browser](https://github.com/paragonie/paseto-browser.js/blob/master/lib/util.js)
- [panva/paseto](https://github.com/sjudson/paseto.js/tree/master/lib)
