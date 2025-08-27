/**
 * Game Client - Main client-side game logic
 * Handles game state, rendering, and server communication
 */

import { io, Socket } from 'socket.io-client';
import { Renderer, Shape } from './Renderer';
import { UIManager } from './UIManager';

export interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  score: number;
  velocity: { x: number; y: number };
}

export interface Projectile {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  damage: number;
  ownerId: string;
}

export class GameClient {
  private socket!: Socket;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private renderer!: Renderer;
  private uiManager!: UIManager;
  
  private currentPlayer!: Player;
  private players: Map<string, Player> = new Map();
  private projectiles: Map<string, Projectile> = new Map();
  private shapes: Map<string, Shape> = new Map();
  
  private mousePosition = { x: 0, y: 0 };
  private keys = new Set<string>();
  private camera = { x: 0, y: 0 };
  
  initialize(): void {
    this.setupCanvas();
    this.setupSocketConnection();
    this.setupEventListeners();
    this.uiManager = new UIManager();
    this.uiManager.initialize();
    this.startGameLoop();
  }
  
  private setupCanvas(): void {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.renderer = new Renderer(this.ctx);
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  private setupSocketConnection(): void {
    this.socket = io('http://localhost:3001');
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('joinGame', { name: 'Player' });
    });
    
    this.socket.on('gameState', (state) => {
      this.updateGameState(state);
    });
    
    this.socket.on('playerJoined', (player) => {
      this.players.set(player.id, player);
      if (player.id === this.socket.id) {
        this.currentPlayer = player;
      }
    });
    
    this.socket.on('playerLeft', (playerId) => {
      this.players.delete(playerId);
    });
  }
  
  private setupEventListeners(): void {
    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.updatePlayerRotation();
    });
    
    // Mouse click for shooting
    this.canvas.addEventListener('mousedown', () => {
      this.socket.emit('shoot');
    });
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      this.updateMovement();
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.updateMovement();
    });
  }
  
  private updatePlayerRotation(): void {
    if (!this.currentPlayer) return;
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const angle = Math.atan2(
      this.mousePosition.y - centerY,
      this.mousePosition.x - centerX
    );
    
    this.socket.emit('rotate', angle);
  }
  
  private updateMovement(): void {
    const movement = { x: 0, y: 0 };
    
    if (this.keys.has('KeyW')) movement.y = -1;
    if (this.keys.has('KeyS')) movement.y = 1;
    if (this.keys.has('KeyA')) movement.x = -1;
    if (this.keys.has('KeyD')) movement.x = 1;
    
    this.socket.emit('move', movement);
  }
  
  private updateGameState(state: any): void {
    // Update players
    this.players.clear();
    for (const player of state.players) {
      this.players.set(player.id, player);
      if (player.id === this.socket.id) {
        this.currentPlayer = player;
      }
    }
    
    // Update projectiles
    this.projectiles.clear();
    for (const projectile of state.projectiles) {
      this.projectiles.set(projectile.id, projectile);
    }
    
    // Update shapes
    this.shapes.clear();
    for (const shape of state.shapes) {
      this.shapes.set(shape.id, shape);
    }
    
    // Update UI
    if (this.currentPlayer) {
      this.uiManager.updateStats({
        score: this.currentPlayer.score,
        level: this.currentPlayer.level,
        health: this.currentPlayer.health,
        maxHealth: this.currentPlayer.maxHealth,
        xp: this.currentPlayer.xp,
        xpToNext: this.currentPlayer.level * 100
      });
    }
    
    // Update leaderboard
    const leaderboardData = Array.from(this.players.values()).map(p => ({
      name: p.name,
      score: p.score,
      isCurrentPlayer: p.id === this.socket.id
    }));
    this.uiManager.updateLeaderboard(leaderboardData);
  }
  
  private startGameLoop(): void {
    const gameLoop = () => {
      this.render();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }
  
  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update camera to follow player
    if (this.currentPlayer) {
      this.camera.x = this.currentPlayer.position.x - this.canvas.width / 2;
      this.camera.y = this.currentPlayer.position.y - this.canvas.height / 2;
    }
    
    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // Render grid
    this.renderer.renderGrid(3000, 3000);
    
    // Render shapes
    for (const shape of this.shapes.values()) {
      this.renderer.renderShape(shape);
    }
    
    // Render projectiles
    for (const projectile of this.projectiles.values()) {
      this.renderer.renderProjectile(projectile);
    }
    
    // Render players
    for (const player of this.players.values()) {
      this.renderer.renderPlayer(player, player.id === this.socket.id);
    }
    
    this.ctx.restore();
  }
}
