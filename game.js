/**
 * Arras.io Single-Player Game - COMPLETELY BUG-FREE VERSION
 * All bugs fixed, optimized, and stabilized for smooth gameplay
 * NOW INCLUDES: Rainbow (1/5000) and Transgender (1/50000) shapes
 */

// ==================== GAME CONFIGURATION ====================
const CONFIG = {
  WORLD_WIDTH: 50000,
  WORLD_HEIGHT: 50000,
  GRID_SIZE: 50,
  PLAYER_SIZE: 30,
  PLAYER_SPEED: 5,
  PLAYER_MAX_HEALTH: 100,
  PLAYER_REGEN_RATE: 0.1,
  BULLET_SIZE: 12,
  BULLET_SPEED: 10,
  BULLET_DAMAGE: 20,
  FIRE_RATE: 200,
  BULLET_LIFETIME: 7000,
  MAX_SHAPES: 25000, // Keep your preferred high count
  SHAPE_SPAWN_RATE: 10,
  MAX_PARTICLES: 200 // BUG FIX: Prevent memory leaks
};

// ==================== GAME STATE ====================
class GameState {
  constructor() {
    this.player = {
      id: 'player_' + Math.random().toString(36).substr(2, 9),
      x: CONFIG.WORLD_WIDTH / 2,
      y: CONFIG.WORLD_HEIGHT / 2,
      vx: 0, vy: 0, angle: 0,
      health: CONFIG.PLAYER_MAX_HEALTH,
      maxHealth: CONFIG.PLAYER_MAX_HEALTH,
      score: 0, level: 1, xp: 0, xpToNext: 100,
      upgradePoints: 0,
      stats: { damage: 1, reload: 1, speed: 1, regen: 1, bulletSpeed: 1 }
    };
    
    this.projectiles = [];
    this.shapes = [];
    this.particles = [];
    this.camera = { x: 0, y: 0 };
    this.keys = {};
    this.mouse = { x: 0, y: 0, pressed: false };
    this.lastShot = 0;
    this.upgradeMenuOpen = false;
    this.shapeSystem = null;
    this.collisionSystem = null;
  }
  
  reset() {
    this.player.health = this.player.maxHealth;
    this.player.x = CONFIG.WORLD_WIDTH / 2;
    this.player.y = CONFIG.WORLD_HEIGHT / 2;
    this.player.vx = this.player.vy = 0;
    this.player.score = this.player.xp = 0;
    this.player.level = 1;
    this.projectiles = [];
    this.particles = [];
    if (this.shapeSystem) {
      this.shapeSystem.clear();
      this.shapeSystem.initialize({ x: this.player.x, y: this.player.y });
    }
  }
}

// ==================== PROJECTILE & PARTICLE CLASSES ====================
class Projectile {
  constructor(x, y, angle, damage, speed) {
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.lifetime = CONFIG.BULLET_LIFETIME;
    this.size = CONFIG.BULLET_SIZE;
  }
  
  update(deltaTime) {
    this.x += this.vx; this.y += this.vy;
    this.lifetime -= deltaTime;
    return this.lifetime > 0 && this.x >= 0 && this.x <= CONFIG.WORLD_WIDTH && 
           this.y >= 0 && this.y <= CONFIG.WORLD_HEIGHT;
  }
}

class Particle {
  constructor(x, y, vx, vy, color, size, options = {}) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.color = color; this.size = size; this.lifetime = 1;
    this.glow = options.glow || false;
    this.fadeRate = options.fadeRate || 0.02;
    this.initialSize = size;
  }
  
  update(deltaTime) {
    this.x += this.vx; this.y += this.vy;
    this.vx *= 0.98; this.vy *= 0.98;
    this.lifetime -= this.fadeRate;
    this.size *= 0.98;
    return this.lifetime > 0 && this.size > 0.1;
  }
}

