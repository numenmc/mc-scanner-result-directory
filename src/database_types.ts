export interface Server {
  id: number;
  ip: string;
  port: number;
  motd: string | null;
  version: string | null;
  protocol: number | null;
  latency: number | null;
  max_players: number | null;
  online_players: number | null;
  last_checked: Date | null;
}

export interface Player {
  id: number;
  uuid: string; // CHAR(36)
  name: string; // VARCHAR(16)
}

export interface ServerPlayer {
  server_id: number;
  player_id: number;
  first_seen: Date | null;
  last_seen: Date | null;
}

export interface ProcessedPlayer {
  id: number;
  uuid: string;
  name: string;
}

export interface ProcessedServer {
  id: number;
  host: string; // `${server.ip}:${server.port}`
  motd: string | null;
  version: string | null;
  protocol: number | null;
  max_players: number | null;
  online_players: number | null;
  fetch_time: string | null; // ISO string from Date
  players: ProcessedPlayer[];
}
