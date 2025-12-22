import type { Schema, HttpMethodType } from './types';
import { validate } from './validate';
import { openapi as buildOpenApi } from './openapi';
import { HttpMethod, v } from './index';

type RouteDef = {
	method: HttpMethodType;
	path: string;
	body?: Schema<any>;
	query?: Schema<URLSearchParams>;
	params?: Schema<Record<string, string>>;
	responses?: Record<number, Schema<any>>;
};

export function createApi(app: any) {
	const routes: RouteDef[] = [];

	function add(
		method: RouteDef['method'],
		path: string,
		def: Omit<RouteDef, 'method' | 'path'>,
		handler: any
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
		get: (path: string, def: any, handler: any) =>
			add(HttpMethod.GET, path, def, handler),
		post: (path: string, def: any, handler: any) =>
			add(HttpMethod.POST, path, def, handler),
		put: (path: string, def: any, handler: any) =>
			add(HttpMethod.PUT, path, def, handler),
		patch: (path: string, def: any, handler: any) =>
			add(HttpMethod.PATCH, path, def, handler),
		delete: (path: string, def: any, handler: any) =>
			add(HttpMethod.DELETE, path, def, handler),

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
