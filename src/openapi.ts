import { Schema } from './types';

type Route = {
	method: 'get' | 'post' | 'put' | 'patch' | 'delete';
	path: string;
	requestBody: Schema<any>;
	responses: Record<number, Schema<any>>;
};

export const openapi = (opts: {
	title: string;
	version: string;
	routes: Route[];
}) => {
	const paths: any = {};

	for (const r of opts.routes) {
		paths[r.path] ??= {};
		paths[r.path][r.method] = {
			responses: Object.fromEntries(
				Object.entries(r.responses).map(([code, schema]) => [
					code,
					{
						description: 'Response',
						content: { 'application/json': { schema: schema.toOpenAPI() } },
					},
				])
			),
			...(r.requestBody
				? {
						requestBody: {
							required: true,
							content: {
								'application/json': { schema: r.requestBody.toOpenAPI() },
							},
						},
				  }
				: {}),
		};
	}

	return {
		openapi: '3.1.0',
		info: { title: opts.title, version: opts.version },
		paths,
	};
};

openapi.route = (r: Route) => r;
