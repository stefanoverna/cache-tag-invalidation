import { Link, useLoaderData } from '@remix-run/react';
import { graphql } from '~/gql';
import { buildMetaFromSeoMetaTags } from '~/utils/buildMetaFromSeoMetaTags';
import { buildDatoLoader } from '~/utils/buildDatoLoader';

// Generate an optimized data loader fetching data from DatoCMS Content-Delivery-API
export const loader = buildDatoLoader(
  graphql(/* GraphQL */ `
    query Song($externalId: String!) {
      song(filter: { externalId: { eq: $externalId }}) {
        ...SeoMetaTags
        externalId
        name
        year
        durationSecs
        artist {
          slug
          name
        }

        compilations: _allReferencingCompilations(orderBy: hotness_DESC) {
          slug
          name
        }
      }
    }
  `),
  // If the `song` key of the GraphQL response is null, automatically return a 404
  { requiredDataKeys: ['song'] },
);

// Use optimized default headers
export { headers } from '~/defaults.server';

// Generate meta tags using data coming from SeoMetaTags fragment of `song`
export const meta = buildMetaFromSeoMetaTags<typeof loader>('song');

export default function Index() {
  const {
    response: { song },
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>🎵 {song.name}</h1>
      <p>
        Artist:{' '}
        <Link to={`/artists/${song.artist.slug}`}>{song.artist.name}</Link>
      </p>
      {song.year && <p>Year: {song.year}</p>}
      {song.durationSecs && <p>Duration: {song.durationSecs}s</p>}
      {song.compilations.length > 0 && (
        <>
          <h4>Compilations</h4>
          <ul>
            {song.compilations.map((entry) => (
              <li key={entry.slug}>
                <Link to={`/compilations/${entry.slug}`}>{entry.name}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
