import { Renderer } from './Renderer';
import { UIManager } from './UIManager';
import { InputHandler } from './InputHandler';
import { Camera } from './Camera';
import { MinimapRenderer } from './MinimapRenderer';

// Player data interface
export interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  xpToNext: number;
  score: number;
  velocity: { x: number; y: number };
}

// Projectile data interface
export interface Projectile {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  damage: number;
  ownerId: string;
  lifetime: number;
}

// Shape data interface
export interface Shape {
  id: string;
  type: 'triangle' | 'square' | 'pentagon' | 'hexagon';
  position: { x: number; y: number };
  size: number;
  health: number;
  maxHealth: number;
  rotation: number;
  color: string;
  xp: number;
}

export class GameClient {
  // Canvas and rendering
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private renderer!: Renderer;
  
  // UI and input systems
  private uiManager!: UIManager;
  private inputHandler!: InputHandler;
  private camera!: Camera;
  private minimapRenderer!: MinimapRenderer;
  
  // Game state
  private currentPlayer: Player;
  private projectiles: Map<string, Projectile> = new Map();
  private shapes: Map<string, Shape> = new Map();
  
  // World bounds - 10000x10000
  private worldBounds = { width: 10000, height: 10000 };
  
  // Performance tracking
  private lastUpdateTime = Date.now();
  private frameCount = 0;
  private fps = 0;
  
  // Shooting control
  private lastShotTime = 0;
  private fireRate = 250; // milliseconds between shots
  
  /**
   * Initialize the single-player game
   */
  initialize(): void {
    console.log('🚀 Initializing Single-Player Arras.io...');
    console.log('🗺️ World Size: 10000x10000');
    console.log('🎯 Auto-Shoot: Hold E key');
    
    this.setupCanvas();
    this.setupGameSystems();
    this.initializePlayer();
    this.initializeShapes();
    this.startGameLoop();
  }
  
