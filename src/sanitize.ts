import {
  CURRENCY_MAX, REBIRTH_MAX, LEVEL_MAX, PLAY_SECONDS_MAX, SPINS_MAX, BALL_COUNT, LEGEND_IDS,
  INV_SLOTS_MAX, FREE_SPIN_MS, CLOCK_SLACK_MS,
} from "./constants.js";
import type { PlayerDoc } from "./db.js";

export function finite(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
export function clampNum(v: number, max: number): number {
  return Math.min(max, Math.max(0, v));
}
export function clampInt(v: number, max: number, min = 0): number {
  return Math.min(max, Math.max(min, Math.floor(v)));
}
function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

// Football indices: integers inside BALLS, no duplicates.
export function sanitizeBalls(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < BALL_COUNT))];
}

// Known legend ids only, no duplicates.
export function sanitizeLegends(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id): id is string => typeof id === "string" && LEGEND_IDS.includes(id)))];
}

// The game is client-authoritative -- no server-side gameplay validation. What IS enforced:
// shape and bounds, so a malformed payload can never corrupt this player's own Mongo document.
// A forged number can only ever affect the sender's own save and their leaderboard rows.
export function sanitizeProgress(raw: unknown): Partial<PlayerDoc> | null {
  if (!isObject(raw)) return null;
  const out: Partial<PlayerDoc> = {};

  for (const key of ["kickPower", "wins"] as const) {
    if (finite(raw[key])) out[key] = clampNum(raw[key] as number, CURRENCY_MAX);
  }
  if (finite(raw.level)) out.level = clampInt(raw.level, LEVEL_MAX, 1);
  if (finite(raw.rebirths)) out.rebirths = clampInt(raw.rebirths, REBIRTH_MAX);
  if (finite(raw.playtime)) out.playtime = clampInt(raw.playtime, PLAY_SECONDS_MAX);
  if (finite(raw.spins)) out.spins = clampInt(raw.spins, SPINS_MAX);
  if (finite(raw.invSlots)) out.invSlots = clampInt(raw.invSlots, INV_SLOTS_MAX);
  if (finite(raw.freeAt)) out.freeAt = clampInt(raw.freeAt, Date.now() + FREE_SPIN_MS + CLOCK_SLACK_MS);
  if (raw.owned !== undefined) {
    out.owned = sanitizeBalls(raw.owned);
    if (!out.owned.includes(0)) out.owned.unshift(0); // the starter ball is always owned
  }
  if (finite(raw.equipped) && Number.isInteger(raw.equipped) && raw.equipped >= 0 && raw.equipped < BALL_COUNT) {
    out.equipped = raw.equipped;
  }
  if (raw.legends !== undefined) out.legends = sanitizeLegends(raw.legends);
  if (typeof raw.legend === "string" && (raw.legend === "" || LEGEND_IDS.includes(raw.legend))) out.legend = raw.legend;
  return out;
}
