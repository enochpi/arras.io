/**
 * Enhanced Game Client
 * 
 * ⭐ NEW FEATURES:
 * - EXPANDED WORLD: Now 6000x6000 (previously 3000x3000) - 4X larger play area!
 * - AUTO-SHOOT: Hold 'E' key for automatic firing mode
 * - Optimized rendering with viewport culling for smooth performance
 * - Enhanced visual effects and modern UI
 */

import { io, Socket } from 'socket.io-client';
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
}

// Shape data interface - FIXED: Updated to match Renderer's type definition
export interface Shape {
  id: string;
  type: 'triangle' | 'square' | 'pentagon' | 'hexagon';  // ✅ FIXED: Made type specific
  position: { x: number; y: number };
  size: number;
  health: number;
  maxHealth: number;
  rotation: number;
  color: string;
}

export class GameClient {
  // Network
  private socket!: Socket;
  
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
  private currentPlayer: Player | null = null;
  private players: Map<string, Player> = new Map();
  private projectiles: Map<string, Projectile> = new Map();
  private shapes: Map<string, Shape> = new Map();
  
  // ⭐ EXPANDED WORLD BOUNDS - Now 6000x6000!
  private worldBounds = { width: 6000, height: 6000 };
  
  // Performance tracking
  private lastUpdateTime = Date.now();
  private frameCount = 0;
  private fps = 0;
  
  /**
   * Initialize the game client and all subsystems
   */
  initialize(): void {
    console.log('🚀 Initializing Enhanced Arras.io Client...');
    console.log('⭐ NEW: Expanded World Size: 6000x6000');
    console.log('⭐ NEW: Auto-Shoot Feature: Hold E key');
    
    this.setupCanvas();
    this.setupSocketConnection();
    this.setupGameSystems();
    this.startGameLoop();
  }
  
