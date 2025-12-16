import { mkdir, writeFile } from "fs/promises";
import { CONFIG } from "./config";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { Player, Server, ProcessedServer } from "./database_types";
import dotenv from "dotenv";

dotenv.config();

const argv = {
  host: process.env.host as string,
  port: parseInt(process.env.port as string),
  user: process.env.user as string,
  password: process.env.password as string,
  database: process.env.database as string,
};

(async () => {
  // Create data dir if non existent
  await mkdir(CONFIG.dataDir, { recursive: true });

  // Connect to database
  const connection = await mysql.createConnection({
    host: argv.host,
    port: argv.port,
    user: argv.user,
    password: argv.password,
    database: argv.database,
  });

  const [servers] = await connection.execute<(Server & RowDataPacket)[]>(`
        SELECT * FROM servers
    `);

  const resolvedServers: ProcessedServer[] = [];

  for (const server of servers) {
    console.log(
      `Processing server ${server.ip}:${server.port} (#${server.id})`
    );

    const [players] = await connection.execute<(Player & RowDataPacket)[]>(
      `
        SELECT p.id, p.uuid, p.name
        FROM server_players sp
        JOIN players p ON p.id = sp.player_id
        WHERE sp.server_id = ?
        `,
      [server.id]
    );

    resolvedServers.push({
      id: server.id,
      host: `${server.ip}:${server.port}`,
      motd: server.motd ? stripFormattingCodes(server.motd) : null,
      version: server.version,
      protocol: server.protocol,
      max_players: server.max_players,
      online_players: server.online_players,
      fetch_time: server.last_checked
        ? server.last_checked.toISOString()
        : null,
      players: players.map((player) => ({
        id: player.id,
        uuid: player.uuid,
        name: player.name,
      })),
    });
  }

  await writeFile(
    `${CONFIG.dataDir}/servers.json`,
    JSON.stringify(resolvedServers, null, 2),
    "utf-8"
  );

  await connection.end();
})();

function stripFormattingCodes(motd: string): string {
  return motd.replace(/§[0-9A-FK-OR]/gi, "");
}
