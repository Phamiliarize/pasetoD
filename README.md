# pasetoD (WIP)

Zero-dependency Deno solution for working with
[Paseto tokens](https://github.com/paseto-standard/paseto-spec) in Web Crypto
API/Web Standards compatible runtimes.

**NOTE:** !!!This is an unstable, WIP implementation. Do not use this in any
REAL WORLD cases yet.

Generate and check PASETO in just __5__ lines:
```js
import { v1 } from "./mod.ts";

const v1PublicProvider = v1.public();
await v1PublicProvider.generateKey();
let token = await v1PublicProvider.sign({ "hi": "there" });
let verifiedToken = await test.verify(token);
```

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

### Basics

For each paseto protocol version, pasetoD implements the `local` and `public` purposes separately as a "provider" instance.

```js
import { v1 } from "./mod.ts";

const v1PublicProvider = v1.public(); // Creates a v1 public purpose provider instance
```

You can generate a key at runtime or [import a key via Crypto Web API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey).

```js
import { v1 } from "./mod.ts";

// Create a provider and generate a key for it at runtime
const v1PublicProvider = v1.public();
await v1PublicProvider.generateKey();


// Import a SubtleCrypto Web API key/key pair
const v1PublicProvider = v1.public(MY_KEY);
```

Note that an instance can only ever have one key (local)/key pair(public), and once a key is initialized the key *__cannot__* be changed.

Once a provider is initialized, you can use it's purpose-specific methods:
- Local: `encrypt` & `decrypt`
- Public: `sign` & `verify`

For example:
```js
let token = await v1PublicProvider.sign({ "hi": "there" }); // Generate a new signed token
let verifiedToken = await test.verify(token); // Verify the token
```

If your key is not appropriate to the given protocol and purpose, these actions will raise an error.


### Claims

The paseto specification designates some top-level message keys as
[registered claims](https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/04-Claims.md).

While validating `message` input on `sign` or `encrypt` actions, pasetoD will perform basic validation of registered claims according to the specifications found above.

The following claims also have default values:
- `exp`: 
- `iat`: 

This is done as a precaution to avoid accidentally issuing a token that never expires since paseto tokens have no revocation method natively.

If you are confident for some reason that you do not need these values, you can pass `null` to remove them from the payload.

### Exporting Keys

If you generate a key at runtime but wish to use it again, since keys are implemented through the Crypto Web API, they can be
[exported](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey).

Depending on the purpose of your provider:
- `local` : `<provider instance>` (symmetric secret key)
- `public` : `<provider instance>` (asymmetric key pair)


## Contributions

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
