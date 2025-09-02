/**
 * Arras.io Single-Player Game - Complete Client-Side Implementation
 * No server required - runs entirely in the browser
 */

// ==================== GAME CONFIGURATION ====================
const CONFIG = {
  // World settings
  WORLD_WIDTH: 10000,
  WORLD_HEIGHT: 10000,
  GRID_SIZE: 50,
  
  // Player settings
  PLAYER_SIZE: 30,
  PLAYER_SPEED: 3,
  PLAYER_MAX_HEALTH: 100,
  PLAYER_REGEN_RATE: 0.1,
  
  // Projectile settings
  BULLET_SIZE: 10,
  BULLET_SPEED: 8,
  BULLET_DAMAGE: 20,
  FIRE_RATE: 200, // milliseconds
  BULLET_LIFETIME: 2000, // milliseconds
  
  // Shape settings
  MAX_SHAPES: 5000,
  SHAPE_SPAWN_RATE: 100, // milliseconds
  SHAPES: {
    triangle: { sides: 3, size: 25, health: 30, xp: 10, color: '#FF6B6B', speed: 1 },
    square: { sides: 4, size: 30, health: 50, xp: 20, color: '#FFE66D', speed: 0.8 },
    pentagon: { sides: 5, size: 35, health: 80, xp: 35, color: '#4ECDC4', speed: 0.6 },
    hexagon: { sides: 6, size: 40, health: 120, xp: 50, color: '#A8E6CF', speed: 0.4 }
  },
  
  // Level system
  XP_PER_LEVEL: 100,
  UPGRADE_POINTS_PER_LEVEL: 1
};

// ==================== GAME STATE ====================
class GameState {
  constructor() {
    this.player = {
      x: CONFIG.WORLD_WIDTH / 2,
      y: CONFIG.WORLD_HEIGHT / 2,
      vx: 0,
      vy: 0,
      angle: 0,
      health: CONFIG.PLAYER_MAX_HEALTH,
      maxHealth: CONFIG.PLAYER_MAX_HEALTH,
      score: 0,
      level: 1,
      xp: 0,
      xpToNext: CONFIG.XP_PER_LEVEL,
      upgradePoints: 0,
      stats: {
        damage: 1,
        reload: 1,
        speed: 1,
        regen: 1,
        bulletSpeed: 1
      }
    };
    
    this.projectiles = [];
    this.shapes = [];
    this.particles = [];
    this.camera = { x: 0, y: 0 };
    this.keys = {};
    this.mouse = { x: 0, y: 0, pressed: false };
    this.lastShot = 0;
    this.lastShapeSpawn = 0;
    this.upgradeMenuOpen = false;
  }
  
  reset() {
    this.player.health = this.player.maxHealth;
    this.player.x = CONFIG.WORLD_WIDTH / 2;
    this.player.y = CONFIG.WORLD_HEIGHT / 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.score = 0;
    this.player.level = 1;
    this.player.xp = 0;
    this.projectiles = [];
    this.shapes = [];
    this.particles = [];
  }
}

// ==================== SHAPE CLASS ====================
class Shape {
  constructor(type, x, y) {
    const config = CONFIG.SHAPES[type];
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * config.speed;
    this.vy = (Math.random() - 0.5) * config.speed;
    this.sides = config.sides;
    this.size = config.size;
    this.health = config.health;
    this.maxHealth = config.health;
    this.xp = config.xp;
    this.color = config.color;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }
  
  update() {
    // Simple movement with boundary bouncing
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.rotationSpeed;
    
    // Bounce off walls
    if (this.x - this.size < 0 || this.x + this.size > CONFIG.WORLD_WIDTH) {
      this.vx *= -1;
      this.x = Math.max(this.size, Math.min(CONFIG.WORLD_WIDTH - this.size, this.x));
    }
    if (this.y - this.size < 0 || this.y + this.size > CONFIG.WORLD_HEIGHT) {
      this.vy *= -1;
      this.y = Math.max(this.size, Math.min(CONFIG.WORLD_HEIGHT - this.size, this.y));
    }
  }
  
  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }
}

