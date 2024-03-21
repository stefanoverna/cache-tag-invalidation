import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from '@remix-run/react';
import { isDatoLoaderData } from './utils/buildDatoLoader';
import truncate from 'just-truncate';

export function isTruthy<T>(value?: T | undefined): value is T {
  return !!value;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loadInfos = useMatches()
    .map((match) => {
      if (isDatoLoaderData(match.data)) {
        return { id: match.id, meta: match.data.meta };
      }
    })
    .filter(isTruthy);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
        <p>
          <Link to="/">Home</Link>
        </p>
        {children}
        <div style={{ fontSize: '0.8em', lineHeight: '1', paddingTop: '2em' }}>
          {loadInfos.map((loadInfo) => (
            <div key={loadInfo.id}>
              <p>last generated at: {loadInfo.meta.generatedAt}</p>
              <p>
                {loadInfo.meta.cacheTags.split(' ').length} cache tags:{' '}
                {truncate(loadInfo.meta.cacheTags, 100)}
              </p>
            </div>
          ))}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
