# @ex/val

A small, type-safe validation library for Express APIs.

@ex/val lets you define schemas once and use them for:

- runtime validation
- TypeScript inference
- Express middleware
- OpenAPI (Swagger) generation

It’s intentionally minimal and avoids pulling in large dependencies.

## Why this exists

Most validation libraries solve only part of the problem:

- runtime validation but weak typing
- good typing but no Express integration
- validation duplicated again for OpenAPI

@ex/val is built around a simple idea:

define a schema once, then reuse it everywhere.

No decorators, no code generation step, no magic.

Features

- Type-first schema definitions
- Runtime validation with readable errors
- Express middleware out of the box
- OpenAPI 3.1 schema generation
- Small API surface
- Minimal runtime dependencies

## Installation

```bash
pnpm add @ex/val
```

# or

```bash
npm install @ex/val
```

### Basic usage

#### Defining a schema

```ts
import { v } from '@ex/val';

const CreateUser = v.object({
	email: v.string().email(),
	name: v.string().min(1).max(80),
	age: v.number().int().positive().optional(),
	active: v.boolean(),
});
```

#### Validating values directly

```ts
const result = CreateUser.validate({
	email: 'a@b.com',
	name: 'Alice',
	active: true,
});

if (!result.ok) {
	console.error(result.errors);
} else {
	console.log(result.value); // fully typed
}
```

### Express integration

#### As middleware

```ts
import express from 'express';
import { validate, v } from '@ex/val';

const app = express();
app.use(express.json());

app.post('/users', validate({ body: CreateUser }), (req, res) => {
	res.json({ ok: true, user: req.body });
});
```

If validation fails, the middleware returns a 400 response with structured errors.

### Schema types

#### Strings

```ts
v.string()
	.min(3)
	.max(50)
	.length(10)
	.regex(/^[a-z]+$/)
	.email();
```

#### Numbers

```ts
v.number().min(0).max(100).positive().negative().int();
```

Note: JavaScript only has number. float() and double() are semantic aliases.

#### Booleans

```ts
v.boolean();
```

#### Arrays

```ts
v.array(v.string().min(1)).min(1).max(5);
```

#### Objects

```ts
v.object({
	id: v.number().int(),
	name: v.string(),
	tags: v.array(v.string()).optional(),
});
```

#### Strict mode

```ts
v.object({ a: v.string() }).strict();
```

Rejects unknown keys.

Optional and nullable

```ts
v.string().optional();
v.number().nullable();
```

## OpenAPI (Swagger)

@ex/val can emit OpenAPI 3.1 schemas directly from your validation definitions.

Example

```ts
import { openapi, v } from '@ex/val';

const Ok = v.object({ ok: v.boolean() });

const spec = openapi({
	title: 'Example API',
	version: '1.0.0',
	routes: [
		openapi.route({
			method: 'post',
			path: '/users',
			requestBody: CreateUser,
			responses: {
				200: Ok,
			},
		}),
	],
});
```

Serve it however you like:

```ts
app.get('/openapi.json', (_req, res) => {
	res.json(spec);
});
```

You can plug this into Swagger UI, Redoc, or any OpenAPI-compatible tooling.

Error format

Validation errors are returned as an array:

```json
{
	"error": "VALIDATION_ERROR",
	"details": [
		{
			"path": ["body", "email"],
			"code": "email",
			"message": "Invalid email"
		}
	]
}
```

The format is stable and intended to be consumed by clients.

Design goals

predictable behavior

readable code

minimal surface area

no hidden global state

no build-time code generation

If something can’t be explained in a few lines of code, it probably doesn’t belong here.

Non-goals

ORM integration

automatic route discovery

decorators or reflection

browser validation

opinionated error formatting

## License

MIT
