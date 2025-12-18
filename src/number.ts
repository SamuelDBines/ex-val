import type { Issue, Result, Schema } from './types';

type NumMeta = {
	type: 'number' | 'integer';
	minimum?: number;
	maximum?: number;
	exclusiveMinimum?: number;
	exclusiveMaximum?: number;
};

export function number(): Schema<number> & {
	min(n: number): any;
	max(n: number): any;
	positive(): any;
	negative(): any;
	int(): any;
	float(): any;
	double(): any;
} {
	const meta: NumMeta = { type: 'number' };
	const checks: ((n: number) => Issue | null)[] = [];

	const self: any = {
		kind: 'number',

		validate(input: unknown, path: (string | number)[] = []): Result<number> {
			if (typeof input !== 'number' || Number.isNaN(input)) {
				return {
					ok: false,
					errors: [{ path, code: 'type', message: 'Expected number' }],
				};
			}

			const errors: Issue[] = [];
			for (const c of checks) {
				const issue = c(input);
				if (issue) errors.push({ ...issue, path });
			}

			return errors.length ? { ok: false, errors } : { ok: true, value: input };
		},

		min(n: number) {
			meta.minimum = n;
			checks.push((v) =>
				v < n ? { path: [], code: 'min', message: `Min ${n}` } : null
			);
			return self;
		},

		max(n: number) {
			meta.maximum = n;
			checks.push((v) =>
				v > n ? { path: [], code: 'max', message: `Max ${n}` } : null
			);
			return self;
		},

		positive() {
			meta.exclusiveMinimum = 0;
			checks.push((v) =>
				v > 0 ? null : { path: [], code: 'positive', message: 'Must be > 0' }
			);
			return self;
		},

		negative() {
			meta.exclusiveMaximum = 0;
			checks.push((v) =>
				v < 0 ? null : { path: [], code: 'negative', message: 'Must be < 0' }
			);
			return self;
		},

		int() {
			meta.type = 'integer';
			checks.push((v) =>
				Number.isInteger(v)
					? null
					: { path: [], code: 'int', message: 'Must be integer' }
			);
			return self;
		},

		// JS only has "number"; these are just semantics
		float() {
			return self;
		},
		double() {
			return self;
		},

		optional() {
			return optional(self);
		},
		nullable() {
			return nullable(self);
		},

		toOpenAPI() {
			const out: any = { ...meta };
			// clean up contradictory bounds if you want; kept simple here
			return out;
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
