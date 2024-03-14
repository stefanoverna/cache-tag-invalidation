import {
	type HeadersFunction,
	type MetaFunction,
	json,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { graphql } from "~/gql";
import datocms from "~/utils/dato";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{
			name: "description",
			content: "Welcome to Remix! Using Vite and Cloudflare!",
		},
	];
};

const query = graphql(/* GraphQL */ `
  query Home {
    entries: allSongs(orderBy: _firstPublishedAt_DESC) {
      id
      name
    }
  }
`);

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const {
		result: { entries },
		cacheTags,
	} = await datocms(context, query);

	return json(
		{ entries, cacheTags, generatedAt: new Date().toLocaleTimeString() },
		{
			headers: cacheTags
				? {
						"surrogate-key": cacheTags,
						// Fastly CDN can cache this resource forever (it will be explicitely invalidated using tags)
						"surrogate-control": "max-age=31536000",
						// Browser caching mechanism is declared globally on entry.server.tsx:
						// cache-control: no-cache, max-age=0, must-revalidate
						// So they can cache loader and page responses, but need to revalidate with etag/if-none-match
				  }
				: {},
		},
	);
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	return loaderHeaders;
};

export default function Index() {
	const { entries, generatedAt, cacheTags } = useLoaderData<typeof loader>();

	return (
		<div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
			<h1>Home</h1>
			<ul>
				{entries.map((entry) => (
					<li key={entry.id}>{entry.name}</li>
				))}
			</ul>
			<p>Last change: {generatedAt}</p>
			<p>Tags: {cacheTags}</p>
		</div>
	);
}
