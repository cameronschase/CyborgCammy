/**
 * This file uses the youtube api to find a song while implementing a heuristic to ensure it's not a crappy remix of that song
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const { google } = require("googleapis");
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});
const cache = new Map(); //Cache to avoid redundantly finding the same song to play
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; //6 hour TTL for the cache

/**
 * This function normalizes a given search query
 * @param {*} q the query
 * @returns the normalized query
 */
function normalizeQuery(q) {
  return (q || "").trim().toLowerCase().replace(/\s+/g, " "); //Make it lowercase, remove whitespace, return empty query if original query is empty/null
}

/**
 * This functions returns a video from the cache
 * @param {*} key an entry (query)
 * @returns a video from the cache
 */
function cacheGet(key) {
  const hit = cache.get(key); //The video (null if cache miss)
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) { //Remove old videos from cache after TTL expires
    cache.delete(key);
    return null;
  }
  return hit.videoId; //Return video from cache if hit
}

/**
 * This function stores a video id and its corresponding expiration time (when it will be purged from the cache)
 * @param {*} key the query
 * @param {*} videoId the video
 */
function cacheSet(key, videoId) {
  cache.set(key, { videoId, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * This function checks if a given string is a substring of a given word in a list
 * @param {*} str a string (query)
 * @param {*} words list of words (keywords that we want to avoid) --> Words common in bad remixes and the like
 * @returns boolean value indicating if a word in the list appears in the normalized string
 */
function containsAny(str, words) {
  const s = (str || "").toLowerCase(); //Normalize string
  return words.some((w) => s.includes(w));
}

/**
 * This function computes a heuristic value assigned to a video with a creator that we can verify is good
 * @param {*} channelTitle the video creator
 * @returns heuristic value
 */
function computeChannelBonus(channelTitle = "") {
  const ct = channelTitle.toLowerCase(); //Normalize creator name
  if (ct.includes("vevo")) return 2_000_000_000_000; //Vevo is very good
  if (ct.endsWith(" - topic")) return 800_000_000_000; //- Topic means it's a verified popular artist
  if (ct.includes("official")) return 150_000_000_000; //Official usually means it's the original artist
  return 0; //Else, low heuristic value
}

/**
 * This function determines if a given title is bad (if it contains any words that indicate it's not a good version of the song)
 * @param {} title the title in question
 * @returns boolean value indicating whether or not the title is bad
 */
function isBadTitle(title = "") {
  const bad = [ //Bad titles contain the following terms
    "remix",
    "mix",
    "cover",
    "live",
    "karaoke",
    "nightcore",
    "slowed",
    "sped up",
    "speed up",
    "8d",
    "instrumental",
    "acoustic",
    "edit",
  ];
  return containsAny(title, bad);
}

/**
 * This function finds the best result's videoid
 * @param {*} query the query
 * @returns the best result's videoid
 */
async function findBestVideoId(query) {
  if (!process.env.YOUTUBE_API_KEY) { //Ensure we have our API key
    throw new Error("Missing YOUTUBE_API_KEY in .env");
  }
  const q = normalizeQuery(query); //Normalize query
  if (!q) return null; //Handle null/blank query
  const cacheKey = `best:${q}`; //Key for cache for a given query
  const cached = cacheGet(cacheKey); //Search the cache for the key
  if (cached) return cached; //Return from cache if cache hit
  const searchRes = await youtube.search.list({
    part: ["snippet"], //Info about result
    q, //Query
    type: ["video"], //Videos only
    videoCategoryId: "10", //Youtube Music
    order: "viewCount", //Sort by view count
    maxResults: 10, //Show top 10 results
    safeSearch: "none", //No safe search for explicit songs
  });

  const items = searchRes.data.items || []; //Put results in array (if no results, then empty array)
  const ids = items.map((i) => i.id?.videoId).filter(Boolean); //Extract ids while filtering out null/empty ids
  if (!ids.length) return null; //If no valid ids, return null

  const videosRes = await youtube.videos.list({ //Get information for the ids
    part: ["snippet", "statistics"], //Get creator and view count
    id: ids, //Ids to get details of
    maxResults: 10, //If ids.length > 10, max 10 results
  });

  const vids = (videosRes.data.items || []).map((v) => { //Map containing:
    const title = v.snippet?.title || ""; //video title
    const channelTitle = v.snippet?.channelTitle || ""; //Creator
    const viewCount = Number(v.statistics?.viewCount || 0); //View count (0 if not found)
    return { id: v.id, title, channelTitle, viewCount }; //Return object for the video array
  });
  if (!vids.length) return null; //If no entries in map, return null

  const clean = vids.filter((v) => !isBadTitle(v.title)); //Remove videos with bad titles
  const pool = clean.length ? clean : vids; //New pool of leftovers

  const scored = pool.map((v) => { //List of videos with a score
    const bonus = computeChannelBonus(v.channelTitle); //bonus
    const score = v.viewCount + bonus; //score = view count + bonus
    return { ...v, score }; //Return object with all previous fields and a score
  });
  scored.sort((a, b) => b.score - a.score); //Sort the list by descending scores
  const best = scored[0]?.id || null; //Pick the first video's id, null if no first entry
  if (best) cacheSet(cacheKey, best); //If exists, then add it to cache
  return best; //Return best video id
}

module.exports = { findBestVideoId };