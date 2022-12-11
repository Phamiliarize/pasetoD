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

### Basic Example

Let's generate a `v1.public` paseto token.

```js
import { v1 } from "./mod.ts";

const v1PublicProvider = v1.public(); // Create a new provider
await v1PublicProvider.generateKey(); // Generate a new key
let token = await v1PublicProvider.sign({ "hi": "there" }); // Generate a new signed token
let verifiedToken = await test.verify(token); // Verify the token
```

### Claims

The paseto specification designates some top-level payload keys as
[registered claims](https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/04-Claims.md).

While validating `message` input on `sign` or `encrypt` actions, pasetoD will perform basic validation of registered claims.

Registered claims are optional and are not set at default with the exception
of:
- `exp`: 
- `iat`: 

This exception was made to provide a safer API that prevents issuing a token that never expires as paseto tokens have no revocation method natively.

If you are confident for some reason that you do not need these values, you can pass `null` to remove them from the payload.

### Importing a Key

Providers can be initialized on a key of your choosing, rather than generating
one on-the-fly from the provider.

```js
import { v1 } from "./mod.ts";
const v1PublicProvider = v1.public(MY_KEY);
```

Keys must be **SubtleCrypto Web API** compatible and must implement against the supported protocol details found in `utils/common.ts`.

You may find the
[importKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey)
function useful.

### Exporting Keys

Since keys are implemented through the Crypto Web API, they can be
[exported](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey).

`local` purpose providers store the symmetric key as
`<provider instance>.secret` and `public` providers store they asymmetric
`<provider instance>.keyPair`.

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
