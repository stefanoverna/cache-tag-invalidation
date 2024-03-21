/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n    query Home {\n      artists: allArtists(orderBy: hotness_DESC) {\n        slug\n        name\n      }\n      compilations: allCompilations(orderBy: hotness_DESC) {\n        slug\n        name\n      }\n    }\n  ": types.HomeDocument,
    "\n    query Artist($slug: String!) {\n      artist(filter: { slug: { eq: $slug }}) {\n        ...SeoMetaTags\n        slug\n        name\n        hotness\n        familiarity\n\n        songs: _allReferencingSongs(orderBy: year_ASC) {\n          externalId\n          name\n          year\n\n          compilations: _allReferencingCompilations(orderBy: hotness_DESC) {\n            slug\n            name\n          }\n        }\n      }\n    }\n  ": types.ArtistDocument,
    "\n    query Compilation($slug: String!) {\n      compilation(filter: { slug: { eq: $slug }}) {\n        ...SeoMetaTags\n        slug\n        name\n        hotness\n        songs {\n          externalId\n          name\n          artist {\n            name\n            slug\n          }\n        }\n      }\n    }\n  ": types.CompilationDocument,
    "\n    query Song($externalId: String!) {\n      song(filter: { externalId: { eq: $externalId }}) {\n        ...SeoMetaTags\n        externalId\n        name\n        year\n        durationSecs\n        artist {\n          slug\n          name\n        }\n\n        compilations: _allReferencingCompilations(orderBy: hotness_DESC) {\n          slug\n          name\n        }\n      }\n    }\n  ": types.SongDocument,
    "\n  fragment SeoMetaTags on RecordInterface {\n    _seoMetaTags {\n      tag\n      attributes\n      content\n    }\n  }\n": types.SeoMetaTagsFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Home {\n      artists: allArtists(orderBy: hotness_DESC) {\n        slug\n        name\n      }\n      compilations: allCompilations(orderBy: hotness_DESC) {\n        slug\n        name\n      }\n    }\n  "): (typeof documents)["\n    query Home {\n      artists: allArtists(orderBy: hotness_DESC) {\n        slug\n        name\n      }\n      compilations: allCompilations(orderBy: hotness_DESC) {\n        slug\n        name\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Artist($slug: String!) {\n      artist(filter: { slug: { eq: $slug }}) {\n        ...SeoMetaTags\n        slug\n        name\n        hotness\n        familiarity\n\n        songs: _allReferencingSongs(orderBy: year_ASC) {\n          externalId\n          name\n          year\n\n          compilations: _allReferencingCompilations(orderBy: hotness_DESC) {\n            slug\n            name\n          }\n        }\n      }\n    }\n  "): (typeof documents)["\n    query Artist($slug: String!) {\n      artist(filter: { slug: { eq: $slug }}) {\n        ...SeoMetaTags\n        slug\n        name\n        hotness\n        familiarity\n\n        songs: _allReferencingSongs(orderBy: year_ASC) {\n          externalId\n          name\n          year\n\n          compilations: _allReferencingCompilations(orderBy: hotness_DESC) {\n            slug\n            name\n          }\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Compilation($slug: String!) {\n      compilation(filter: { slug: { eq: $slug }}) {\n        ...SeoMetaTags\n        slug\n        name\n        hotness\n        songs {\n          externalId\n          name\n          artist {\n            name\n            slug\n          }\n        }\n      }\n    }\n  "): (typeof documents)["\n    query Compilation($slug: String!) {\n      compilation(filter: { slug: { eq: $slug }}) {\n        ...SeoMetaTags\n        slug\n        name\n        hotness\n        songs {\n          externalId\n          name\n          artist {\n            name\n            slug\n          }\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Song($externalId: String!) {\n      song(filter: { externalId: { eq: $externalId }}) {\n        ...SeoMetaTags\n        externalId\n        name\n        year\n        durationSecs\n        artist {\n          slug\n          name\n        }\n\n        compilations: _allReferencingCompilations(orderBy: hotness_DESC) {\n          slug\n          name\n        }\n      }\n    }\n  "): (typeof documents)["\n    query Song($externalId: String!) {\n      song(filter: { externalId: { eq: $externalId }}) {\n        ...SeoMetaTags\n        externalId\n        name\n        year\n        durationSecs\n        artist {\n          slug\n          name\n        }\n\n        compilations: _allReferencingCompilations(orderBy: hotness_DESC) {\n          slug\n          name\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SeoMetaTags on RecordInterface {\n    _seoMetaTags {\n      tag\n      attributes\n      content\n    }\n  }\n"): (typeof documents)["\n  fragment SeoMetaTags on RecordInterface {\n    _seoMetaTags {\n      tag\n      attributes\n      content\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;