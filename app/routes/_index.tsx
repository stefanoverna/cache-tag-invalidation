import { type MetaFunction } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { graphql } from '~/gql';
import { buildDatoLoader } from '~/utils/buildDatoLoader';

// Generate an optimized data loader fetching data from DatoCMS Content-Delivery-API
export const loader = buildDatoLoader(
  graphql(/* GraphQL */ `
    query Home {
      artists: allArtists(orderBy: hotness_DESC) {
        slug
        name
      }
      compilations: allCompilations(orderBy: hotness_DESC) {
        slug
        name
      }
    }
  `),
);

// Use optimized default headers
export { headers } from '~/defaults.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Music dataset' }];
};

export default function Index() {
  const {
    response: { artists, compilations },
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Top Artists</h1>
      <ul>
        {artists.map((entry) => (
          <li key={entry.slug}>
            <Link to={`/artists/${entry.slug}`}>{entry.name}</Link>
          </li>
        ))}
      </ul>
      <h1>Hottest compilations</h1>
      <ul>
        {compilations.map((entry) => (
          <li key={entry.slug}>
            <Link to={`/compilations/${entry.slug}`}>{entry.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