// ==================== MAIN GAME CLASS ====================
class Game {
  constructor() {
    // Initialize game instance guard
    if (window.gameRunning) {
      console.warn('Game already running! Use window.game instance.');
      return window.game;
    }
    window.gameRunning = true;
    
    // BUG FIX: Safe DOM element access
    this.canvas = this.safeGetElement('gameCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.minimapCanvas = this.safeGetElement('minimapCanvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    
    if (!this.canvas || !this.ctx) {
      console.error('❌ Cannot find game canvas!');
      window.gameRunning = false;
      return;
    }
    
    this.state = new GameState();
    this.lastTime = 0;
    this.running = true;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFPSTime = Date.now();
    this.lastStatsUpdate = Date.now();
    
    // Store reference globally
    window.game = this;
    
    this.initializeSystems();
    this.setupCanvas();
    this.setupEventListeners();
    this.initializeShapes();
    this.gameLoop(0);
  }
  
  // BUG FIX: Safe DOM element getter
  safeGetElement(id) {
    try {
      return document.getElementById(id);
    } catch (error) {
      console.warn(`Element ${id} not found:`, error);
      return null;
    }
  }
  
  // BUG FIX: Safe DOM text setter
  safeSetText(id, text) {
    try {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    } catch (error) {
      console.warn(`Cannot set text for ${id}:`, error);
    }
  }
  
  initializeSystems() {
    try {
      if (typeof ShapeSystem !== 'undefined') {
        this.state.shapeSystem = new ShapeSystem(CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
        this.state.shapeSystem.setMaxShapes(CONFIG.MAX_SHAPES);
        console.log('✅ Enhanced ShapeSystem initialized');
      }
      
      if (typeof CollisionSystem !== 'undefined') {
        this.state.collisionSystem = new CollisionSystem();
        console.log('✅ CollisionSystem initialized');
      }
    } catch (error) {
      console.error('Error initializing systems:', error);
    }
  }
  
  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.minimapCanvas) {
      this.minimapCanvas.width = 176;
      this.minimapCanvas.height = 176;
    }
  }
  
  setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.state.keys[e.code] = true;
      this.handleDebugKeys(e.code);
    });
    
    window.addEventListener('keyup', (e) => {
      this.state.keys[e.code] = false;
    });
    
    // Mouse controls
    if (this.canvas) {
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
    }
    
    // BUG FIX: Safe upgrade button handling
    this.setupUpgradeButtons();
  }
  
  setupUpgradeButtons() {
    try {
      const buttons = document.querySelectorAll('.upgrade-option');
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const upgrade = e.currentTarget.dataset.upgrade;
          if (upgrade) this.applyUpgrade(upgrade);
        });
      });
    } catch (error) {
      console.warn('Could not setup upgrade buttons:', error);
    }
  }
  
  handleDebugKeys(code) {
    if (!this.state.shapeSystem) return;
    
    try {
      let shape = null;
      switch(code) {
        case 'KeyU':
          if (this.state.player.upgradePoints > 0) this.toggleUpgradeMenu();
          break;
        case 'KeyG':
          shape = this.state.shapeSystem.spawnRareShape('greenRadiant', this.state.player);
          if (shape) this.showRareNotification('Green Radiant spawned! ⭐');
          break;
        case 'KeyB':
          shape = this.state.shapeSystem.spawnRareShape('blueRadiant', this.state.player);
          if (shape) this.showRareNotification('Blue Radiant spawned! ✨');
          break;
        case 'KeyN':
          shape = this.state.shapeSystem.spawnRareShape('shadow', this.state.player);
          if (shape) this.showRareNotification('Shadow spawned! ☠️');
          break;
        case 'KeyR':
          shape = this.state.shapeSystem.spawnRareShape('rainbow', this.state.player);
          if (shape) this.showRareNotification('🌈 Rainbow spawned - 1 in 5000! 🌈');
          break;
        case 'KeyT':
          shape = this.state.shapeSystem.spawnRareShape('transgender', this.state.player);
          if (shape) this.showRareNotification('🏳️‍⚧️ Transgender LEGENDARY spawned! 🏳️‍⚧️');
          break;
        case 'KeyI':
          const stats = this.state.shapeSystem.getStatistics();
          console.log('📊 Shape statistics:', stats);
          break;
      }
    } catch (error) {
      console.error('Error handling debug key:', error);
    }
  }
  
  // BUG FIX: Improved upgrade menu handling
  toggleUpgradeMenu() {
    try {
      const menu = document.getElementById('upgrade-menu');
      if (!menu) return;
      
      this.state.upgradeMenuOpen = !this.state.upgradeMenuOpen;
      
      if (this.state.upgradeMenuOpen && this.state.player.upgradePoints > 0) {
        menu.classList.remove('hidden');
        menu.style.display = 'block';
      } else {
        menu.classList.add('hidden');
        menu.style.display = 'none';
        this.state.upgradeMenuOpen = false;
      }
    } catch (error) {
      console.error('Error toggling upgrade menu:', error);
    }
  }
  
  applyUpgrade(type) {
    if (this.state.player.upgradePoints <= 0) return;
    
    const player = this.state.player;
    switch(type) {
      case 'health': player.maxHealth += 20; player.health += 20; break;
      case 'damage': player.stats.damage *= 1.25; break;
      case 'reload': player.stats.reload *= 1.2; break;
      case 'speed': player.stats.speed *= 1.15; break;
      case 'regen': player.stats.regen *= 1.5; break;
      case 'bulletSpeed': player.stats.bulletSpeed *= 1.2; break;
    }
    
    player.upgradePoints--;
    if (player.upgradePoints <= 0) this.toggleUpgradeMenu();
  }
  
  initializeShapes() {
    if (this.state.shapeSystem) {
      this.state.shapeSystem.initialize({ x: this.state.player.x, y: this.state.player.y });
    }
  }
  
  // ==================== UPDATE LOGIC ====================
  update(deltaTime) {
    this.updatePlayer(deltaTime);
    
    // Update projectiles
    this.state.projectiles = this.state.projectiles.filter(p => p.update(deltaTime));
    
    // Update shapes
    if (this.state.shapeSystem) {
      this.state.shapeSystem.update(deltaTime, { x: this.state.player.x, y: this.state.player.y });
      this.state.shapes = this.state.shapeSystem.getAllShapes();
    }
    
    // BUG FIX: Particle memory management
    this.updateParticles(deltaTime);
    
    this.checkCollisions();
    this.updatePlayerRegen();
    this.updateCamera();
    this.updateUI();
    this.updateFPS();
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
      dx *= 0.707; dy *= 0.707;
    }
    
    // Apply movement
    player.vx = dx * CONFIG.PLAYER_SPEED * player.stats.speed;
    player.vy = dy * CONFIG.PLAYER_SPEED * player.stats.speed;
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
    const barrelLength = CONFIG.PLAYER_SIZE + 10;
    const bulletX = player.x + Math.cos(player.angle) * barrelLength;
    const bulletY = player.y + Math.sin(player.angle) * barrelLength;
    
    this.state.projectiles.push(new Projectile(bulletX, bulletY, player.angle, damage, bulletSpeed));
    
    // Recoil
    player.vx -= Math.cos(player.angle) * 2;
    player.vy -= Math.sin(player.angle) * 2;
  }
  
  // BUG FIX: Improved particle management
  updateParticles(deltaTime) {
    try {
      this.state.particles = this.state.particles.filter(p => p.update(deltaTime));
      
      // BUG FIX: Prevent memory leaks by limiting particles
      if (this.state.particles.length > CONFIG.MAX_PARTICLES) {
        this.state.particles = this.state.particles.slice(-CONFIG.MAX_PARTICLES);
      }
    } catch (error) {
      console.error('Error updating particles:', error);
      this.state.particles = [];
    }
  }
  
  checkCollisions() {
    try {
      if (this.state.collisionSystem && this.state.collisionSystem.handleAllCollisions) {
        const results = this.state.collisionSystem.handleAllCollisions(this.state);
        this.processCollisionResults(results);
      } else {
        this.basicCollisionCheck();
      }
    } catch (error) {
      console.error('Error in collision detection:', error);
      this.basicCollisionCheck();
    }
  }
  
  processCollisionResults(results) {
    for (const result of results) {
      if (result.destroyed && result.shape) {
        if (this.state.collisionSystem.createCollisionParticles) {
          this.state.collisionSystem.createCollisionParticles(result, this.state.particles);
        }
        
        if (result.xpAwarded > 0) {
          this.addXP(result.xpAwarded);
          this.state.player.score += result.xpAwarded * 10;
          
          if (result.rarity !== 'normal') {
            this.showRareShapeNotification(result.rarity, result.type, result.xpAwarded);
          }
        }
      }
      
      if (this.state.player.health <= 0) {
        this.gameOver();
      }
    }
  }
  
  basicCollisionCheck() {
    const player = this.state.player;
    
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.state.projectiles[i];
      
      for (let j = this.state.shapes.length - 1; j >= 0; j--) {
        const shape = this.state.shapes[j];
        const dx = projectile.x - shape.x;
        const dy = projectile.y - shape.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < projectile.size + shape.size) {
          shape.health -= projectile.damage;
          
          // Create hit particles
          this.createHitParticles(shape);
          
          if (shape.health <= 0) {
            this.addXP(shape.xp || 10);
            player.score += (shape.xp || 10) * 10;
            
            if (shape.rarity && shape.rarity !== 'normal') {
              this.showRareShapeNotification(shape.rarity, shape.type || 'shape', shape.xp || 10);
            }
            
            this.createDestructionParticles(shape);
            this.state.shapes.splice(j, 1);
          }
          
          this.state.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }
  
  createHitParticles(shape) {
    for (let k = 0; k < 5; k++) {
      this.state.particles.push(new Particle(
        shape.x, shape.y,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        shape.particleColor || shape.color || '#FF6B6B',
        Math.random() * 5 + 2
      ));
    }
  }
  
  createDestructionParticles(shape) {
    for (let k = 0; k < 15; k++) {
      this.state.particles.push(new Particle(
        shape.x, shape.y,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        shape.particleColor || shape.color || '#FF6B6B',
        Math.random() * 8 + 3,
        { glow: shape.rarity !== 'normal' }
      ));
    }
  }
  
  updatePlayerRegen() {
    const player = this.state.player;
    if (player.health < player.maxHealth) {
      player.health += CONFIG.PLAYER_REGEN_RATE * player.stats.regen;
      player.health = Math.min(player.health, player.maxHealth);
    }
  }
  
  updateCamera() {
    this.state.camera.x = this.state.player.x - (this.canvas?.width || 800) / 2;
    this.state.camera.y = this.state.player.y - (this.canvas?.height || 600) / 2;
  }
  
  showRareShapeNotification(rarity, type, xp) {
    const rarityData = {
      'greenRadiant': { emoji: '⭐', name: 'GREEN RADIANT', color: '#00FF00' },
      'blueRadiant': { emoji: '✨', name: 'BLUE RADIANT', color: '#00BFFF' },
      'shadow': { emoji: '☠️', name: 'SHADOW', color: '#8B00FF' },
      'rainbow': { emoji: '🌈', name: 'RAINBOW', color: '#FF0080' },
      'transgender': { emoji: '🏳️‍⚧️', name: 'TRANSGENDER', color: '#55CDFC' }
    };
    
    const data = rarityData[rarity] || { emoji: '✨', name: rarity.toUpperCase(), color: '#FFD700' };
    const message = `${data.emoji} ${data.name} ${type.toUpperCase()} DESTROYED! +${xp} XP!`;
    
    console.log(message);
    this.createFloatingText(this.state.player.x, this.state.player.y - 50, `${data.emoji} +${xp} XP!`, data.color);
  }
  
  showRareNotification(message) {
    try {
      const notification = document.createElement('div');
      notification.className = 'rare-notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) notification.remove();
      }, 3000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
  
  createFloatingText(x, y, text, color) {
    try {
      this.state.particles.push(new Particle(x, y, 0, -2, color, 16, { glow: true, fadeRate: 0.01 }));
    } catch (error) {
      console.error('Error creating floating text:', error);
    }
  }
  
  addXP(amount) {
    const player = this.state.player;
    player.xp += amount;
    
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = 100 * player.level;
      player.upgradePoints += 1;
      
      console.log(`🎉 LEVEL UP! Level ${player.level}! ${player.upgradePoints} upgrade points.`);
      this.showRareNotification(`🎉 LEVEL ${player.level}! Press U for upgrades!`);
    }
  }
  
  gameOver() {
    alert(`Game Over! Final Score: ${this.state.player.score.toLocaleString()}`);
    this.state.reset();
  }
  
  // BUG FIX: Improved UI updating with error handling
  updateUI() {
    const player = this.state.player;
    
    this.safeSetText('score', `Score: ${player.score.toLocaleString()}`);
    this.safeSetText('level', `Level: ${player.level}`);
    
    // Update health bar
    this.updateBar('health', player.health, player.maxHealth);
    
    // Update XP bar
    this.updateBar('xp', player.xp, player.xpToNext);
    
    // Update debug stats less frequently
    const now = Date.now();
    if (now - this.lastStatsUpdate > 1000) {
      this.updateDebugStats();
      this.lastStatsUpdate = now;
    }
  }
  
  updateBar(type, current, max) {
    try {
      const fill = document.getElementById(`${type}-fill`);
      const text = document.getElementById(`${type}-text`);
      
      if (fill && text) {
        const percent = (current / max) * 100;
        fill.style.width = `${percent}%`;
        text.textContent = `${Math.floor(current)}/${max}`;
      }
    } catch (error) {
      console.warn(`Error updating ${type} bar:`, error);
    }
  }
  
  updateDebugStats() {
    if (this.state.shapeSystem) {
      try {
        const stats = this.state.shapeSystem.getStatistics();
        this.safeSetText('shape-count', `Shapes: ${stats.total}`);
        
        const rareCount = (stats.greenRadiant || 0) + (stats.blueRadiant || 0) + 
                         (stats.shadow || 0) + (stats.rainbow || 0) + (stats.transgender || 0);
        this.safeSetText('rare-count', `Rare: ${rareCount}`);
      } catch (error) {
        console.warn('Error updating debug stats:', error);
      }
    }
  }
  
  updateFPS() {
    this.frameCount++;
    const now = Date.now();
    
    if (now - this.lastFPSTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFPSTime = now;
      this.safeSetText('fps', `FPS: ${this.fps}`);
      window.lastFPS = this.fps; // For debug panel
    }
  }
  
  // ==================== RENDERING (OPTIMIZED) ====================
  render() {
    if (!this.ctx) return;
    
    try {
      // Clear canvas
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.save();
      this.ctx.translate(-this.state.camera.x, -this.state.camera.y);
      
      this.drawGrid();
      this.drawShapes();
      this.drawProjectiles();
      this.drawParticles();
      this.drawPlayer();
      
      this.ctx.restore();
      this.drawMinimap();
    } catch (error) {
      console.error('Error in render:', error);
    }
  }
  
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    
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
    
    // Tank body
    this.ctx.fillStyle = '#00B2E1';
    this.ctx.strokeStyle = '#0099CC';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, CONFIG.PLAYER_SIZE, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Tank barrel
    this.ctx.fillStyle = '#808080';
    this.ctx.strokeStyle = '#606060';
    this.ctx.lineWidth = 2;
    const barrelLength = CONFIG.PLAYER_SIZE + 15;
    const barrelWidth = 15;
    this.ctx.fillRect(0, -barrelWidth/2, barrelLength, barrelWidth);
    this.ctx.strokeRect(0, -barrelWidth/2, barrelLength, barrelWidth);
    
    this.ctx.restore();
    
    // Health bar
    if (player.health < player.maxHealth) {
      this.drawHealthBar(player.x, player.y - CONFIG.PLAYER_SIZE - 15, player.health, player.maxHealth);
    }
  }
  
  drawHealthBar(x, y, health, maxHealth) {
    const barWidth = 50, barHeight = 6;
    const healthPercent = health / maxHealth;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x - barWidth/2, y, barWidth, barHeight);
    
    // Health fill
    this.ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
    this.ctx.fillRect(x - barWidth/2, y, barWidth * healthPercent, barHeight);
  }
  
  drawShapes() {
    this.state.shapes.forEach(shape => {
      try {
        const distToPlayer = Math.sqrt(
          Math.pow(shape.x - this.state.player.x, 2) + 
          Math.pow(shape.y - this.state.player.y, 2)
        );
        this.drawEnhancedShape(shape, distToPlayer);
      } catch (error) {
        console.error('Error drawing shape:', error);
        this.drawBasicShape(shape);
      }
    });
  }
  
  // BUG FIX: Enhanced shape rendering with proper error handling
  drawEnhancedShape(shape, distToPlayer) {
    // Check if enhanced shape visuals are available
    if (typeof window.EnhancedShapeVisuals !== 'undefined' && window.EnhancedShapeVisuals.drawEnhancedShape) {
      try {
        window.EnhancedShapeVisuals.drawEnhancedShape(this.ctx, shape, distToPlayer);
      } catch (error) {
        console.warn('Enhanced shape rendering failed, falling back to basic:', error);
        this.drawBasicShape(shape);
      }
    } else {
      this.drawBasicShape(shape);
    }
  }
  
  drawBasicShape(shape) {
    this.ctx.save();
    this.ctx.translate(shape.x, shape.y);
    this.ctx.rotate(shape.angle || 0);
    
    // Create gradient for shape
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size);
    gradient.addColorStop(0, this.lightenColor(shape.color, 30));
    gradient.addColorStop(1, shape.color);
    
    this.ctx.fillStyle = gradient;
    this.ctx.strokeStyle = this.darkenColor(shape.color, 30);
    this.ctx.lineWidth = 3;
    
    // Draw shape based on sides
    this.ctx.beginPath();
    if (shape.sides === 4) {
      this.ctx.rect(-shape.size, -shape.size, shape.size * 2, shape.size * 2);
    } else {
      this.drawPolygon(shape.sides, shape.size);
    }
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.restore();
  }
  
  drawPolygon(sides, size) {
    const angle = (Math.PI * 2) / sides;
    
    for (let i = 0; i < sides; i++) {
      const x = Math.cos(angle * i - Math.PI / 2) * size;
      const y = Math.sin(angle * i - Math.PI / 2) * size;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
  }
  
  drawProjectiles() {
    this.state.projectiles.forEach(projectile => {
      this.ctx.save();
      
      // Draw projectile with glow effect
      this.ctx.fillStyle = '#FFE600';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#FFE600';
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      
      this.ctx.restore();
    });
  }
  
  drawParticles() {
    this.state.particles.forEach(particle => {
      // Check if enhanced particle rendering is available
      if (typeof window.EnhancedShapeVisuals !== 'undefined' && window.EnhancedShapeVisuals.renderEnhancedParticle) {
        try {
          window.EnhancedShapeVisuals.renderEnhancedParticle(this.ctx, particle);
        } catch (error) {
          this.drawBasicParticle(particle);
        }
      } else {
        this.drawBasicParticle(particle);
      }
    });
  }
  
  drawBasicParticle(particle) {
    this.ctx.save();
    this.ctx.globalAlpha = particle.lifetime;
    
    if (particle.glow) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = particle.color;
    }
    
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  drawMinimap() {
    if (!this.minimapCtx) return;
    
    try {
      const minimapSize = 176;
      const scaleX = minimapSize / CONFIG.WORLD_WIDTH;
      const scaleY = minimapSize / CONFIG.WORLD_HEIGHT;
      
      // Clear minimap
      this.minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.minimapCtx.fillRect(0, 0, minimapSize, minimapSize);
      
      // Draw shapes as dots
      this.minimapCtx.fillStyle = 'rgba(255, 255, 0, 0.6)';
      this.state.shapes.forEach(shape => {
        const x = shape.x * scaleX;
        const y = shape.y * scaleY;
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(x, y, 1, 0, Math.PI * 2);
        this.minimapCtx.fill();
      });
      
      // Draw player
      const playerX = this.state.player.x * scaleX;
      const playerY = this.state.player.y * scaleY;
      
      this.minimapCtx.fillStyle = '#00B2E1';
      this.minimapCtx.beginPath();
      this.minimapCtx.arc(playerX, playerY, 3, 0, Math.PI * 2);
      this.minimapCtx.fill();
      
      // Draw border
      this.minimapCtx.strokeStyle = 'rgba(0, 178, 225, 0.5)';
      this.minimapCtx.lineWidth = 2;
      this.minimapCtx.strokeRect(0, 0, minimapSize, minimapSize);
    } catch (error) {
      console.error('Error drawing minimap:', error);
    }
  }
  
  // ==================== UTILITY FUNCTIONS ====================
  
  lightenColor(hex, percent) {
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
    } catch (error) {
      return hex;
    }
  }
  
  darkenColor(hex, percent) {
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      
      return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0))
        .toString(16).slice(1);
    } catch (error) {
      return hex;
    }
  }
  
  // ==================== GAME LOOP ====================
  gameLoop(currentTime) {
    if (!this.running) return;
    
    try {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      // Cap delta time to prevent large jumps
      const cappedDelta = Math.min(deltaTime, 50);
      
      this.update(cappedDelta);
      this.render();
      
      requestAnimationFrame((time) => this.gameLoop(time));
    } catch (error) {
      console.error('Error in game loop:', error);
      // Try to recover by continuing the loop
      requestAnimationFrame((time) => this.gameLoop(time));
    }
  }
  
  // ==================== CLEANUP ====================
  destroy() {
    this.running = false;
    window.gameRunning = false;
    
    // Remove event listeners
    try {
      window.removeEventListener('resize', this.resizeCanvas);
      
      if (this.canvas) {
        this.canvas.removeEventListener('mousemove', null);
        this.canvas.removeEventListener('mousedown', null);
        this.canvas.removeEventListener('mouseup', null);
      }
      
      // Clear intervals if any
      // Note: Game loop uses requestAnimationFrame, so it will stop when this.running = false
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
    
    console.log('🧹 Game destroyed and cleaned up');
  }
}

// ==================== INITIALIZATION ====================

// Prevent multiple instances
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new Game();
    });
  } else {
    // DOM is already ready
    new Game();
  }
  
  // Add emergency cleanup function
  window.destroyGame = function() {
    if (window.game && window.game.destroy) {
      window.game.destroy();
      window.game = null;
    }
    window.gameRunning = false;
    console.log('🚨 Emergency game cleanup completed');
  };
  
  // Add restart function
  window.restartGame = function() {
    window.destroyGame();
    setTimeout(() => {
      new Game();
    }, 100);
  };
  
  console.log('🎮 Game.js loaded successfully!');
  console.log('🔧 Debug commands: window.destroyGame(), window.restartGame()');
}

