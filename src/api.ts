// api.ts
import type { Express, RequestHandler } from 'express';
import type { Schema } from './types';
import { validate } from './expressh';
import { openapi as buildOpenApi } from './openapi';
import { v } from './index';

type RouteDef = {
	method: 'get' | 'post' | 'put' | 'patch' | 'delete';
	path: string;
	body?: Schema<any>;
	query?: Schema<any>;
	params?: Schema<any>;
	responses?: Record<number, Schema<any>>;
};

export function createApi(app: Express) {
	const routes: RouteDef[] = [];

	function add(
		method: RouteDef['method'],
		path: string,
		def: Omit<RouteDef, 'method' | 'path'>,
		handler: RequestHandler
	) {
		routes.push({ method, path, ...def });
		const targets: any = {};
		if (def.body) targets.body = def.body;
		if (def.query) targets.query = def.query;
		if (def.params) targets.params = def.params;

		const mw = validate(targets);

		(app as any)[method](path, mw, handler);
	}

	return {
		get: (path: string, def: any, handler: RequestHandler) =>
			add('get', path, def, handler),
		post: (path: string, def: any, handler: RequestHandler) =>
			add('post', path, def, handler),
		put: (path: string, def: any, handler: RequestHandler) =>
			add('put', path, def, handler),
		patch: (path: string, def: any, handler: RequestHandler) =>
			add('patch', path, def, handler),
		delete: (path: string, def: any, handler: RequestHandler) =>
			add('delete', path, def, handler),

		openapi: (info: { title: string; version: string }) =>
			buildOpenApi({
				title: info.title,
				version: info.version,
				routes: routes.map((r) => {
					const out: any = {
						method: r.method,
						path: r.path,
						responses: r.responses ?? { 200: v.object({ ok: v.boolean() }) },
					};

					if (r.body) out.requestBody = r.body;
					return out;
				}),
			}),

		routes: () => routes.slice(),
	};
}
