/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type {
  AppLoadContext,
  EntryContext,
  HandleDataRequestFunction,
} from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { manageEtagIfNoneMatch } from './utils/manageEtagIfNoneMatch';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _loadContext: AppLoadContext,
) {
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent') || '')) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  const response = new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });

  // Implement Browser caching mechanism:
  //
  // etag: W/"<GENERATED WEAK ETAG>"
  // cache-control: no-cache, max-age=0, must-revalidate
  //
  // Basically, browsers can cache loader response, but need to revalidate with if-none-match
  return manageEtagIfNoneMatch({ request, response });
}

export const handleDataRequest: HandleDataRequestFunction = async (
  response,
  { request },
) => {
  // Implement Browser caching mechanism:
  //
  // etag: W/"<GENERATED WEAK ETAG>"
  // cache-control: no-cache, max-age=0, must-revalidate
  //
  // Basically, browsers can cache loader response, but need to revalidate with if-none-match
  return manageEtagIfNoneMatch({ request, response });
};
