import type { Result, Schema } from './types';

export function boolean(): Schema<boolean> {
	const self: any = {
		kind: 'boolean',
		validate(input: unknown, path: (string | number)[] = []): Result<boolean> {
			if (typeof input !== 'boolean') {
				return {
					ok: false,
					errors: [{ path, code: 'type', message: 'Expected boolean' }],
				};
			}
			return { ok: true, value: input };
		},
		optional() {
			return optional(self);
		},
		nullable() {
			return nullable(self);
		},
		toOpenAPI() {
			return { type: 'boolean' };
		},
	};

	return self;
}

function optional<T>(inner: Schema<T>): Schema<T | undefined> {
	return {
		kind: `${inner.kind}.optional`,
		validate(input, path = []) {
			return input === undefined
				? { ok: true, value: undefined }
				: inner.validate(input, path);
		},
		optional() {
			return this;
		},
		nullable() {
			return nullable(this);
		},
		toOpenAPI() {
			return inner.toOpenAPI();
		},
	};
}

function nullable<T>(inner: Schema<T>): Schema<T | null> {
	return {
		kind: `${inner.kind}.nullable`,
		validate(input, path = []) {
			return input === null
				? { ok: true, value: null }
				: inner.validate(input, path);
		},
		optional() {
			return optional(this);
		},
		nullable() {
			return this;
		},
		toOpenAPI() {
			return { anyOf: [inner.toOpenAPI(), { type: 'null' }] };
		},
	};
}
