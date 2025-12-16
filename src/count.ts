import { CONFIG } from "./config";
import { ProcessedServer } from "./database_types";
import { readFile } from "fs/promises";

const serversData = await readFile(`${CONFIG.dataDir}/servers.json`, "utf-8");
const servers = JSON.parse(serversData) as ProcessedServer[];

console.log(`Total servers: ${servers.length}`);

// Get uniquie players
const uniquePlayerIds = new Set<number>();
for (const server of servers) {
  for (const player of server.players) {
    uniquePlayerIds.add(player.id);
  }
}

console.log(`Unique players: ${uniquePlayerIds.size}`);