// ==================== PROJECTILE CLASS ====================
class Projectile {
  constructor(x, y, angle, damage, speed) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.lifetime = CONFIG.BULLET_LIFETIME;
    this.size = CONFIG.BULLET_SIZE;
  }
  
  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
    this.lifetime -= deltaTime;
    
    // Check boundaries
    if (this.x < 0 || this.x > CONFIG.WORLD_WIDTH || 
        this.y < 0 || this.y > CONFIG.WORLD_HEIGHT) {
      this.lifetime = 0;
    }
    
    return this.lifetime > 0;
  }
}

// ==================== PARTICLE CLASS ====================
class Particle {
  constructor(x, y, color, size = 5) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.color = color;
    this.size = size;
    this.lifetime = 1;
  }
  
  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.lifetime -= deltaTime / 500;
    this.size *= 0.98;
    return this.lifetime > 0;
  }
}

// ==================== GAME ENGINE ====================
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
    
    this.state = new GameState();
    this.lastTime = 0;
    this.running = true;
    
    this.setupCanvas();
    this.setupEventListeners();
    this.spawnInitialShapes();
    this.gameLoop(0);
  }
  
  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.minimapCanvas.width = 176;
    this.minimapCanvas.height = 176;
  }
  
  setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.state.keys[e.code] = true;
      
      // Toggle upgrade menu
      if (e.code === 'KeyU' && this.state.player.upgradePoints > 0) {
        this.toggleUpgradeMenu();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.state.keys[e.code] = false;
    });
    
    // Mouse controls
    this.canvas.addEventListener('mousemove', (e) => {
      this.state.mouse.x = e.clientX;
      this.state.mouse.y = e.clientY;
    });
    
    this.canvas.addEventListener('mousedown', () => {
      this.state.mouse.pressed = true;
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.state.mouse.pressed = false;
    });
    
    // Upgrade buttons
    document.querySelectorAll('.upgrade-option').forEach(button => {
      button.addEventListener('click', (e) => {
        const upgrade = e.currentTarget.dataset.upgrade;
        this.applyUpgrade(upgrade);
      });
    });
  }
  
  toggleUpgradeMenu() {
    const menu = document.getElementById('upgrade-menu');
    this.state.upgradeMenuOpen = !this.state.upgradeMenuOpen;
    
    if (this.state.upgradeMenuOpen && this.state.player.upgradePoints > 0) {
      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
  }
  
  applyUpgrade(type) {
    if (this.state.player.upgradePoints <= 0) return;
    
    switch(type) {
      case 'health':
        this.state.player.maxHealth += 20;
        this.state.player.health += 20;
        break;
      case 'damage':
        this.state.player.stats.damage *= 1.25;
        break;
      case 'reload':
        this.state.player.stats.reload *= 1.2;
        break;
      case 'speed':
        this.state.player.stats.speed *= 1.15;
        break;
      case 'regen':
        this.state.player.stats.regen *= 1.5;
        break;
      case 'bulletSpeed':
        this.state.player.stats.bulletSpeed *= 1.2;
        break;
    }
    
    this.state.player.upgradePoints--;
    if (this.state.player.upgradePoints <= 0) {
      this.toggleUpgradeMenu();
    }
  }
  
  spawnInitialShapes() {
    for (let i = 0; i < 20; i++) {
      this.spawnShape();
    }
  }
  
  spawnShape() {
    const types = Object.keys(CONFIG.SHAPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * CONFIG.WORLD_WIDTH;
    const y = Math.random() * CONFIG.WORLD_HEIGHT;
    
    // Don't spawn too close to player
    const dx = x - this.state.player.x;
    const dy = y - this.state.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 200) {
      this.state.shapes.push(new Shape(type, x, y));
    }
  }
  
  // ==================== UPDATE LOGIC ====================
  update(deltaTime) {
    // Update player movement
    this.updatePlayer(deltaTime);
    
    // Update projectiles
    this.state.projectiles = this.state.projectiles.filter(p => p.update(deltaTime));
    
    // Update shapes
    this.state.shapes.forEach(shape => shape.update());
    
    // Update particles
    this.state.particles = this.state.particles.filter(p => p.update(deltaTime));
    
    // Check collisions
    this.checkCollisions();
    
    // Spawn new shapes periodically
    if (Date.now() - this.state.lastShapeSpawn > CONFIG.SHAPE_SPAWN_RATE) {
      if (this.state.shapes.length < CONFIG.MAX_SHAPES) {
        this.spawnShape();
      }
      this.state.lastShapeSpawn = Date.now();
    }
    
    // Player regeneration
    if (this.state.player.health < this.state.player.maxHealth) {
      this.state.player.health += CONFIG.PLAYER_REGEN_RATE * this.state.player.stats.regen;
      this.state.player.health = Math.min(this.state.player.health, this.state.player.maxHealth);
    }
    
    // Update camera to follow player
    this.state.camera.x = this.state.player.x - this.canvas.width / 2;
    this.state.camera.y = this.state.player.y - this.canvas.height / 2;
    
    // Update UI
    this.updateUI();
  }
  
  updatePlayer(deltaTime) {
    const player = this.state.player;
    const keys = this.state.keys;
    
    // Movement input
    let dx = 0, dy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dy = -1;
    if (keys['KeyS'] || keys['ArrowDown']) dy = 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx = -1;
    if (keys['KeyD'] || keys['ArrowRight']) dx = 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }
    
    // Apply movement with stats
    player.vx = dx * CONFIG.PLAYER_SPEED * player.stats.speed;
    player.vy = dy * CONFIG.PLAYER_SPEED * player.stats.speed;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Keep player in bounds
    player.x = Math.max(CONFIG.PLAYER_SIZE, Math.min(CONFIG.WORLD_WIDTH - CONFIG.PLAYER_SIZE, player.x));
    player.y = Math.max(CONFIG.PLAYER_SIZE, Math.min(CONFIG.WORLD_HEIGHT - CONFIG.PLAYER_SIZE, player.y));
    
    // Calculate angle to mouse
    const mouseWorldX = this.state.mouse.x + this.state.camera.x;
    const mouseWorldY = this.state.mouse.y + this.state.camera.y;
    player.angle = Math.atan2(mouseWorldY - player.y, mouseWorldX - player.x);
    
    // Shooting
    if (this.state.mouse.pressed) {
      const fireRate = CONFIG.FIRE_RATE / player.stats.reload;
      if (Date.now() - this.state.lastShot > fireRate) {
        this.shoot();
        this.state.lastShot = Date.now();
      }
    }
  }
  
  shoot() {
    const player = this.state.player;
    const bulletSpeed = CONFIG.BULLET_SPEED * player.stats.bulletSpeed;
    const damage = CONFIG.BULLET_DAMAGE * player.stats.damage;
    
    // Create bullet from tank barrel position
    const barrelLength = CONFIG.PLAYER_SIZE + 10;
    const bulletX = player.x + Math.cos(player.angle) * barrelLength;
    const bulletY = player.y + Math.sin(player.angle) * barrelLength;
    
    this.state.projectiles.push(new Projectile(bulletX, bulletY, player.angle, damage, bulletSpeed));
    
    // Recoil effect
    player.vx -= Math.cos(player.angle) * 2;
    player.vy -= Math.sin(player.angle) * 2;
  }
  
  checkCollisions() {
    const player = this.state.player;
    
    // Check projectile-shape collisions
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.state.projectiles[i];
      
      for (let j = this.state.shapes.length - 1; j >= 0; j--) {
        const shape = this.state.shapes[j];
        const dx = projectile.x - shape.x;
        const dy = projectile.y - shape.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < projectile.size + shape.size) {
          // Hit!
          const destroyed = shape.takeDamage(projectile.damage);
          
          // Create hit particles
          for (let k = 0; k < 5; k++) {
            this.state.particles.push(new Particle(shape.x, shape.y, shape.color));
          }
          
          if (destroyed) {
            // Shape destroyed
            this.addXP(shape.xp);
            player.score += shape.xp * 10;
            
            // Create destruction particles
            for (let k = 0; k < 10; k++) {
              this.state.particles.push(new Particle(shape.x, shape.y, shape.color, 8));
            }
            
            this.state.shapes.splice(j, 1);
          }
          
          // Remove projectile
          this.state.projectiles.splice(i, 1);
          break;
        }
      }
    }
    
    // Check player-shape collisions
    for (let i = this.state.shapes.length - 1; i >= 0; i--) {
      const shape = this.state.shapes[i];
      const dx = player.x - shape.x;
      const dy = player.y - shape.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < CONFIG.PLAYER_SIZE + shape.size) {
        // Collision damage
        player.health -= 5;
        
        // Push both away
        const pushAngle = Math.atan2(dy, dx);
        player.x += Math.cos(pushAngle) * 5;
        player.y += Math.sin(pushAngle) * 5;
        shape.x -= Math.cos(pushAngle) * 5;
        shape.y -= Math.sin(pushAngle) * 5;
        
        // Create collision particles
        for (let j = 0; j < 3; j++) {
          this.state.particles.push(new Particle(
            (player.x + shape.x) / 2,
            (player.y + shape.y) / 2,
            '#FF0000'
          ));
        }
        
        // Check game over
        if (player.health <= 0) {
          this.gameOver();
        }
      }
    }
  }
  
  addXP(amount) {
    const player = this.state.player;
    player.xp += amount;
    
    // Level up check
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = CONFIG.XP_PER_LEVEL * player.level;
      player.upgradePoints += CONFIG.UPGRADE_POINTS_PER_LEVEL;
      
      // Auto-open upgrade menu on level up
      if (player.upgradePoints > 0) {
        this.toggleUpgradeMenu();
      }
    }
  }
  
  gameOver() {
    alert(`Game Over! Final Score: ${this.state.player.score}`);
    this.state.reset();
  }
  
  updateUI() {
    const player = this.state.player;
    
    // Update score and level
    document.getElementById('score').textContent = player.score;
    document.getElementById('level').textContent = player.level;
    
    // Update health bar
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent = `${Math.ceil(player.health)}/${player.maxHealth}`;
    
    // Update XP bar
    const xpPercent = (player.xp / player.xpToNext) * 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').textContent = `${Math.floor(player.xp)}/${player.xpToNext}`;
  }
  
  // ==================== RENDERING ====================
  render() {
    // Clear main canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context for camera transform
    this.ctx.save();
    
    // Apply camera transform
    this.ctx.translate(-this.state.camera.x, -this.state.camera.y);
    
    // Draw grid
    this.drawGrid();
    
    // Draw game objects
    this.drawShapes();
    this.drawProjectiles();
    this.drawParticles();
    this.drawPlayer();
    
    // Restore context
    this.ctx.restore();
    
    // Draw minimap (no camera transform)
    this.drawMinimap();
  }
  
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    
    // Calculate visible grid area
    const startX = Math.floor(this.state.camera.x / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    const startY = Math.floor(this.state.camera.y / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    const endX = startX + this.canvas.width + CONFIG.GRID_SIZE;
    const endY = startY + this.canvas.height + CONFIG.GRID_SIZE;
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x += CONFIG.GRID_SIZE) {
      if (x >= 0 && x <= CONFIG.WORLD_WIDTH) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, Math.max(0, startY));
        this.ctx.lineTo(x, Math.min(CONFIG.WORLD_HEIGHT, endY));
        this.ctx.stroke();
      }
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY; y += CONFIG.GRID_SIZE) {
      if (y >= 0 && y <= CONFIG.WORLD_HEIGHT) {
        this.ctx.beginPath();
        this.ctx.moveTo(Math.max(0, startX), y);
        this.ctx.lineTo(Math.min(CONFIG.WORLD_WIDTH, endX), y);
        this.ctx.stroke();
      }
    }
  }
  
  drawPlayer() {
    const player = this.state.player;
    
    this.ctx.save();
    this.ctx.translate(player.x, player.y);
    this.ctx.rotate(player.angle);
    
    // Draw tank body
    this.ctx.fillStyle = '#00B2E1';
    this.ctx.strokeStyle = '#0099CC';
    this.ctx.lineWidth = 3;
    
    this.ctx.beginPath();
    this.ctx.arc(0, 0, CONFIG.PLAYER_SIZE, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw tank barrel
    this.ctx.fillStyle = '#808080';
    this.ctx.strokeStyle = '#606060';
    this.ctx.lineWidth = 2;
    
    const barrelLength = CONFIG.PLAYER_SIZE + 15;
    const barrelWidth = 15;
    
    this.ctx.fillRect(0, -barrelWidth/2, barrelLength, barrelWidth);
    this.ctx.strokeRect(0, -barrelWidth/2, barrelLength, barrelWidth);
    
    this.ctx.restore();
    
    // Draw health bar above player
    if (player.health < player.maxHealth) {
      const barWidth = 50;
      const barHeight = 6;
      const barY = player.y - CONFIG.PLAYER_SIZE - 15;
      
      // Background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(player.x - barWidth/2, barY, barWidth, barHeight);
      
      // Health fill
      const healthPercent = player.health / player.maxHealth;
      this.ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
      this.ctx.fillRect(player.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
    }
  }
  
  drawShapes() {
    this.state.shapes.forEach(shape => {
      this.ctx.save();
      this.ctx.translate(shape.x, shape.y);
      this.ctx.rotate(shape.angle);
      
      // Draw shape
      this.ctx.fillStyle = shape.color;
      this.ctx.strokeStyle = this.darkenColor(shape.color);
      this.ctx.lineWidth = 3;
      
      this.ctx.beginPath();
      for (let i = 0; i < shape.sides; i++) {
        const angle = (i / shape.sides) * Math.PI * 2;
        const x = Math.cos(angle) * shape.size;
        const y = Math.sin(angle) * shape.size;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.restore();
      
      // Draw health bar if damaged
      if (shape.health < shape.maxHealth) {
        const barWidth = shape.size * 2;
        const barHeight = 4;
        const barY = shape.y - shape.size - 10;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(shape.x - barWidth/2, barY, barWidth, barHeight);
        
        // Health fill
        const healthPercent = shape.health / shape.maxHealth;
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(shape.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
      }
    });
  }
  
  drawProjectiles() {
    this.ctx.fillStyle = '#FFD700';
    this.ctx.strokeStyle = '#FFA500';
    this.ctx.lineWidth = 2;
    
    this.state.projectiles.forEach(projectile => {
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    });
  }
  
  drawParticles() {
    this.state.particles.forEach(particle => {
      this.ctx.globalAlpha = particle.lifetime;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(
        particle.x - particle.size/2,
        particle.y - particle.size/2,
        particle.size,
        particle.size
      );
    });
    this.ctx.globalAlpha = 1;
  }
  
  drawMinimap() {
    const ctx = this.minimapCtx;
    const scale = 176 / Math.max(CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
    
    // Clear minimap
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, 176, 176);
    
    // Draw border
    ctx.strokeStyle = 'rgba(0, 178, 225, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 176, 176);
    
    // Draw shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.state.shapes.forEach(shape => {
      const x = shape.x * scale;
      const y = shape.y * scale;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    });
    
    // Draw player
    ctx.fillStyle = '#00B2E1';
    const playerX = this.state.player.x * scale;
    const playerY = this.state.player.y * scale;
    ctx.beginPath();
    ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw view area
    ctx.strokeStyle = 'rgba(0, 178, 225, 0.3)';
    ctx.lineWidth = 1;
    const viewX = this.state.camera.x * scale;
    const viewY = this.state.camera.y * scale;
    const viewW = this.canvas.width * scale;
    const viewH = this.canvas.height * scale;
    ctx.strokeRect(viewX, viewY, viewW, viewH);
  }
  
  darkenColor(color) {
    // Simple color darkening for borders
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const darkerR = Math.floor(r * 0.7);
    const darkerG = Math.floor(g * 0.7);
    const darkerB = Math.floor(b * 0.7);
    
    return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
  }
  
  // ==================== GAME LOOP ====================
  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    if (this.running) {
      this.update(deltaTime);
      this.render();
    }
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

// ==================== START GAME ====================
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  console.log('Arras.io game started!');
});
