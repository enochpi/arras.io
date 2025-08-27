/**
 * Enhanced Arras.io Game Server
 * Now includes enemy shapes system with collision detection
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Player = require('./player');
const MovementSystem = require('./movement');
const { ProjectileSystem } = require('./projectile');
const CollisionSystem = require('./collision');
const { ShapeSystem } = require('./shapes');

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

// Game systems
const movementSystem = new MovementSystem(4000, 4000);
const projectileSystem = new ProjectileSystem();
const collisionSystem = new CollisionSystem();
const shapeSystem = new ShapeSystem(4000, 4000);

// Game state
const gameState = {
  players: new Map(),
  maxPlayers: 1,
  leaderboard: []
};

const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 4000;
const TICK_RATE = 30;

/**
 * Handle player connections
 */
io.on('connection', (socket) => {
  console.log(`🔌 Player connecting: ${socket.id}`);

  if (gameState.players.size >= gameState.maxPlayers) {
    console.log(`❌ Rejected ${socket.id} - Game full`);
    socket.emit('connection-rejected', { 
      reason: 'Single-player session active',
      message: 'Only one player allowed at a time'
    });
    socket.disconnect();
    return;
  }

  socket.on('join-game', (data) => {
    if (gameState.players.size >= gameState.maxPlayers) {
      socket.emit('connection-rejected', { 
        reason: 'Game full',
        message: 'Another player is already connected'
      });
      return;
    }

    try {
      const playerName = (data && data.name) ? data.name : `Player${Math.floor(Math.random() * 1000)}`;
      const player = new Player(socket.id, playerName);
      gameState.players.set(socket.id, player);
      
      socket.emit('player-joined', {
        playerId: socket.id,
        worldBounds: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
        playerData: player.getClientData()
      });
      
      console.log(`✅ ${player.name} joined at (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`);
    } catch (error) {
      console.error('Error creating player:', error);
      socket.emit('connection-rejected', { 
        reason: 'Server error',
        message: 'Failed to create player'
      });
    }
  });

  socket.on('player-input', (input) => {
    try {
      const player = gameState.players.get(socket.id);
      if (!player || !input) return;

      const now = Date.now();
      const deltaTime = Math.min((now - player.lastUpdate) / 1000, 0.1);

      // Process movement
      if (input.keys) {
        movementSystem.processMovement(player, input, deltaTime);
      }

      // Handle shooting
      if (input.shooting && input.mousePos && player.canShoot()) {
        const projectile = projectileSystem.shoot(player, input.mousePos);
        if (projectile) {
          player.recordShot();
        }
      }
    } catch (error) {
      console.error('Error processing player input:', error);
    }
  });

  socket.on('disconnect', () => {
    try {
      const player = gameState.players.get(socket.id);
      if (player) {
        console.log(`👋 ${player.name} disconnected`);
        gameState.players.delete(socket.id);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

/**
 * Enhanced game loop with shapes
 */
function gameLoop() {
  try {
    const deltaTime = 1000 / TICK_RATE / 1000;
    
    // Update players
    gameState.players.forEach(player => {
      if (player && typeof player.regenerate === 'function') {
        player.regenerate(deltaTime * 1000);
      }
    });
    
    // Update projectiles
    if (projectileSystem) {
      projectileSystem.update(deltaTime, WORLD_WIDTH, WORLD_HEIGHT);
    }
    
    // Update shapes
    if (shapeSystem) {
      shapeSystem.update(deltaTime);
    }
    
    // Handle collisions (now includes shapes)
    if (collisionSystem && projectileSystem && gameState.players) {
      const collisions = collisionSystem.checkCollisions(
        projectileSystem, 
        gameState.players, 
        shapeSystem,
        WORLD_WIDTH, 
        WORLD_HEIGHT
      );
      
      if (collisions.length > 0) {
        const collisionResults = collisionSystem.processCollisions(
          collisions, 
          projectileSystem, 
          gameState.players,
          shapeSystem
        );
        
        // Log collision events
        collisionResults.forEach(result => {
          if (result.type === 'player-hit') {
            console.log(`💥 Player hit: ${result.damage} damage, ${result.killed ? 'KILLED' : 'survived'}`);
          } else if (result.type === 'shape-destroyed') {
            console.log(`🎯 ${result.shapeType} destroyed! +${result.xpAwarded} XP`);
          }
        });
      }
    }
    
    // Update leaderboard
    gameState.leaderboard = Array.from(gameState.players.values())
      .filter(p => p && p.score !== undefined)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => ({ 
        id: p.id, 
        name: p.name, 
        score: p.score, 
        level: p.level 
      }));
    
    // Send game state to clients (now includes shapes)
    const stateUpdate = {
      players: {},
      projectiles: projectileSystem ? projectileSystem.getAllProjectiles() : {},
      shapes: shapeSystem ? shapeSystem.getAllShapes() : {},
      leaderboard: gameState.leaderboard,
      timestamp: Date.now()
    };
    
    gameState.players.forEach((player, id) => {
      if (player && typeof player.getClientData === 'function') {
        stateUpdate.players[id] = player.getClientData();
      }
    });
    
    if (gameState.players.size > 0) {
      io.emit('game-state', stateUpdate);
    }
    
  } catch (error) {
    console.error('Game loop error:', error);
  }
}

// Enhanced status page
app.get('/', (req, res) => {
  const playerCount = gameState.players.size;
  const projectileCount = projectileSystem ? projectileSystem.projectiles.size : 0;
  const shapeCount = shapeSystem ? shapeSystem.shapes.size : 0;
  const shapeStats = shapeSystem ? shapeSystem.getShapeStats() : {};
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Arras.io Server Status</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { color: ${playerCount > 0 ? 'green' : 'red'}; }
        .stats { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 10px 0; }
        .shape-stats { display: flex; gap: 20px; }
        .shape-stat { background: white; padding: 10px; border-radius: 5px; text-align: center; }
      </style>
    </head>
    <body>
      <h1>🎮 Arras.io Server Status</h1>
      <div class="stats">
        <p><strong>Status:</strong> <span class="status">${playerCount > 0 ? '🟢 Active' : '🔴 Waiting for players'}</span></p>
        <p><strong>Connected Players:</strong> ${playerCount}/${gameState.maxPlayers}</p>
        <p><strong>Active Projectiles:</strong> ${projectileCount}</p>
        <p><strong>Total Shapes:</strong> ${shapeCount}</p>
        <p><strong>World Size:</strong> ${WORLD_WIDTH}x${WORLD_HEIGHT}</p>
        <p><strong>Tick Rate:</strong> ${TICK_RATE} FPS</p>
      </div>
      
      <div class="stats">
        <h3>🔷 Shape Distribution:</h3>
        <div class="shape-stats">
          <div class="shape-stat">
            <div>🔺 Triangles</div>
            <div><strong>${shapeStats.triangle || 0}</strong></div>
          </div>
          <div class="shape-stat">
            <div>🔲 Squares</div>
            <div><strong>${shapeStats.square || 0}</strong></div>
          </div>
          <div class="shape-stat">
            <div>⬟ Pentagons</div>
            <div><strong>${shapeStats.pentagon || 0}</strong></div>
          </div>
          <div class="shape-stat">
            <div>⬢ Hexagons</div>
            <div><strong>${shapeStats.hexagon || 0}</strong></div>
          </div>
        </div>
      </div>
      
      <h3>✅ Systems Status:</h3>
      <ul>
        <li>Movement System: ✅ Active</li>
        <li>Projectile System: ✅ Active</li>
        <li>Collision System: ✅ Active</li>
        <li>Shape System: ✅ Active (${shapeCount} shapes)</li>
        <li>Player Management: ✅ Active</li>
      </ul>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Arras.io server running on port ${PORT}`);
  console.log(`🌍 World: ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  console.log(`⚡ Tick rate: ${TICK_RATE} FPS`);
  console.log(`🔷 Shape system: ${shapeSystem.shapes.size} shapes spawned`);
  console.log(`📊 Visit http://localhost:${PORT} for server status`);
});

const gameLoopInterval = setInterval(gameLoop, 1000 / TICK_RATE);

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  clearInterval(gameLoopInterval);
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

module.exports = { gameState, io };
