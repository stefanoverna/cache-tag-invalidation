import { Link, useLoaderData } from '@remix-run/react';
import { graphql } from '~/gql';
import { buildMetaFromSeoMetaTags } from '~/utils/buildMetaFromSeoMetaTags';
import { buildDatoLoader } from '~/utils/buildDatoLoader';

// Generate an optimized data loader fetching data from DatoCMS Content-Delivery-API
export const loader = buildDatoLoader(
  graphql(/* GraphQL */ `
    query Artist($slug: String!) {
      artist(filter: { slug: { eq: $slug }}) {
        ...SeoMetaTags
        slug
        name
        hotness
        familiarity

        songs: _allReferencingSongs(orderBy: year_ASC) {
          externalId
          name
          year

          compilations: _allReferencingCompilations(orderBy: hotness_DESC) {
            slug
            name
          }
        }
      }
    }
  `),
  // If the `artist` key of the GraphQL response is null, automatically return a 404
  { requiredDataKeys: ['artist'] },
);

// Use optimized default headers
export { headers } from '~/defaults.server';

// Generate meta tags using data coming from SeoMetaTags fragment of `artist`
export const meta = buildMetaFromSeoMetaTags<typeof loader>('artist');

export default function Index() {
  const {
    response: { artist },
  } = useLoaderData<typeof loader>();

  const compilations = artist.songs.flatMap((song) => song.compilations);

  return (
    <div>
      <h1>👨‍🎤 {artist.name}</h1>
      {
        <>
          <h4>Songs</h4>
          <ul>
            {artist.songs.map((song) => (
              <li key={song.externalId}>
                <Link to={`/songs/${song.externalId}`}>{song.name}</Link>{' '}
                {song.year && <>({song.year})</>}
              </li>
            ))}
          </ul>
        </>
      }
      {compilations.length > 0 && (
        <>
          <h4>Featured in</h4>
          <ul>
            {compilations.map((entry) => (
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