  /**
   * Setup the game canvas
   */
  private setupCanvas(): void {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    if (!this.canvas) {
      console.error('Canvas element not found!');
      return;
    }
    
    // Get 2D context with performance optimizations
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    })!;
    
    // Set initial canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      if (this.camera) {
        this.camera.updateViewport(this.canvas.width, this.canvas.height);
      }
    });
  }
  
  /**
   * Initialize all game systems
   */
  private setupGameSystems(): void {
    this.renderer = new Renderer(this.ctx);
    
    this.uiManager = new UIManager();
    this.uiManager.initialize();
    
    this.inputHandler = new InputHandler(this.canvas);
    
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    
    this.minimapRenderer = new MinimapRenderer();
    this.minimapRenderer.initialize();
  }
  
  /**
   * Initialize the player
   */
  private initializePlayer(): void {
    this.currentPlayer = {
      id: 'player-' + Math.random().toString(36).substr(2, 9),
      name: 'Player',
      position: { x: 5000, y: 5000 }, // Center of map
      rotation: 0,
      health: 100,
      maxHealth: 100,
      level: 1,
      xp: 0,
      xpToNext: 100,
      score: 0,
      velocity: { x: 0, y: 0 }
    };
    
    // Set camera on player
    this.camera.setTarget(
      this.currentPlayer.position.x,
      this.currentPlayer.position.y
    );
  }
  
  /**
   * Initialize shapes throughout the world
   */
  private initializeShapes(): void {
    const shapeCount = 200; // More shapes for larger world
    
    for (let i = 0; i < shapeCount; i++) {
      this.spawnRandomShape();
    }
  }
  
  /**
   * Spawn a random shape
   */
  private spawnRandomShape(): void {
    const types: Array<'triangle' | 'square' | 'pentagon' | 'hexagon'> = 
      ['triangle', 'square', 'pentagon', 'hexagon'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Shape properties based on type
    const shapeProps = {
      triangle: { size: 25, health: 30, xp: 10, color: '#FF6B6B' },
      square: { size: 30, health: 50, xp: 20, color: '#FFE66D' },
      pentagon: { size: 35, health: 80, xp: 35, color: '#4ECDC4' },
      hexagon: { size: 40, health: 120, xp: 50, color: '#A8E6CF' }
    };
    
    const props = shapeProps[type];
    
    // Random position (avoid spawning too close to player initially)
    let x, y;
    do {
      x = Math.random() * this.worldBounds.width;
      y = Math.random() * this.worldBounds.height;
    } while (
      Math.abs(x - this.currentPlayer.position.x) < 300 &&
      Math.abs(y - this.currentPlayer.position.y) < 300
    );
    
    const shape: Shape = {
      id: `shape-${Date.now()}-${Math.random()}`,
      type: type,
      position: { x, y },
      size: props.size,
      health: props.health,
      maxHealth: props.health,
      rotation: Math.random() * Math.PI * 2,
      color: props.color,
      xp: props.xp
    };
    
    this.shapes.set(shape.id, shape);
  }
  
  /**
   * Main game loop
   */
  private startGameLoop(): void {
    let lastTime = performance.now();
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      this.update(deltaTime);
      this.render(deltaTime);
      this.updateFPS();
      
      requestAnimationFrame(gameLoop);
    };
    
    requestAnimationFrame(gameLoop);
  }
  
  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    // Get input
    const input = this.inputHandler.getInput();
    
    // Update player movement
    const speed = 300 * deltaTime; // pixels per second
    if (input.keys.w) this.currentPlayer.position.y -= speed;
    if (input.keys.s) this.currentPlayer.position.y += speed;
    if (input.keys.a) this.currentPlayer.position.x -= speed;
    if (input.keys.d) this.currentPlayer.position.x += speed;
    
    // Keep player in bounds
    this.currentPlayer.position.x = Math.max(25, Math.min(this.worldBounds.width - 25, this.currentPlayer.position.x));
    this.currentPlayer.position.y = Math.max(25, Math.min(this.worldBounds.height - 25, this.currentPlayer.position.y));
    
    // Update player rotation
    const worldMousePos = this.camera.screenToWorld(input.mousePos.x, input.mousePos.y);
    const dx = worldMousePos.x - this.currentPlayer.position.x;
    const dy = worldMousePos.y - this.currentPlayer.position.y;
    this.currentPlayer.rotation = Math.atan2(dy, dx);
    
    // Handle shooting
    const now = Date.now();
    if ((input.shooting || input.autoShooting) && now - this.lastShotTime > this.fireRate) {
      this.shoot();
      this.lastShotTime = now;
    }
    
    // Update projectiles
    this.projectiles.forEach((projectile, id) => {
      projectile.position.x += projectile.velocity.x;
      projectile.position.y += projectile.velocity.y;
      projectile.lifetime -= deltaTime;
      
      // Remove if expired or out of bounds
      if (projectile.lifetime <= 0 ||
          projectile.position.x < 0 || projectile.position.x > this.worldBounds.width ||
          projectile.position.y < 0 || projectile.position.y > this.worldBounds.height) {
        this.projectiles.delete(id);
      }
    });
    
    // Update shapes (simple rotation)
    this.shapes.forEach(shape => {
      shape.rotation += 0.01;
    });
    
    // Check collisions
    this.checkCollisions();
    
    // Update camera
    this.camera.update(
      this.currentPlayer.position.x,
      this.currentPlayer.position.y,
      0.1
    );
    
    // Update UI
    this.updateUI();
    
    // Update minimap
    const players = new Map();
    players.set(this.currentPlayer.id, this.currentPlayer);
    this.minimapRenderer.update(
      players,
      this.shapes,
      this.currentPlayer,
      this.worldBounds
    );
  }
  
  /**
   * Shoot a projectile
   */
  private shoot(): void {
    const projectile: Projectile = {
      id: `proj-${Date.now()}-${Math.random()}`,
      position: { 
        x: this.currentPlayer.position.x + Math.cos(this.currentPlayer.rotation) * 30,
        y: this.currentPlayer.position.y + Math.sin(this.currentPlayer.rotation) * 30
      },
      velocity: {
        x: Math.cos(this.currentPlayer.rotation) * 600, // pixels per second
        y: Math.sin(this.currentPlayer.rotation) * 600
      },
      damage: 20,
      ownerId: this.currentPlayer.id,
      lifetime: 2 // seconds
    };
    
    this.projectiles.set(projectile.id, projectile);
  }
  
  /**
   * Check collisions
   */
  private checkCollisions(): void {
    // Check projectile-shape collisions
    this.projectiles.forEach((projectile, projId) => {
      this.shapes.forEach((shape, shapeId) => {
        const dx = projectile.position.x - shape.position.x;
        const dy = projectile.position.y - shape.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < shape.size) {
          // Hit!
          shape.health -= projectile.damage;
          this.projectiles.delete(projId);
          
          if (shape.health <= 0) {
            // Shape destroyed
            this.currentPlayer.score += shape.xp * 10;
            this.currentPlayer.xp += shape.xp;
            
            // Check level up
            if (this.currentPlayer.xp >= this.currentPlayer.xpToNext) {
              this.currentPlayer.level++;
              this.currentPlayer.xp = 0;
              this.currentPlayer.xpToNext = this.currentPlayer.level * 100;
              this.currentPlayer.maxHealth += 10;
              this.currentPlayer.health = this.currentPlayer.maxHealth;
              this.uiManager.showNotification(`Level ${this.currentPlayer.level}!`, 2000);
            }
            
            this.shapes.delete(shapeId);
            
            // Spawn new shape to maintain count
            setTimeout(() => this.spawnRandomShape(), 1000);
          }
        }
      });
    });
    
    // Check player-shape collisions
    this.shapes.forEach(shape => {
      const dx = this.currentPlayer.position.x - shape.position.x;
      const dy = this.currentPlayer.position.y - shape.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < shape.size + 25) {
        // Damage player
        this.currentPlayer.health -= 0.5;
        
        // Push player away
        const pushX = (dx / distance) * 5;
        const pushY = (dy / distance) * 5;
        this.currentPlayer.position.x += pushX;
        this.currentPlayer.position.y += pushY;
        
        if (this.currentPlayer.health <= 0) {
          this.respawn();
        }
      }
    });
  }
  
  /**
   * Respawn player
   */
  private respawn(): void {
    this.currentPlayer.health = this.currentPlayer.maxHealth;
    this.currentPlayer.position.x = 5000;
    this.currentPlayer.position.y = 5000;
    this.currentPlayer.score = Math.floor(this.currentPlayer.score * 0.8); // Lose 20% score
    this.uiManager.showNotification('Respawned!', 2000);
  }
  
  /**
   * Update UI elements
   */
  private updateUI(): void {
    this.uiManager.updateStats({
      score: this.currentPlayer.score,
      level: this.currentPlayer.level,
      health: this.currentPlayer.health,
      maxHealth: this.currentPlayer.maxHealth,
      xp: this.currentPlayer.xp,
      xpToNext: this.currentPlayer.xpToNext
    });
  }
  
  /**
   * Calculate FPS
   */
  private updateFPS(): void {
    this.frameCount++;
    const now = Date.now();
    
    if (now - this.lastUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastUpdateTime = now;
      this.uiManager.updateFPS(this.fps);
    }
  }
  
  /**
   * Render the game
   */
  private render(deltaTime: number): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // Render world
    this.renderer.renderGrid(
      this.worldBounds.width,
      this.worldBounds.height,
      this.camera
    );
    
    this.renderer.renderWorldBoundaries(
      this.worldBounds.width,
      this.worldBounds.height
    );
    
    // Render shapes
    this.shapes.forEach(shape => {
      if (this.camera.isInView(shape.position.x, shape.position.y, shape.size)) {
        this.renderer.renderShape(shape);
      }
    });
    
    // Render projectiles
    this.projectiles.forEach(projectile => {
      if (this.camera.isInView(projectile.position.x, projectile.position.y, 10)) {
        this.renderer.renderProjectile(projectile);
      }
    });
    
    // Render player
    this.renderer.renderPlayer(this.currentPlayer, true);
    
    this.ctx.restore();
    
    // Render auto-shoot effect
    if (this.inputHandler.isAutoShooting()) {
      this.renderer.renderAutoShootEffect(this.canvas.width, this.canvas.height);
    }
  }
}