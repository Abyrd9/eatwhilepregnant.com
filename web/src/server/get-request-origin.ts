/**
 * Returns the public origin for crawler-facing URLs, honoring proxy headers.
 */
export const getRequestOrigin = (request: Request): string => {
	const requestUrl = new URL(request.url);
	const forwardedHost = toForwardedValue(
		request.headers.get("x-forwarded-host"),
	);
	const forwardedProto = toForwardedValue(
		request.headers.get("x-forwarded-proto"),
	);
	const host = forwardedHost || request.headers.get("host") || requestUrl.host;
	const protocol = forwardedProto || requestUrl.protocol.replace(/:$/, "");

	return `${protocol}://${host}`;
};

const toForwardedValue = (value: string | null): string => {
	return value?.split(",")[0]?.trim() ?? "";
};
