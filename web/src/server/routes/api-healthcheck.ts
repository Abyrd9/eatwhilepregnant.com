/**
 * Returns a small health response for container and platform checks.
 */
export const handleHealthcheck = (): Response => {
	return Response.json({ status: "ok" });
};
