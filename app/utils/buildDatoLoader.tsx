import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import {
  AppLoadContext,
  LoaderFunctionArgs,
  json,
} from '@remix-run/cloudflare';
import { Params } from '@remix-run/react';
import { print } from 'graphql';

export async function datocms<
  TResult extends Record<string, unknown> = Record<string, unknown>,
  TVariables = Record<string, unknown>,
>(
  context: AppLoadContext,
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): Promise<{ data: TResult; cacheTags: string | null }> {
  const query = print(document);

  const includeDrafts =
    context.cloudflare.env.INCLUDE_DATOCMS_DRAFTS === 'true';

  const response = await fetch('https://graphql.datocms.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Exclude-Invalid': 'true',
      // This is the interesting part: we ask DatoCMS to provide, along with the
      // actual GraphQL response, also the cache tags related to this particular
      // request
      'x-cache-tags': 'true',
      Authorization: `Bearer ${context.cloudflare.env.DATOCMS_READONLY_API_TOKEN}`,
      ...(includeDrafts ? { 'X-Include-Drafts': 'true' } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json<{ errors: unknown } | { data: TResult }>();

  if ('errors' in body) {
    throw `Invalid GraphQL response! Query: ${JSON.stringify(
      query,
    )}, Variables: ${JSON.stringify(
      variables,
    )}, Include drafts: ${includeDrafts}, Response: ${JSON.stringify(body)}`;
  }

  return {
    data: body.data,
    // Cache tags are available in the X-Cache-Tags header of the GraphQL response
    cacheTags: response.headers.get('x-cache-tags'),
  };
}

type BuildDatoLoaderOptions<
  TResult extends Record<string, unknown> = Record<string, unknown>,
  TVariables = Record<string, unknown>,
  TResultRequiredKeys extends keyof TResult = never,
> = Partial<{
  paramsToVariables?: (params: Params<string>) => TVariables;
  requiredDataKeys?: TResultRequiredKeys[];
}>;

type RequirifyObjectKeys<
  T extends Record<string, unknown>,
  K extends keyof T,
> = {
  [P in keyof T]-?: P extends K ? NonNullable<T[P]> : T[P];
};

// buildDatoLoader() generates a loader that fetches content from DatoCMS and returns it in this format:

export type DatoLoaderData<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  // The actual GraphQL response
  response: T;
  meta: {
    // Cache tags related to the request
    cacheTags: string;
    // Date when the request wast made
    generatedAt: string;
  };
};

export function buildDatoLoader<
  TResult extends Record<string, unknown> = Record<string, unknown>,
  TVariables = Record<string, unknown>,
  TResultRequiredKeys extends keyof TResult = never,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  options?: BuildDatoLoaderOptions<TResult, TVariables, TResultRequiredKeys>,
) {
  async function loader({ context, params }: LoaderFunctionArgs) {
    const { data, cacheTags } = await datocms(
      context,
      document,
      options?.paramsToVariables
        ? options.paramsToVariables(params)
        : (params as TVariables),
    );

    if (options?.requiredDataKeys) {
      for (const key of options.requiredDataKeys) {
        const value = data[key] as unknown;

        if (!value || (Array.isArray(value) && value.length === 0)) {
          throw new Response('Not Found', { status: 404 });
        }
      }
    }

    return json(
      {
        response: data as RequirifyObjectKeys<TResult, TResultRequiredKeys>,
        meta: {
          cacheTags,
          generatedAt: new Date().toISOString(),
        },
      },
      {
        headers: cacheTags
          ? // Implement Fastly caching mechanism:
            //
            // surrogate-key: <CONTENT TAGS>
            // surrogate-control: max-age=31536000
            //
            // Basically, Fastly can cache forever, as it will be explicitely invalidated using tags
            {
              'surrogate-key': cacheTags,
              'surrogate-control': 'max-age=31536000',
            }
          : {},
      },
    );
  }

  return loader;
}

export function isDatoLoaderData(data: unknown): data is DatoLoaderData {
  return Boolean(
    data && typeof data === 'object' && 'response' in data && 'meta' in data,
  );
}
