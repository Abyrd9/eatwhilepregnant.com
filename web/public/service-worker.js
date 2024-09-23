self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const method = event.request.method;

  // any non GET request is ignored
  if (method.toLowerCase() !== "get") return;

  // If the request is for the favicons, fonts, or the built files (which are hashed in the name)
  if (
    url.pathname.startsWith("/favicons/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/build/")
  ) {
    event.respondWith(
      // we will open the assets cache
      caches.open("assets").then(async (cache) => {
        // if the request is cached we will use the cache
        const cacheResponse = await cache.match(event.request);
        if (cacheResponse) return cacheResponse;

        // if it's not cached we will run the fetch, cache it and return it
        // this way the next time this asset it's needed it will load from the cache
        try {
          const fetchResponse = await fetch(event.request);
          // Only cache successful responses
          if (fetchResponse.ok && fetchResponse.type !== "opaque") {
            // Check if the URL is cacheable (not a chrome-extension)
            if (!url.protocol.startsWith("chrome-extension")) {
              cache.put(event.request, fetchResponse.clone());
            }
          }
          return fetchResponse;
        } catch (error) {
          console.error("Fetch failed:", error);
          throw error;
        }
      })
    );
  }

  return;
});
