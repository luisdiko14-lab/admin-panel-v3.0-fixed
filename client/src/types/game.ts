export interface GameStats {
  onlinePlayers: number;
  activeTycoons: number;
  totalRevenue: number;
  uptime?: string;
}

export interface Territory {
  id: string;
  name: string;
  controlledBy?: string;
  team: string;
  position: { x: number; y: number };
  isContested: boolean;
  lastCaptured?: string;
}

export interface ActivityItem {
  id: string;
  userId?: string;
  action: string;
  details: string;
  timestamp: string;
  user?: {
    username?: string;
    rankName?: string;
  };
}

export interface AdminCommand {
  id: string;
  executedBy: string;
  command: string;
  targetUser?: string;
  result: string;
  timestamp: string;
}

export interface Tycoon {
  id: string;
  ownerId: string;
  name: string;
  level: number;
  resources: {
    crystals: number;
    oil: number;
    steel: number;
    energy: number;
  };
  isActive: boolean;
  lastUpdated: string;
}

export interface Rank {
  id: string;
  rankScore: number;
  rankName: string;
  permissions: string[];
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
}
