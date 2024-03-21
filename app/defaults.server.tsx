import { HeadersFunction } from '@remix-run/cloudflare';

// If our web pages only alter according to the data they load, and the
// loader provides surrogate keys to store the results in Fastly indefinitely,
// we can label our page with those same tags.

// When those keys are no longer valid, both the loader result and the
// page will be purged from cache, and re-generated ex-novo.

const settableHeaders = ['surrogate-key', 'surrogate-control'];

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers();

  for (const header of settableHeaders) {
    const value = loaderHeaders.get(header);
    if (value) {
      headers.set(header, value);
    }
  }

  return headers;
};
