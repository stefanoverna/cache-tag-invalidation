export type EtagOptions = {
	/**
	 * Add a `cache-control` header to the `Response` object.
	 * Defaults to "no-cache, max-age=0, must-revalidate".
	 * If you don't want to send the `cache-control` header, set `cacheControl` to `null`.
	 * See also `maxAge`.
	 * Note that if a `cache-control` header is already set, it will NOT be overwritten.
	 */
	cacheControl?: string | null;

	/**
	 * Specifies the `max-age` used in the `cache-control` header.
	 * Defaults to `0` (no caching). Will only be used if `cacheControl` is not `null`.
	 */
	maxAge?: number;

	/**
	 * Specifies if the generated ETag will include the weak validator mark (that is, the leading W/).
	 * The actual entity tag is the same. Defaults to `true`.
	 */
	weak?: boolean;
};

const stripLeadingWeak = (hash: string) => hash.replace(/^W\//, "");

const testWeak = (hash: string) => hash.startsWith("W/");

const computeMatch = (
	weak: boolean,
	ifNoneMatch: string | null,
	etagHash: string,
): boolean => {
	if (ifNoneMatch === null) return false;

	if (weak) {
		return stripLeadingWeak(ifNoneMatch) === stripLeadingWeak(etagHash);
	}
	return (
		!testWeak(ifNoneMatch) && !testWeak(etagHash) && ifNoneMatch === etagHash
	);
};

type TestMatch = {
	request: Request;
	text: string;
	headers: Headers;
	weak: boolean;
};

const computeETag = async (text: string, { weak }: { weak: boolean }) => {
	const msgUint8 = new TextEncoder().encode(text); // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest("MD5", msgUint8); // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join(""); // convert bytes to hex string

	return `"${weak ? "W/" : ""}${hashHex}"`;
};

/**
 * The raw `testMatch` function that could be used to compare the RemixContext.routeData and
 * return early without rendering the page if `true` is returned.
 */
export const testMatch = async ({
	request,
	text,
	headers,
	weak,
}: TestMatch): Promise<boolean> => {
	const etagHash = await computeETag(text, { weak });
	headers.set("ETag", etagHash);

	const ifNoneMatch = request.headers.get("if-none-match");
	const isMatch = computeMatch(weak, ifNoneMatch, etagHash);
	return isMatch;
};

export const mergeDefaultOptions = (
	options: EtagOptions = {},
): Required<EtagOptions> => {
	const {
		maxAge = 0,
		cacheControl = `no-cache, max-age=${maxAge}, must-revalidate`,
		weak = true,
	} = options;
	return {
		cacheControl,
		maxAge,
		weak,
	};
};

type SendEtagResponseArgs = {
	request: Request;
	response: Response;
	options?: EtagOptions;
};

/**
 * Handles all aspect of ETag/If-None-Match header generation.
 * If the `If-None-Match` header is present in the `Request` object, and it matches the calculated
 * hash value of the response body, it will return a `304 Not Modified` response.
 * Otherwise, an `ETag` header is added to the `Response` object.
 */
export const etag = async ({
	request,
	response,
	options,
}: SendEtagResponseArgs): Promise<Response> => {
	const { cacheControl, weak } = mergeDefaultOptions(options);

	const { headers } = response;

	const shouldComputeETag =
		(request.method === "GET" || request.method === "HEAD") &&
		response.status === 200;

	if (!shouldComputeETag) return response;

	const hasCacheControl = headers.has("cache-control");

	if (!hasCacheControl && cacheControl) {
		headers.set("cache-control", cacheControl);
	}

	// We clone the response so we can read the body, which is a one-time operation.
	const clonedResponse = response.clone();
	const body = await clonedResponse.text();

	const isMatch = await testMatch({ request, text: body, headers, weak });
	return isMatch ? new Response("", { status: 304, headers }) : response;
};
