/**
 * Enhanced Arras.io Game Server
 * Features: Larger world, auto-shoot support, optimized performance
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

// Expanded world dimensions
const WORLD_WIDTH = 6000;
const WORLD_HEIGHT = 6000;
const TICK_RATE = 30;

// Game systems
const movementSystem = new MovementSystem(WORLD_WIDTH, WORLD_HEIGHT);
const projectileSystem = new ProjectileSystem();
const collisionSystem = new CollisionSystem();
const shapeSystem = new ShapeSystem(WORLD_WIDTH, WORLD_HEIGHT);

// Game state
const gameState = {
  players: new Map(),
  maxPlayers: 10,
  leaderboard: []
};

/**
 * Handle player connections
 */
io.on('connection', (socket) => {
  console.log(`🔌 Player connecting: ${socket.id}`);

  socket.on('join-game', (data) => {
    if (gameState.players.size >= gameState.maxPlayers) {
      socket.emit('connection-rejected', { 
        reason: 'Game full',
        message: 'Server is at maximum capacity'
      });
      return;
    }

    try {
      const playerName = (data && data.name) ? data.name : `Player${Math.floor(Math.random() * 1000)}`;
      const player = new Player(socket.id, playerName);
      
      // Spawn player in random position within safe zone
      player.position.x = Math.random() * (WORLD_WIDTH - 1000) + 500;
      player.position.y = Math.random() * (WORLD_HEIGHT - 1000) + 500;
      
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

      // Handle auto-shooting
      if (input.autoShooting && input.mousePos) {
        // Auto-shoot with reduced fire rate for balance
        const autoShootCooldown = 150; // ms between auto shots
        if (!player.lastAutoShot || now - player.lastAutoShot >= autoShootCooldown) {
          if (player.canShoot()) {
            const projectile = projectileSystem.shoot(player, input.mousePos);
            if (projectile) {
              player.recordShot();
              player.lastAutoShot = now;
            }
          }
        }
      } else if (input.shooting && input.mousePos && player.canShoot()) {
        // Regular shooting
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
 * Optimized game loop
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
    
    // Update projectiles with spatial partitioning
    if (projectileSystem) {
      projectileSystem.update(deltaTime, WORLD_WIDTH, WORLD_HEIGHT);
    }
    
    // Update shapes with optimized spawning
    if (shapeSystem) {
      shapeSystem.update(deltaTime);
    }
    
    // Handle collisions with spatial optimization
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
        
        // Log significant events only
        collisionResults.forEach(result => {
          if (result.type === 'player-hit' && result.killed) {
            console.log(`💥 Player eliminated!`);
          } else if (result.type === 'shape-destroyed' && result.xpAwarded >= 50) {
            console.log(`🎯 Large ${result.shapeType} destroyed! +${result.xpAwarded} XP`);
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
    
    // Send optimized game state to clients
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
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          margin: 40px; 
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          min-height: 100vh;
        }
        h1 { 
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          font-size: 2.5em;
        }
        .status { 
          color: ${playerCount > 0 ? '#4CAF50' : '#FF5252'}; 
          font-weight: bold;
        }
        .stats { 
          background: rgba(255,255,255,0.1); 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0; 
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .shape-stats { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px; 
          margin-top: 15px;
        }
        .shape-stat { 
          background: rgba(255,255,255,0.1); 
          padding: 15px; 
          border-radius: 8px; 
          text-align: center;
          transition: transform 0.3s ease;
        }
        .shape-stat:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.15);
        }
        .shape-icon {
          font-size: 2em;
          margin-bottom: 10px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        li:last-child {
          border-bottom: none;
        }
      </style>
    </head>
    <body>
      <h1>🎮 Arras.io Enhanced Server</h1>
      <div class="stats">
        <p><strong>Status:</strong> <span class="status">${playerCount > 0 ? '🟢 Active' : '🔴 Waiting'}</span></p>
        <p><strong>Connected Players:</strong> ${playerCount}/${gameState.maxPlayers}</p>
        <p><strong>Active Projectiles:</strong> ${projectileCount}</p>
        <p><strong>Total Shapes:</strong> ${shapeCount}</p>
        <p><strong>World Size:</strong> ${WORLD_WIDTH}x${WORLD_HEIGHT} (Expanded!)</p>
        <p><strong>Tick Rate:</strong> ${TICK_RATE} FPS</p>
      </div>
      
      <div class="stats">
        <h3>🔷 Shape Distribution</h3>
        <div class="shape-stats">
          <div class="shape-stat">
            <div class="shape-icon" style="color: #FF6B6B;">▲</div>
            <div>Triangles</div>
            <div><strong>${shapeStats.triangle || 0}</strong></div>
          </div>
          <div class="shape-stat">
            <div class="shape-icon" style="color: #FFE66D;">■</div>
            <div>Squares</div>
            <div><strong>${shapeStats.square || 0}</strong></div>
          </div>
          <div class="shape-stat">
            <div class="shape-icon" style="color: #4ECDC4;">⬟</div>
            <div>Pentagons</div>
            <div><strong>${shapeStats.pentagon || 0}</strong></div>
          </div>
          <div class="shape-stat">
            <div class="shape-icon" style="color: #A8E6CF;">⬢</div>
            <div>Hexagons</div>
            <div><strong>${shapeStats.hexagon || 0}</strong></div>
          </div>
        </div>
      </div>
      
      <div class="stats">
        <h3>✨ Enhanced Features</h3>
        <ul>
          <li>✅ Expanded World (${WORLD_WIDTH}x${WORLD_HEIGHT})</li>
          <li>✅ Auto-Shoot System (Press E)</li>
          <li>✅ Performance Optimizations</li>
          <li>✅ Enhanced Visual Effects</li>
          <li>✅ Spatial Partitioning</li>
          <li>✅ Improved Shape Distribution</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Enhanced Arras.io server running on port ${PORT}`);
  console.log(`🌍 Expanded World: ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  console.log(`⚡ Tick rate: ${TICK_RATE} FPS`);
  console.log(`🎮 Features: Auto-shoot, Performance optimizations`);
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