  /**
   * Setup the game canvas with optimized settings
   */
  private setupCanvas(): void {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    // Get 2D context with performance optimizations
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,           // No transparency for better performance
      desynchronized: true    // Reduce input lag
    })!;
    
    // Set initial canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Handle window resize events
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Update camera viewport
      if (this.camera) {
        this.camera.updateViewport(this.canvas.width, this.canvas.height);
      }
    });
  }
  
  /**
   * Initialize all game systems (renderer, UI, input, etc.)
   */
  private setupGameSystems(): void {
    // Create renderer for drawing game objects
    this.renderer = new Renderer(this.ctx);
    
    // Initialize UI manager for HUD elements
    this.uiManager = new UIManager();
    this.uiManager.initialize();
    
    // Setup input handler with auto-shoot support
    this.inputHandler = new InputHandler(this.canvas);
    
    // Create camera for viewport management
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    
    // Initialize minimap renderer
    this.minimapRenderer = new MinimapRenderer();
    this.minimapRenderer.initialize();
  }
  
  /**
   * Setup WebSocket connection to game server
   */
  private setupSocketConnection(): void {
    // Connect to game server
    this.socket = io('http://localhost:3001');
    
    // Handle successful connection
    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      
      // Prompt for player name
      const playerName = prompt('Enter your name:') || `Player${Math.floor(Math.random() * 1000)}`;
      this.socket.emit('join-game', { name: playerName });
    });
    
    // Handle player join confirmation
    this.socket.on('player-joined', (data) => {
      console.log('✅ Joined game successfully');
      console.log(`📍 Spawned in ${data.worldBounds.width}x${data.worldBounds.height} world`);
      
      // Store world bounds and player data
      this.worldBounds = data.worldBounds;
      this.currentPlayer = data.playerData;
      this.players.set(data.playerId, data.playerData);
      
      // Initialize camera position on player
      if (this.currentPlayer) {
        this.camera.setTarget(
          this.currentPlayer.position.x,
          this.currentPlayer.position.y
        );
      }
    });
    
    // Handle game state updates from server
    this.socket.on('game-state', (state) => {
      this.updateGameState(state);
    });
    
    // Handle connection rejection
    this.socket.on('connection-rejected', (data) => {
      alert(`Connection rejected: ${data.message}`);
      this.socket.disconnect();
    });
    
    // Handle disconnection
    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      this.uiManager.showNotification('Disconnected from server');
    });
  }
  
  /**
   * Update local game state with server data
   */
  private updateGameState(state: any): void {
    // Update players map
    this.players.clear();
    if (state.players) {
      Object.entries(state.players).forEach(([id, player]: [string, any]) => {
        this.players.set(id, player);
        
        // Update current player reference
        if (id === this.socket.id) {
          this.currentPlayer = player;
        }
      });
    }
    
    // Update projectiles map
    this.projectiles.clear();
    if (state.projectiles) {
      Object.entries(state.projectiles).forEach(([id, projectile]: [string, any]) => {
        this.projectiles.set(id, projectile);
      });
    }
    
    // Update shapes map with type validation
    this.shapes.clear();
    if (state.shapes) {
      Object.entries(state.shapes).forEach(([id, shapeData]: [string, any]) => {
        // ✅ FIXED: Validate shape type and provide fallback
        const validShapeTypes: Array<'triangle' | 'square' | 'pentagon' | 'hexagon'> = 
          ['triangle', 'square', 'pentagon', 'hexagon'];
        
        const shape: Shape = {
          ...shapeData,
          // Ensure type is valid, fallback to 'triangle' if invalid
          type: validShapeTypes.includes(shapeData.type) ? shapeData.type : 'triangle'
        };
        
        this.shapes.set(id, shape);
      });
    }
    
    // Update UI elements if current player exists
    if (this.currentPlayer) {
      // Update stats display
      this.uiManager.updateStats({
        score: this.currentPlayer.score,
        level: this.currentPlayer.level,
        health: this.currentPlayer.health,
        maxHealth: this.currentPlayer.maxHealth,
        xp: this.currentPlayer.xp,
        xpToNext: this.currentPlayer.xpToNext
      });
      
      // Smoothly update camera position
      this.camera.update(
        this.currentPlayer.position.x,
        this.currentPlayer.position.y,
        0.1  // Smoothing factor
      );
    }
    
    // Update leaderboard
    if (state.leaderboard) {
      const leaderboardData = state.leaderboard.map((entry: any) => ({
        name: entry.name,
        score: entry.score,
        isCurrentPlayer: entry.id === this.socket.id
      }));
      this.uiManager.updateLeaderboard(leaderboardData);
    }
    
    // Update minimap with current game state
    this.minimapRenderer.update(
      this.players,
      this.shapes,
      this.currentPlayer,
      this.worldBounds
    );
  }
  
  /**
   * Send player input to server
   * Includes movement, aiming, and shooting (including auto-shoot)
   */
  private sendInput(): void {
    // Don't send input if not connected
    if (!this.socket.connected) return;
    
    // Get current input state
    const input = this.inputHandler.getInput();
    
    // Calculate world mouse position (account for camera offset)
    const worldMousePos = {
      x: input.mousePos.x + this.camera.x,
      y: input.mousePos.y + this.camera.y
    };
    
    // Send input packet to server
    this.socket.emit('player-input', {
      keys: input.keys,
      mousePos: worldMousePos,
      shooting: input.shooting,
      autoShooting: input.autoShooting  // ⭐ NEW: Auto-shoot state
    });
  }
  
  /**
   * Main game loop - runs at 60 FPS
   */
  private startGameLoop(): void {
    let lastTime = performance.now();
    
    const gameLoop = (currentTime: number) => {
      // Calculate delta time for smooth animations
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Send input to server every frame
      this.sendInput();
      
      // Update FPS counter
      this.updateFPS();
      
      // Render the game world
      this.render(deltaTime);
      
      // Continue loop
      requestAnimationFrame(gameLoop);
    };
    
    // Start the loop
    requestAnimationFrame(gameLoop);
  }
  
  /**
   * Calculate and display FPS
   */
  private updateFPS(): void {
    this.frameCount++;
    const now = Date.now();
    
    // Update FPS every second
    if (now - this.lastUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastUpdateTime = now;
      
      // Update FPS display
      this.uiManager.updateFPS(this.fps);
    }
  }
  
  /**
   * Render the entire game world
   * Uses viewport culling for performance optimization
   */
  private render(deltaTime: number): void {
    // Clear canvas with dark background
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context state and apply camera transform
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // Render background grid
    this.renderer.renderGrid(
      this.worldBounds.width,
      this.worldBounds.height,
      this.camera
    );
    
    // Render world boundaries
    this.renderer.renderWorldBoundaries(
      this.worldBounds.width,
      this.worldBounds.height
    );
    
    // Calculate visible area for culling (performance optimization)
    const visibleArea = {
      left: this.camera.x,
      right: this.camera.x + this.canvas.width,
      top: this.camera.y,
      bottom: this.camera.y + this.canvas.height
    };
    
    // Render shapes (only visible ones)
    this.shapes.forEach(shape => {
      if (this.isInViewport(shape.position, shape.size, visibleArea)) {
        this.renderer.renderShape(shape);
      }
    });
    
    // Render projectiles (only visible ones)
    this.projectiles.forEach(projectile => {
      if (this.isInViewport(projectile.position, 10, visibleArea)) {
        this.renderer.renderProjectile(projectile);
      }
    });
    
    // Render all players (only visible ones)
    this.players.forEach(player => {
      if (this.isInViewport(player.position, 50, visibleArea)) {
        const isCurrentPlayer = player.id === this.socket.id;
        this.renderer.renderPlayer(player, isCurrentPlayer);
      }
    });
    
    // Restore context state
    this.ctx.restore();
    
    // Render UI overlay effects (not affected by camera)
    // ⭐ Show auto-shoot effect when active
    if (this.inputHandler.isAutoShooting()) {
      this.renderer.renderAutoShootEffect(this.canvas.width, this.canvas.height);
    }
  }
  
  /**
   * Check if an object is within the visible viewport
   * Used for culling optimization
   */
  private isInViewport(
    position: { x: number; y: number },
    size: number,
    viewport: { left: number; right: number; top: number; bottom: number }
  ): boolean {
    return position.x + size >= viewport.left &&
           position.x - size <= viewport.right &&
           position.y + size >= viewport.top &&
           position.y - size <= viewport.bottom;
  }
}