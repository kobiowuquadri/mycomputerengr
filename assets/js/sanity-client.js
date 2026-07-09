import {createClient} from "https://esm.sh/@sanity/client@7.23.0?bundle";
import imageUrlBuilder from "https://esm.sh/@sanity/image-url@2.1.1?bundle";
import {sanityConfig} from "./sanity-config.js";

const client = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: sanityConfig.useCdn
});

const builder = imageUrlBuilder(client);
const memoryCache = new Map();

export function isSanityConfigured() {
  return Boolean(
    sanityConfig.projectId &&
    sanityConfig.dataset &&
    sanityConfig.projectId !== "your-project-id"
  );
}

function cacheKey(query, params) {
  return "mc:sanity:" + btoa(unescape(encodeURIComponent(JSON.stringify({query, params}))));
}

function readCache(key) {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  try {
    var raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    var cached = JSON.parse(raw);
    if (Date.now() > cached.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    memoryCache.set(key, cached.value);
    return cached.value;
  } catch (error) {
    return null;
  }
}

function writeCache(key, value, seconds) {
  memoryCache.set(key, value);
  try {
    window.sessionStorage.setItem(key, JSON.stringify({
      value,
      expiresAt: Date.now() + (seconds * 1000)
    }));
  } catch (error) {
    // Storage can be unavailable in private browsing. In-memory cache still works.
  }
}

export async function sanityFetch(query, params = {}, options = {}) {
  if (!isSanityConfigured()) {
    throw new Error("Sanity is not configured. Set projectId in assets/js/sanity-config.js.");
  }

  var seconds = options.cacheSeconds || sanityConfig.cacheSeconds || 300;
  var key = cacheKey(query, params);
  var cached = readCache(key);
  if (cached) {
    return cached;
  }

  var value = await client.fetch(query, params);
  writeCache(key, value, seconds);
  return value;
}

function imageSource(image) {
  if (!image || !image.assetRef) {
    return null;
  }
  return {asset: {_ref: image.assetRef}};
}

export function imageUrl(image, options = {}) {
  var source = imageSource(image);
  if (!source) {
    return "";
  }

  var url = builder.image(source).auto("format").fit("crop");
  if (options.width) {
    url = url.width(options.width);
  }
  if (options.height) {
    url = url.height(options.height);
  }
  if (options.quality) {
    url = url.quality(options.quality);
  }
  return url.url();
}

export {sanityConfig};
