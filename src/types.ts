export type Issue = {
	path: (string | number)[];
	message: string;
	code: string;
};

export type Result<T> = { ok: true; value: T } | { ok: false; errors: Issue[] };

export interface Schema<T> {
	readonly kind: string;
	validate(input: unknown, path?: (string | number)[]): Result<T>;
	optional(): Schema<T | undefined>;
	nullable(): Schema<T | null>;
	toOpenAPI(): any;
}

export type Infer<S> = S extends Schema<infer T> ? T : never;
