import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { AppLoadContext } from "@remix-run/cloudflare";
import { print } from "graphql";

export default async function datocms<
	TResult = unknown,
	TVariables = Record<string, unknown>,
>(
	context: AppLoadContext,
	document: TypedDocumentNode<TResult, TVariables>,
	variables?: TVariables,
): Promise<{ result: TResult; cacheTags: string | null }> {
	const query = print(document);

	const includeDrafts =
		context.cloudflare.env.INCLUDE_DATOCMS_DRAFTS === "true";

	const response = await fetch("https://graphql.datocms.com/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"X-Exclude-Invalid": "true",
			"Fastly-Debug": "1",
			Authorization: `Bearer ${context.cloudflare.env.DATOCMS_READONLY_API_TOKEN}`,
			...(includeDrafts ? { "X-Include-Drafts": "true" } : {}),
		},
		body: JSON.stringify({ query, variables }),
	});

	const body = await response.json<{ errors: unknown } | { data: TResult }>();

	if ("errors" in body) {
		console.log(body.errors);

		throw `Invalid GraphQL response! Query: ${JSON.stringify(
			query,
		)}, Variables: ${JSON.stringify(
			variables,
		)}, Include drafts: ${includeDrafts}, Response: ${JSON.stringify(body)}`;
	}

	return {
		result: body.data,
		cacheTags: response.headers.get("surrogate-key"),
	};
}
