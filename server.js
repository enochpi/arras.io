const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Import our game modules
const MovementSystem = require('./movement');
const { ProjectileSystem } = require('./projectile');
const CollisionSystem = require('./collision');

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

// Single-player state tracking
let connectedPlayer = null;

// Game constants
const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 4000;

// Enhanced Player class
class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name || `Player${Math.floor(Math.random() * 1000)}`;
    this.position = {
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT
    };
    this.rotation = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.score = 0;
    this.level = 1;
    this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    this.lastUpdate = Date.now();
    this.lastShot = 0;
    this.fireRate = 300; // Milliseconds between shots
  }

  canShoot() {
    return Date.now() - this.lastShot >= this.fireRate;
  }

  recordShot() {
    this.lastShot = Date.now();
  }

  getClientData() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      rotation: this.rotation,
      health: this.health,
      maxHealth: this.maxHealth,
      score: this.score,
      level: this.level,
      color: this.color
    };
  }
}

// Socket.io connection handling with single-player enforcement
io.on('connection', (socket) => {
  console.log(`🔌 Connection attempt from: ${socket.id}`);

  // SINGLE-PLAYER ENFORCEMENT: Reject if player already connected
  if (connectedPlayer) {
    console.log(`❌ Rejected ${socket.id} - Only one player allowed`);
    socket.emit('connection-rejected', {
      message: 'Only one player allowed at a time. Please try again later.',
      reason: 'single-player-limit'
    });
    socket.disconnect(true);
    return;
  }

  // Allow the connection
  console.log(`✅ Player connection accepted: ${socket.id}`);

  socket.on('join-game', (data) => {
    // Double-check in case of race conditions
    if (connectedPlayer && connectedPlayer.id !== socket.id) {
      socket.emit('connection-rejected', {
        message: 'Another player is already connected.',
        reason: 'single-player-limit'
      });
      socket.disconnect(true);
      return;
    }

    const player = new Player(socket.id, data.name);
    connectedPlayer = player;
    
    socket.emit('player-joined', {
      playerId: socket.id,
      worldBounds: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
      gameMode: 'single-player'
    });
    
    console.log(`🎮 ${player.name} joined the single-player game at (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`);
  });

  // Handle player input
  socket.on('player-input', (input) => {
    if (!connectedPlayer || connectedPlayer.id !== socket.id) return;

    const deltaTime = Date.now() - connectedPlayer.lastUpdate;
    
    // Process movement
    movementSystem.processInput(connectedPlayer, input, deltaTime);
    
    // Handle shooting
    if (input.shooting && connectedPlayer.canShoot()) {
      projectileSystem.createProjectile(connectedPlayer, input.mousePosition);
      connectedPlayer.recordShot();
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (connectedPlayer && connectedPlayer.id === socket.id) {
      console.log(`👋 ${connectedPlayer.name} disconnected - slot now available`);
      connectedPlayer = null;
    }
  });
});

// Single-player game loop
function gameLoop() {
  // Only run game loop if player is connected
  if (!connectedPlayer) return;

  const deltaTime = 1000 / 30; // 30 FPS
  
  // Update projectiles
  projectileSystem.updateProjectiles(deltaTime, WORLD_WIDTH, WORLD_HEIGHT);
  
  // For single-player, we could add AI enemies here instead of player vs player
  // Currently just managing projectiles and player state
  
  // Send game state to the single connected player
  const stateToSend = {
    player: connectedPlayer.getClientData(),
    projectiles: projectileSystem.getAllProjectiles(),
    gameMode: 'single-player',
    timestamp: Date.now()
  };
  
  // Emit to the specific connected player
  if (connectedPlayer) {
    io.to(connectedPlayer.id).emit('game-state', stateToSend);
  }
}

// Basic HTML page with single-player info
app.get('/', (req, res) => {
  const playerStatus = connectedPlayer ? 
    `🟢 Player "${connectedPlayer.name}" is currently playing` : 
    `🔴 No player connected - slot available`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Arras.io Single-Player Server</title>
    </head>
    <body>
      <h1>🎮 Arras.io Single-Player Server</h1>
      <p><strong>Status:</strong> ${playerStatus}</p>
      <p><strong>Game Mode:</strong> Single-Player Only</p>
      <p><strong>Connection Limit:</strong> 1 player maximum</p>
      
      <h3>✅ Active Systems:</h3>
      <ul>
        <li>Single-player connection enforcement</li>
        <li>Player movement (WASD)</li>
        <li>Projectile system</li>
        <li>Real-time game state updates</li>
      </ul>
      
      <h3>📋 Connection Rules:</h3>
      <ul>
        <li>Only one player can connect at a time</li>
        <li>Additional connections are automatically rejected</li>
        <li>Slot becomes available when player disconnects</li>
      </ul>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Arras.io SINGLE-PLAYER server running on http://localhost:${PORT}`);
  console.log(`🌍 World size: ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  console.log(`👤 Connection limit: 1 player maximum`);
  console.log(`⚡ Single-player enforcement active!`);
});

// Start game loop at 30 FPS
setInterval(gameLoop, 1000 / 30);
