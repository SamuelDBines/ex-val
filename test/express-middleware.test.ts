import { describe, it, expect } from 'vitest';
import { validate, v } from '../src/index';

function mockRes() {
	const res: any = {};
	res.statusCode = 200;
	res.body = undefined;
	res.status = (code: number) => {
		res.statusCode = code;
		return res;
	};
	res.json = (body: any) => {
		res.body = body;
		return res;
	};
	return res;
}

describe('validate() middleware', () => {
	it('passes and assigns validated body', () => {
		const Body = v.object({ name: v.string().min(1) });

		const mw = validate({ body: Body });
		const req: any = { body: { name: 'A' }, query: {}, params: {} };
		const res = mockRes();

		let nextCalled = false;
		mw(req, res as any, () => {
			nextCalled = true;
		});

		expect(nextCalled).toBe(true);
		expect(req.body.name).toBe('A');
		expect(res.statusCode).toBe(200);
	});

	it('returns 400 on validation errors', () => {
		const Body = v.object({ name: v.string().min(2) });

		const mw = validate({ body: Body });
		const req: any = { body: { name: 'A' }, query: {}, params: {} };
		const res = mockRes();

		let nextCalled = false;
		mw(req, res as any, () => {
			nextCalled = true;
		});

		expect(nextCalled).toBe(false);
		expect(res.statusCode).toBe(400);
		expect(res.body?.error).toBe('VALIDATION_ERROR');
		expect(Array.isArray(res.body?.details)).toBe(true);
	});
});
