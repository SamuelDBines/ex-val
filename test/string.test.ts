import { describe, it, expect } from 'vitest';
import { v } from '../src/index';

describe('string()', () => {
	it('validates email + min/max', () => {
		const S = v.string().email().min(3).max(50);

		expect(S.validate('a@b.com').ok).toBe(true);
		expect(S.validate('x').ok).toBe(false);
		expect(S.validate('not-an-email').ok).toBe(false);
	});

	it('regex()', () => {
		const S = v.string().regex(/^[a-z]+$/);

		expect(S.validate('abc').ok).toBe(true);
		expect(S.validate('abc123').ok).toBe(false);
	});
});

describe('number()', () => {
	it('int + positive', () => {
		const N = v.number().int().positive();

		expect(N.validate(1).ok).toBe(true);
		expect(N.validate(0).ok).toBe(false);
		expect(N.validate(-1).ok).toBe(false);
		expect(N.validate(1.2).ok).toBe(false);
	});

	it('min/max', () => {
		const N = v.number().min(10).max(20);

		expect(N.validate(10).ok).toBe(true);
		expect(N.validate(21).ok).toBe(false);
	});
});
