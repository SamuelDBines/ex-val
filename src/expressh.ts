import { RequestHandler, Request, Response, NextFunction } from 'express';
import { Schema } from './types';

type Targets = Partial<{
	body: Schema<any>;
	query: Schema<any>;
	params: Schema<any>;
}>;

export function validate<T extends Targets>(targets: T): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		const errors: any[] = [];

		if (targets.params) {
			const r = targets.params.validate(req.params, ['params']);
			if (r.ok) req.params = r.value;
			else errors.push(...r.errors);
		}
		if (targets.query) {
			const r = targets.query.validate(req.query, ['query']);
			if (r.ok) req.query = r.value;
			else errors.push(...r.errors);
		}
		if (targets.body) {
			const r = targets.body.validate(req.body, ['body']);
			if (r.ok) req.body = r.value;
			else errors.push(...r.errors);
		}

		if (errors.length)
			return res
				.status(400)
				.json({ error: 'VALIDATION_ERROR', details: errors });
		next();
	};
}
