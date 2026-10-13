import { MongoClient, type Collection } from "mongodb";

// Bloxity Legion hosting injects MONGODB_URI per game+channel -- an isolated database with
// scoped credentials. A local `npm start` normally has no Mongo reachable, so a missing or
// unreachable URI must degrade to "no persistence" rather than crash the room.

// Mirrors the persisted half of the client's src/stats.js (its SAVED list).
export interface PlayerDoc {
  _id: string; // Bloxity user id -- see WorldRoom.ts (guests are never saved)
  // Display name as of the last save, so an offline leaderboard row still has something to show.
  username?: string;
  // Bloxity avatar JSON as last reported, so a board's top row can still be dressed offline.
  avatar?: string;
  pfp?: string; // Bloxity profile picture URL as last reported
  bestDistance?: number; // longest kick, metres
  tutorialStep?: number; // new-player tutorial progress; a doc without it predates the tutorial (client treats it as finished)
  level?: number;
  kickPower?: number;
  wins?: number;
  rebirths?: number;
  owned?: number[]; // football indices unlocked
  equipped?: number;
  playtime?: number; // s
  legends?: string[]; // owned legend ids
  legend?: string; // equipped legend ('' = none)
  invSlots?: number;
  spins?: number; // Lucky Wheel spins in stock
  freeOnline?: number; // s played towards the next free spin
  lastSeen?: number; // epoch ms of the last activity (24h+ away grants a free spin on return)
  version: number;
  updatedAt: Date;
}

let client: MongoClient | null = null;
let players: Collection<PlayerDoc> | null = null;

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[db] MONGODB_URI not set -- player progress will not persist");
    return;
  }
  try {
    client = new MongoClient(uri);
    await client.connect();
    // No dbName passed to .db() -- the injected URI already points at this game+channel's database.
    players = client.db().collection<PlayerDoc>("players");
    console.log("[db] connected to MongoDB");

    // refreshLeaderboard() sorts by each of these; createIndex is idempotent. A failure only
    // means those queries stay unindexed, never blocks startup.
    try {
      await players.createIndex({ rebirths: -1 });
      await players.createIndex({ level: -1 });
      await players.createIndex({ playtime: -1 });
    } catch (err) {
      console.warn("[db] failed to create leaderboard indexes:", err);
    }
  } catch (err) {
    console.warn("[db] connect failed -- player progress will not persist:", err);
    client = null;
    players = null;
  }
}

// Null whenever Mongo is unset/unreachable -- every caller must treat that as "skip persistence".
export function getPlayers(): Collection<PlayerDoc> | null {
  return players;
}

// Test-only seam: exercise the leaderboard/save logic against an in-memory fake collection.
export function __setPlayersForTest(fake: Collection<PlayerDoc> | null): void {
  players = fake;
}
