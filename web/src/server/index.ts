import webAppHtml from "../web/index.html";
import {
	handleAdminFeedbackBySlug,
	handleAdminFeedbackIndex,
	handleAdminRefreshFood,
	requireAdminKey,
} from "./routes/api-admin";
import { handleFeedback } from "./routes/api-feedback";
import {
	handleGetFood,
	handleRefreshFood,
	handleRefreshFoodByName,
} from "./routes/api-food";
import { handleHealthcheck } from "./routes/api-healthcheck";
import { handleSearch } from "./routes/api-search";
import { handleFoodMarkdownPage } from "./routes/food-markdown";
import { handleRobots } from "./routes/robots";
import { handleSitemap } from "./routes/sitemap";

const appPort = Number(process.env.PORT ?? 3000);

const htmlCacheControlHeader = "public, max-age=0, s-maxage=300";
const noStoreCacheControlHeader = "no-store";

const withNoStoreCache = (response: Response): Response => {
	response.headers.set("Cache-Control", noStoreCacheControlHeader);
	return response;
};

/**
 * Returns whether the caller requested markdown via content negotiation.
 */
const wantsMarkdownResponse = (request: Request): boolean => {
	const acceptHeader = request.headers.get("Accept") ?? "";
	return acceptHeader.toLowerCase().includes("text/markdown");
};

const toWebAppHtmlResponse = async (request: Request): Promise<Response> => {
	const webAppIndexUrl = new URL(request.url);
	webAppIndexUrl.pathname = "/__spa-index";
	webAppIndexUrl.search = "";

	const webAppIndexResponse = await fetch(webAppIndexUrl);
	const webAppIndexHtml = await webAppIndexResponse.text();

	return new Response(webAppIndexHtml, {
		status: webAppIndexResponse.status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Cache-Control": htmlCacheControlHeader,
		},
	});
};

const toPublicAssetCacheControl = (pathname: string): string => {
	const hasFingerprint = /-[a-f0-9]{8,}\./i.test(pathname);

	if (hasFingerprint) {
		return "public, max-age=31536000, immutable";
	}

	return "public, max-age=86400";
};

/**
 * Resolves and serves assets from /public.
 */
const tryServePublicAsset = async (
	pathname: string,
): Promise<Response | null> => {
	if (pathname.includes("..")) {
		return null;
	}

	const publicFilePath = new URL(`../../public${pathname}`, import.meta.url);
	const publicFile = Bun.file(publicFilePath);

	if (await publicFile.exists()) {
		return new Response(publicFile, {
			headers: {
				"Cache-Control": toPublicAssetCacheControl(pathname),
			},
		});
	}

	return null;
};

/**
 * Serves static public assets and returns 404 for unknown paths.
 */
const handleFallbackRequest = async (request: Request): Promise<Response> => {
	const requestUrl = new URL(request.url);
	const pathname = requestUrl.pathname;

	const publicAssetResponse = await tryServePublicAsset(pathname);

	if (publicAssetResponse) {
		return publicAssetResponse;
	}

	if (/^\/can-i-eat-[a-z0-9-]+-while-pregnant$/.test(pathname)) {
		if (wantsMarkdownResponse(request)) {
			return handleFoodMarkdownPage(request, pathname.slice(1));
		}

		return toWebAppHtmlResponse(request);
	}

	if (pathname.startsWith("/api/")) {
		return Response.json(
			{ status: "error", message: "Route not found." },
			{ status: 404 },
		);
	}

	return new Response("Not found.", { status: 404 });
};

const appServer = Bun.serve({
	port: appPort,
	development: process.env.NODE_ENV !== "production",
	routes: {
		"/__spa-index": webAppHtml,
		"/": {
			GET: (request) => toWebAppHtmlResponse(request),
		},
		"/admin": {
			GET: (request) => toWebAppHtmlResponse(request),
		},
		"/robots.txt": {
			GET: (request) => handleRobots(request),
		},
		"/sitemap.xml": {
			GET: (request) => handleSitemap(request),
		},
		"/api/healthcheck": {
			GET: () => withNoStoreCache(handleHealthcheck()),
		},
		"/api/search": {
			GET: async (request) => withNoStoreCache(await handleSearch(request)),
		},
		"/api/feedback": {
			POST: async (request) => withNoStoreCache(await handleFeedback(request)),
		},
		"/api/food/refresh": {
			POST: async (request) =>
				withNoStoreCache(await handleRefreshFoodByName(request)),
		},
		"/api/food/:slug": {
			GET: (request) => handleGetFood(request.params.slug),
		},
		"/api/food/refresh/:slug": {
			POST: async (request) =>
				withNoStoreCache(await handleRefreshFood(request.params.slug)),
		},
		"/api/admin/feedback": {
			GET: async (request) => {
				const unauthorizedResponse = requireAdminKey(request);

				if (unauthorizedResponse) {
					return withNoStoreCache(unauthorizedResponse);
				}

				const requestUrl = new URL(request.url);
				const foodSlug = requestUrl.searchParams.get("foodSlug")?.trim() ?? "";

				if (!foodSlug) {
					return withNoStoreCache(await handleAdminFeedbackIndex());
				}

				return withNoStoreCache(await handleAdminFeedbackBySlug(foodSlug));
			},
		},
		"/api/admin/refresh/:slug": {
			POST: async (request) => {
				const unauthorizedResponse = requireAdminKey(request);

				if (unauthorizedResponse) {
					return withNoStoreCache(unauthorizedResponse);
				}

				return withNoStoreCache(
					await handleAdminRefreshFood(request.params.slug),
				);
			},
		},
	},
	fetch: handleFallbackRequest,
});

console.log(`eatwhilepregnant Bun server running on ${appServer.url}`);
