import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import {
  LoaderFunction,
  MetaFunction,
  SerializeFrom,
} from '@remix-run/cloudflare';
import { TitleMetaLinkTag, toRemixMeta } from 'react-datocms';
import invariant from 'tiny-invariant';
import { graphql, FragmentType } from '~/gql';
import { SeoMetaTagsFragment } from '~/gql/graphql';

export const SeoMetaTags = graphql(/* GraphQL */ `
  fragment SeoMetaTags on RecordInterface {
    _seoMetaTags {
      tag
      attributes
      content
    }
  }
`);

type KeysContainingSeoMetaTagsFragment<T> = {
  [K in keyof T]-?: T[K] extends FragmentType<
    DocumentTypeDecoration<SeoMetaTagsFragment, unknown>
  >
    ? K
    : never;
}[keyof T extends string ? keyof T : never];

export function buildMetaFromSeoMetaTags<Loader extends LoaderFunction>(
  key: SerializeFrom<Loader> extends { response: Record<string, unknown> }
    ? KeysContainingSeoMetaTagsFragment<SerializeFrom<Loader>['response']>
    : string,
) {
  const meta: MetaFunction<Loader> = ({ data }) => {
    if (!data) {
      return [];
    }

    invariant(
      data && typeof data === 'object' && 'response' in data,
      'Loader is not built with buildDatoLoader()',
    );

    const response = data.response;

    invariant(
      response && typeof response === 'object' && key in response,
      `Key "${key}" is not present in loaded data`,
    );

    const keyValue = (response as Record<string, unknown>)[key];

    invariant(
      keyValue && typeof keyValue === 'object' && '_seoMetaTags' in keyValue,
      `Key "${key}._seoMetaTags" is not present in loaded data`,
    );

    return toRemixMeta(keyValue._seoMetaTags as TitleMetaLinkTag[]);
  };

  return meta;
}
