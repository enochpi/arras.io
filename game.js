/**
 * Arras.io Single-Player Game - Enhanced with Rare Shape System
 * Features Green Radiant, Blue Radiant, and Shadow shapes with visual effects
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
  MAX_SHAPES: 250,
  SHAPE_SPAWN_RATE: 5000, // milliseconds
};

// ==================== GAME STATE ====================
class GameState {
  constructor() {
    this.player = {
      id: 'player_' + Math.random().toString(36).substr(2, 9),
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
      xpToNext: 100,
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
    this.upgradeMenuOpen = false;
    
    // Systems
    this.shapeSystem = null;
    this.collisionSystem = null;
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
    this.particles = [];
    if (this.shapeSystem) {
      this.shapeSystem.clear();
      this.shapeSystem.initialize({ x: this.player.x, y: this.player.y });
    }
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
  constructor(x, y, vx, vy, color, size, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.lifetime = 1;
    
    // Enhanced properties for rare shapes
    this.glow = options.glow || false;
    this.trail = options.trail || false;
    this.sparkle = options.sparkle || false;
    this.shadowAura = options.shadowAura || false;
    this.spiralMotion = options.spiralMotion || false;
    this.pulseRate = options.pulseRate || 0;
    this.fadeRate = options.fadeRate || 0.02;
    this.ring = options.ring || false;
    this.rarity = options.rarity || 'normal';
    
    this.initialSize = size;
    this.trailPositions = [];
  }
  
  update(deltaTime) {
    // Store trail positions
    if (this.trail && this.trailPositions.length < 10) {
      this.trailPositions.push({ x: this.x, y: this.y, alpha: this.lifetime });
    }
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply special motion effects
    if (this.spiralMotion) {
      const angle = Math.atan2(this.vy, this.vx);
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const newAngle = angle + 0.1;
      this.vx = Math.cos(newAngle) * speed * 0.98;
      this.vy = Math.sin(newAngle) * speed * 0.98;
    } else {
      // Normal friction
      this.vx *= 0.98;
      this.vy *= 0.98;
    }
    
    // Update lifetime
    this.lifetime -= this.fadeRate;
    
    // Update size
    this.size *= 0.98;
    
    // Pulse effect
    if (this.pulseRate > 0) {
      this.size = this.initialSize * (1 + Math.sin(Date.now() * this.pulseRate) * 0.1) * this.lifetime;
    }
    
    return this.lifetime > 0 && this.size > 0.1;
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
    
    // Initialize systems
    this.initializeSystems();
    this.setupCanvas();
    this.setupEventListeners();
    this.initializeShapes();
    this.gameLoop(0);
  }
  
  initializeSystems() {
    // Initialize ShapeSystem if available
    if (typeof ShapeSystem !== 'undefined') {
      this.state.shapeSystem = new ShapeSystem(CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
      this.state.shapeSystem.setMaxShapes(CONFIG.MAX_SHAPES);
      console.log('✅ ShapeSystem initialized with rare shapes support');
    } else {
      console.warn('⚠️ ShapeSystem not found, using basic shapes');
    }
    
    // Initialize CollisionSystem if available
    if (typeof CollisionSystem !== 'undefined') {
      this.state.collisionSystem = new CollisionSystem();
      console.log('✅ CollisionSystem initialized with enhanced effects');
    } else {
      console.warn('⚠️ CollisionSystem not found, using basic collisions');
    }
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
      
      // Test spawning rare shapes (debug keys)
      if (e.code === 'KeyG' && this.state.shapeSystem) {
        this.state.shapeSystem.spawnRareShape('greenRadiant', this.state.player);
      }
      if (e.code === 'KeyB' && this.state.shapeSystem) {
        this.state.shapeSystem.spawnRareShape('blueRadiant', this.state.player);
      }
      if (e.code === 'KeyN' && this.state.shapeSystem) {
        this.state.shapeSystem.spawnRareShape('shadow', this.state.player);
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
  
  initializeShapes() {
    if (this.state.shapeSystem) {
      this.state.shapeSystem.initialize({ x: this.state.player.x, y: this.state.player.y });
    }
  }
  
  // ==================== UPDATE LOGIC ====================
  update(deltaTime) {
    // Update player movement
    this.updatePlayer(deltaTime);
    
    // Update projectiles
    this.state.projectiles = this.state.projectiles.filter(p => p.update(deltaTime));
    
    // Update shapes
    if (this.state.shapeSystem) {
      this.state.shapeSystem.update(deltaTime, { x: this.state.player.x, y: this.state.player.y });
      this.state.shapes = this.state.shapeSystem.getAllShapes();
    }
    
    // Update particles
    if (this.state.collisionSystem) {
      this.state.collisionSystem.updateParticles(this.state.particles, deltaTime);
    } else {
      this.state.particles = this.state.particles.filter(p => p.update(deltaTime));
    }
    
    // Check collisions
    this.checkCollisions();
    
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
    if (this.state.collisionSystem) {
      // Use the enhanced collision system
      const results = this.state.collisionSystem.handleAllCollisions(this.state);
      
      // Process collision results
      for (const result of results) {
        if (result.destroyed && result.shape) {
          // Create particles for destroyed shape
          this.state.collisionSystem.createCollisionParticles(result, this.state.particles);
          
          // Add XP with level check
          if (result.xpAwarded > 0) {
            this.addXP(result.xpAwarded);
            this.state.player.score += result.xpAwarded * 10;
          }
        } else if (!result.destroyed && result.shape) {
          // Create hit particles
          this.state.collisionSystem.createCollisionParticles(result, this.state.particles);
        }
        
        // Check game over
        if (this.state.player.health <= 0) {
          this.gameOver();
        }
      }
    } else {
      // Fallback to basic collision detection
      this.basicCollisionCheck();
    }
  }
  
  basicCollisionCheck() {
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
          shape.health -= projectile.damage;
          
          // Create hit particles
          for (let k = 0; k < 5; k++) {
            this.state.particles.push(new Particle(
              shape.x, shape.y,
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5,
              shape.particleColor || shape.color,
              Math.random() * 5 + 2
            ));
          }
          
          if (shape.health <= 0) {
            // Shape destroyed
            this.addXP(shape.xp);
            player.score += shape.xp * 10;
            
            // Create destruction particles
            for (let k = 0; k < 10; k++) {
              this.state.particles.push(new Particle(
                shape.x, shape.y,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                shape.particleColor || shape.color,
                Math.random() * 8 + 3
              ));
            }
            
            this.state.shapes.splice(j, 1);
          }
          
          // Remove projectile
          this.state.projectiles.splice(i, 1);
          break;
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
      player.xpToNext = 100 * player.level;
      player.upgradePoints += 1;
      
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
      if (this.state.shapeSystem) {
        // Get visual properties from shape system
        const visualProps = this.state.shapeSystem.getShapeVisualProperties(shape);
        this.drawShapeWithEffects(shape, visualProps);
      } else {
        // Basic shape drawing
        this.drawBasicShape(shape);
      }
    });
  }
  
  drawShapeWithEffects(shape, visualProps) {
    this.ctx.save();
    this.ctx.translate(shape.x, shape.y);
    
    // Apply pulse scaling for rare shapes
    if (visualProps.pulseAmount !== 0) {
      this.ctx.scale(visualProps.pulseAmount, visualProps.pulseAmount);
    }
    
    this.ctx.rotate(shape.angle);
    
    // Draw shadow aura for Shadow shapes
    if (shape.hasShadowAura) {
      this.ctx.shadowColor = shape.glowColor;
      this.ctx.shadowBlur = visualProps.shadowBlur;
      
      // Draw dark outer aura
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size * 1.5);
      gradient.addColorStop(0, 'rgba(139, 0, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(139, 0, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(139, 0, 255, 0.5)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, shape.size * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Draw radiant glow for Green/Blue Radiant shapes
    if (shape.hasRadiance) {
      this.ctx.shadowColor = shape.glowColor;
      this.ctx.shadowBlur = visualProps.shadowBlur;
      
      // Draw bright glow
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size * 1.3);
      const glowColor = shape.glowColor;
      gradient.addColorStop(0, this.hexToRgba(glowColor, 0.3));
      gradient.addColorStop(0.7, this.hexToRgba(glowColor, 0.1));
      gradient.addColorStop(1, this.hexToRgba(glowColor, 0));
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, shape.size * 1.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Draw the main shape body
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = visualProps.baseColor;
    this.ctx.strokeStyle = this.darkenColor(visualProps.baseColor);
    this.ctx.lineWidth = visualProps.strokeWidth;
    
    this.ctx.beginPath();
    if (shape.sides === 4) {
      // Square
      this.ctx.rect(-shape.size, -shape.size, shape.size * 2, shape.size * 2);
    } else {
      // Other polygons
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
    }
    
    this.ctx.fill();
    this.ctx.stroke();
    
    // Add inner glow for rare shapes
    if (shape.rarity !== 'normal') {
      const innerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size);
      innerGradient.addColorStop(0, this.hexToRgba(shape.glowColor, 0.3));
      innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = innerGradient;
      this.ctx.fill();
    }
    
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
    
    // Draw rarity indicator
    if (shape.rarity !== 'normal') {
      this.ctx.save();
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = shape.glowColor;
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 2;
      
      let rarityText = '';
      if (shape.rarity === 'greenRadiant') rarityText = '★';
      else if (shape.rarity === 'blueRadiant') rarityText = '★★';
      else if (shape.rarity === 'shadow') rarityText = '☠';
      
      this.ctx.strokeText(rarityText, shape.x, shape.y - shape.size - 20);
      this.ctx.fillText(rarityText, shape.x, shape.y - shape.size - 20);
      this.ctx.restore();
    }
  }
  
  drawBasicShape(shape) {
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
      this.ctx.save();
      
      // Draw trail if enabled
      if (particle.trail && particle.trailPositions.length > 0) {
        this.ctx.strokeStyle = this.hexToRgba(particle.color, 0.3);
        this.ctx.lineWidth = particle.size * 0.5;
        this.ctx.beginPath();
        particle.trailPositions.forEach((pos, i) => {
          if (i === 0) {
            this.ctx.moveTo(pos.x, pos.y);
          } else {
            this.ctx.lineTo(pos.x, pos.y);
          }
        });
        this.ctx.stroke();
      }
      
      // Set particle style
      this.ctx.globalAlpha = particle.lifetime;
      
      // Apply glow effect for rare particles
      if (particle.glow) {
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = particle.size * 2;
      }
      
      // Draw particle
      if (particle.ring) {
        // Ring particle
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (particle.sparkle) {
        // Sparkle effect
        this.ctx.fillStyle = particle.color;
        const sparkleSize = particle.size * (1 + Math.random() * 0.5);
        this.ctx.fillRect(
          particle.x - sparkleSize/2,
          particle.y - sparkleSize/2,
          sparkleSize,
          sparkleSize
        );
      } else {
        // Normal particle
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });
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
    this.state.shapes.forEach(shape => {
      const x = shape.x * scale;
      const y = shape.y * scale;
      
      // Color based on rarity
      if (shape.rarity === 'greenRadiant') {
        ctx.fillStyle = '#00FF00';
      } else if (shape.rarity === 'blueRadiant') {
        ctx.fillStyle = '#00BFFF';
      } else if (shape.rarity === 'shadow') {
        ctx.fillStyle = '#8B00FF';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      }
      
      const size = shape.rarity !== 'normal' ? 2 : 1;
      ctx.fillRect(x - size/2, y - size/2, size, size);
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
  
  // ==================== HELPER FUNCTIONS ====================
  darkenColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const darkerR = Math.floor(r * 0.7);
    const darkerG = Math.floor(g * 0.7);
    const darkerB = Math.floor(b * 0.7);
    
    return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
  }
  
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  console.log('🎮 Arras.io Enhanced Edition started!');
  console.log('🌟 Rare shapes enabled: Green Radiant (1/100), Blue Radiant (1/500), Shadow (1/1000)');
  console.log('🔧 Debug: Press G for Green Radiant, B for Blue Radiant, N for Shadow shape');
});