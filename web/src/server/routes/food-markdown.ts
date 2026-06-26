import { isCanonicalFoodSlug } from "../../core/food/food-normalization";
import { getFoodOnlyBySlug } from "../../core/food/food-service";
import { getRequestOrigin } from "../get-request-origin";

const markdownCacheControlHeader = "public, max-age=0, s-maxage=300";
const markdownContentTypeHeader = "text/markdown; charset=utf-8";

/**
 * Returns the visible safety label used on the food details page.
 */
const toSafetyLabel = (
	pregnancySafety: "safe" | "caution" | "avoid",
): string => {
	if (pregnancySafety === "safe") {
		return "Generally Safe";
	}

	if (pregnancySafety === "avoid") {
		return "Avoid";
	}

	return "Use Caution";
};

/**
 * Formats an ISO date into a stable YYYY-MM-DD string.
 */
const toIsoDate = (isoDateTime: string): string => {
	const parsedDate = new Date(isoDateTime);

	if (Number.isNaN(parsedDate.getTime())) {
		return isoDateTime;
	}

	return parsedDate.toISOString().slice(0, 10);
};

/**
 * Builds the markdown representation of a food details page.
 */
const toFoodMarkdownDocument = (
	foodSlug: string,
	origin: string,
	foodRecord: {
		name: string;
		pregnancySafety: "safe" | "caution" | "avoid";
		summary: string;
		details: string;
		source: string;
		reviewedAt: string;
	},
): string => {
	const safetyLabel = toSafetyLabel(foodRecord.pregnancySafety);
	const canonicalUrl = `${origin}/${foodSlug}`;

	return [
		`# ${foodRecord.name}`,
		"",
		`- Safety: ${safetyLabel}`,
		`- Slug: ${foodSlug}`,
		`- Canonical URL: ${canonicalUrl}`,
		`- Reviewed: ${toIsoDate(foodRecord.reviewedAt)}`,
		"",
		"## Summary",
		"",
		foodRecord.summary,
		"",
		"## Details",
		"",
		foodRecord.details,
		"",
		"## Source",
		"",
		foodRecord.source,
		"",
		"## Disclaimer",
		"",
		"The information on this website is not medical advice. Always talk with your doctor or other qualified healthcare provider for guidance about your pregnancy diet.",
		"",
	].join("\n");
};

/**
 * Returns the markdown representation for a canonical food page slug.
 */
export const handleFoodMarkdownPage = async (
	request: Request,
	foodSlug: string,
): Promise<Response> => {
	const markdownHeaders = {
		"Cache-Control": markdownCacheControlHeader,
		"Content-Type": markdownContentTypeHeader,
		Vary: "Accept",
	};

	if (!isCanonicalFoodSlug(foodSlug)) {
		return new Response("# Not found\n\nInvalid food slug.\n", {
			status: 404,
			headers: markdownHeaders,
		});
	}

	const foodRecord = await getFoodOnlyBySlug(foodSlug);

	if (!foodRecord) {
		return new Response("# Not found\n\nFood was not found in cache.\n", {
			status: 404,
			headers: markdownHeaders,
		});
	}

	const origin = getRequestOrigin(request);
	const markdownDocument = toFoodMarkdownDocument(foodSlug, origin, foodRecord);

	return new Response(markdownDocument, {
		status: 200,
		headers: markdownHeaders,
	});
};
