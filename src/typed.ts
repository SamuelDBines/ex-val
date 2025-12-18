import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Infer, Schema } from './types';

export function withBody<S extends Schema<any>>(
	schema: S,
	handler: (
		req: Request & { body: Infer<S> },
		res: Response,
		next: NextFunction
	) => any
): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) =>
		handler(req as any, res, next);
}
