// Shared types between client and server
export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  position: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  energy: number;
  maxEnergy: number;
  score: number;
  level: number;
  tankClass: string;
  team?: string;
  stats: PlayerStats;
  color: string;
}

export interface PlayerStats {
  healthRegen: number;
  maxHealth: number;
  bodyDamage: number;
  bulletSpeed: number;
  bulletPenetration: number;
  bulletDamage: number;
  reload: number;
  movement: number;
}

export interface Projectile {
  id: string;
  playerId: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  penetration: number;
  size: number;
  color: string;
  lifeTime: number;
}

export interface Enemy {
  id: string;
  type: string;
  position: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  size: number;
  color: string;
  scoreValue: number;
}

export interface GameState {
  players: Map<string, Player>;
  projectiles: Map<string, Projectile>;
  enemies: Map<string, Enemy>;
  leaderboard: Array<{id: string, name: string, score: number}>;
  worldBounds: {width: number, height: number};
}

export interface InputState {
  movement: Vector2;
  mousePosition: Vector2;
  shooting: boolean;
  upgradeRequests: string[];
}

export const TANK_CLASSES = {
  BASIC: 'basic',
  TWIN: 'twin',
  SNIPER: 'sniper',
  MACHINE_GUN: 'machinegun',
  FLANK_GUARD: 'flankguard'
} as const;

export const GAME_CONFIG = {
  WORLD_WIDTH: 4000,
  WORLD_HEIGHT: 4000,
  PLAYER_SIZE: 25,
  PROJECTILE_SPEED: 8,
  ENEMY_SPAWN_RATE: 0.02,
  MAX_ENEMIES: 100,
  UPGRADE_POINTS_PER_LEVEL: 1
} as const;
