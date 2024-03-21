import { Link, useLoaderData } from '@remix-run/react';
import { graphql } from '~/gql';
import { buildMetaFromSeoMetaTags } from '~/utils/buildMetaFromSeoMetaTags';
import { buildDatoLoader } from '~/utils/buildDatoLoader';

// Generate an optimized data loader fetching data from DatoCMS Content-Delivery-API
export const loader = buildDatoLoader(
  graphql(/* GraphQL */ `
    query Compilation($slug: String!) {
      compilation(filter: { slug: { eq: $slug }}) {
        ...SeoMetaTags
        slug
        name
        hotness
        songs {
          externalId
          name
          artist {
            name
            slug
          }
        }
      }
    }
  `),
  {
    // If the `compilation` key of the GraphQL response is null, automatically return a 404
    requiredDataKeys: ['compilation'],
  },
);

// Use optimized default headers
export { headers } from '~/defaults.server';

// Generate meta tags using data coming from SeoMetaTags fragment of `compilation`
export const meta = buildMetaFromSeoMetaTags<typeof loader>('compilation');

export default function Index() {
  const {
    response: { compilation },
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>💽 {compilation.name}</h1>
      <h4>Songs</h4>
      <ul>
        {compilation.songs.map((song) => (
          <li key={song.externalId}>
            <Link to={`/songs/${song.externalId}`}>{song.name}</Link> (
            <Link to={`/artists/${song.artist.slug}`}>{song.artist.name}</Link>)
          </li>
        ))}
      </ul>
    </div>
  );
}
