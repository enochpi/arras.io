/**
 * Arras.io Game Server
 * Main server file handling Socket.io connections and game loop
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Player = require('./player');

// Server setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Game state
const gameState = {
  players: new Map(),
  projectiles: new Map(),
  enemies: new Map(),
  leaderboard: []
};

// Game constants
const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 4000;
const TICK_RATE = 60; // Server updates per second

/**
 * Handle new player connections
 */
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins the game
  socket.on('join-game', (data) => {
    const player = new Player(socket.id, data.name);
    gameState.players.set(socket.id, player);
    
    // Send initial game state to new player
    socket.emit('player-joined', {
      playerId: socket.id,
      worldBounds: { width: WORLD_WIDTH, height: WORLD_HEIGHT }
    });
    
    console.log(`${player.name} joined the game at (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`);
  });

  // Handle player input (movement, shooting, etc.)
  socket.on('player-input', (input) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    const deltaTime = Date.now() - player.lastUpdate;
    player.lastUpdate = Date.now();

    // Update player position
    player.updatePosition(input, deltaTime);
    
    // Update player rotation
    player.updateRotation(input.mousePosition);

    // Handle shooting
    if (input.shooting && player.canShoot()) {
      createProjectile(player, input.mousePosition);
      player.recordShot();
    }

    // Handle upgrade requests
    if (input.upgradeRequests && input.upgradeRequests.length > 0) {
      handleUpgrades(player, input.upgradeRequests);
    }
  });

  // Player disconnects
  socket.on('disconnect', () => {
    const player = gameState.players.get(socket.id);
    if (player) {
      console.log(`${player.name} disconnected`);
      gameState.players.delete(socket.id);
    }
  });
});

/**
 * Create a projectile from player
 */
function createProjectile(player, targetPos) {
  const angle = Math.atan2(
    targetPos.y - 400, // Screen center offset
    targetPos.x - 400
  );
  
  const projectile = {
    id: generateId(),
    playerId: player.id,
    position: { ...player.position },
    velocity: {
      x: Math.cos(angle) * player.stats.bulletSpeed,
      y: Math.sin(angle) * player.stats.bulletSpeed
    },
    damage: player.stats.bulletDamage,
    penetration: player.stats.bulletPenetration,
    size: 4,
    color: player.color,
    lifeTime: 3000, // 3 seconds
    createdAt: Date.now()
  };
  
  gameState.projectiles.set(projectile.id, projectile);
}

/**
 * Handle player upgrades
 */
function handleUpgrades(player, upgradeRequests) {
  upgradeRequests.forEach(statName => {
    if (player.upgradePoints > 0 && player.stats[statName] !== undefined) {
      player.stats[statName] += 1;
      player.upgradePoints -= 1;
      
      // Update max health if health was upgraded
      if (statName === 'maxHealth') {
        player.maxHealth = player.stats.maxHealth;
      }
    }
  });
}

/**
 * Generate unique ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Update leaderboard
 */
function updateLeaderboard() {
  gameState.leaderboard = Array.from(gameState.players.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(player => ({
      id: player.id,
      name: player.name,
      score: player.score,
      level: player.level
    }));
}

/**
 * Main game loop - runs at 60 FPS
 */
function gameLoop() {
  const now = Date.now();
  
  // Update all players (regeneration, etc.)
  gameState.players.forEach(player => {
    player.regenerate(1000 / TICK_RATE);
  });
  
  // Update leaderboard
  updateLeaderboard();
  
  // Send game state to all clients
  const stateToSend = {
    players: Object.fromEntries(
      Array.from(gameState.players.entries()).map(([id, player]) => [id, player.getClientData()])
    ),
    projectiles: Object.fromEntries(gameState.projectiles),
    enemies: Object.fromEntries(gameState.enemies),
    leaderboard: gameState.leaderboard,
    timestamp: now
  };
  
  io.emit('game-state', stateToSend);
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Arras.io server running on port ${PORT}`);
  console.log(`🌍 World size: ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  console.log(`⚡ Tick rate: ${TICK_RATE} FPS`);
});

// Start game loop
setInterval(gameLoop, 1000 / TICK_RATE);

module.exports = { gameState, io };
