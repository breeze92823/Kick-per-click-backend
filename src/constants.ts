// Keep in step with the client's src/config.js by hand.
export const ROOM_MAX_CLIENTS = 50;

// Where a player appears for everyone else before their first `pose` arrives (client SPAWN).
export const SPAWN = { x: 0, y: 0.6, z: 0 };

// Walkable bounds (client WORLD_BOUNDS is +-215, maxZ 625 for the 550 m lane), with a little slack: a forged pose cannot put a
// player outside the world for everyone else to see.
export const WORLD_BOUNDS = { minX: -225, maxX: 225, minZ: -225, maxZ: 635, minY: -40, maxY: 200 };

// Longest accepted strings.
export const NAME_MAX = 64;
export const POSE_MAX = 32;
// Bloxity avatar JSON, relayed as-is. Kept under the 4 KB cap of the join request's options.
export const AVATAR_MAX_LEN = 3000;

// Colyseus drops the whole connection for a WebSocket message above this (default 4 KB).
export const MAX_PAYLOAD_BYTES = 128 * 1024;

// Leaderboards: how often WorldRoom re-queries Mongo for the all-time top players per stat, how
// many rows it fetches per stat before merging with the live roster, and how many it sends.
export const LEADERBOARD_REFRESH_MS = 15_000;
export const LEADERBOARD_QUERY_LIMIT = 20;
export const LEADERBOARD_ROWS = 10;

// How long a dropped connection (WiFi blip, backgrounded tab) may reconnect with the same session.
export const RECONNECT_SECONDS = 20;

// Upper bounds for saved values, so a forged payload cannot push a bogus number onto the
// leaderboards. Generous ceilings, not game rules.
export const CURRENCY_MAX = 1e24; // wins, kick power
export const REBIRTH_MAX = 1_000_000;
export const LEVEL_MAX = 1_000_000;
export const PLAY_SECONDS_MAX = 31_536_000; // ~1 year
export const SPINS_MAX = 1_000_000;
// Longest kick the lane allows (client LANE.length) with slack; bestDistance is metres.
export const DISTANCE_MAX = 1000;
// Client src/config.js TUTORIAL.steps: the onboarding runs steps 0..TUTORIAL_DONE_STEP (9 = finished).
export const TUTORIAL_DONE_STEP = 9;
// Profile picture URL (Bloxity `pfp`), relayed so other players can draw it.
export const PFP_MAX_LEN = 512;

// Client config.js: BALLS has 21 entries (indices 0..20), LEGENDS ids, ECONOMY.invSlots.
export const BALL_COUNT = 21;
export const LEGEND_IDS: readonly string[] = [
  "chilli", "ronaldu", "cancello", "pogbo", "kvarra", "neymer", "vinny", "sallah", "yamol",
  "beckhem", "kruyf", "debruyn", "haalando",
];
export const INV_SLOTS_MAX = LEGEND_IDS.length;

// Client ECONOMY.freeSpinSeconds: `freeOnline` (s played towards the next free spin) never exceeds it;
// `lastSeen` (epoch ms) is never further ahead than clock slack.
export const FREE_SPIN_SECONDS = 15 * 60;
export const CLOCK_SLACK_MS = 10 * 60 * 1000;

// The client's per-browser fallback id for players who are not signed in to Bloxity.
// Guests are never persisted.
export const GUEST_ID_PREFIX = "guest-";
