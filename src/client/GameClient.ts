import { io, Socket } from 'socket.io-client';
import { Renderer, Shape } from './Renderer';
import { Camera } from './Camera';

export interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  maxHealth: number;
  score: number;
  level: number;
  color: string;
  size: number;
}

export interface Projectile {
  id: string;
  position: { x: number; y: number };
  size: number;
  color: string;
  owner: string;
}

export interface GameState {
  players: { [id: string]: Player };
  projectiles: { [id: string]: Projectile };
  shapes: { [id: string]: Shape };
  leaderboard: Array<{ id: string; name: string; score: number; level: number }>;
  timestamp: number;
}

export class GameClient {
  private socket: Socket | null = null;
  private renderer: Renderer;
  private camera: Camera;
  private gameState: GameState = {
    players: {},
    projectiles: {},
    shapes: {},
    leaderboard: [],
    timestamp: 0
  };
  private playerId: string | null = null;
  private isConnected = false;
  private lastFrameTime = 0;

  constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D) {
    this.renderer = new Renderer(ctx);
    this.camera = new Camera(canvas.width, canvas.height);
    console.log('GameClient initialized');
  }

  connect(playerName: string): void {
    console.log('Attempting to connect to server...');
    
    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server!');
      this.socket!.emit('join-game', { name: playerName });
    });

    this.socket.on('player-joined', (data) => {
      console.log('Player joined:', data);
      this.playerId = data.playerId;
      this.isConnected = true;
    });

    this.socket.on('game-state', (state: GameState) => {
      this.gameState = state;
      
      // Debug log to check if we're receiving data
      const playerCount = Object.keys(state.players).length;
      const shapeCount = Object.keys(state.shapes).length;
      const projectileCount = Object.keys(state.projectiles).length;
      
      if (playerCount > 0 || shapeCount > 0) {
        console.log(`Game state: ${playerCount} players, ${shapeCount} shapes, ${projectileCount} projectiles`);
      }
      
      this.updateUI();
    });

    this.socket.on('connection-rejected', (data) => {
      console.log('Connection rejected:', data);
      alert(`Connection rejected: ${data.message}`);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  sendInput(input: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('player-input', input);
    }
  }

  start(): void {
    console.log('Starting game loop...');
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    if (this.playerId && this.gameState.players[this.playerId]) {
      const player = this.gameState.players[this.playerId];
      this.camera.follow(player.position.x, player.position.y);
    }
    this.camera.update(deltaTime);
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Background
    this.ctx.fillStyle = '#2C2C2C';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context state
    this.ctx.save();
    
    // Apply camera transformation
    this.camera.apply(this.ctx);
    
    // Render grid
    this.renderer.renderGrid(4000, 4000);
    
    // Render shapes (behind everything else)
    const shapes = Object.values(this.gameState.shapes);
    if (shapes.length > 0) {
      console.log(`Rendering ${shapes.length} shapes`);
      shapes.forEach(shape => {
        this.renderer.renderShape(shape);
      });
    }
    
    // Render players
    const players = Object.values(this.gameState.players);
    if (players.length > 0) {
      console.log(`Rendering ${players.length} players`);
      players.forEach(player => {
        this.renderer.renderPlayer(player, player.id === this.playerId);
      });
    }
    
    // Render projectiles (on top)
    Object.values(this.gameState.projectiles).forEach(projectile => {
      this.renderer.renderProjectile(projectile);
    });
    
    // Restore context state
    this.ctx.restore();
    
    // Draw debug info if not connected
    if (!this.isConnected) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Waiting for server connection...', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  private updateUI(): void {
    if (!this.playerId || !this.gameState.players[this.playerId]) return;

    const player = this.gameState.players[this.playerId];
    
    // Update HUD
    this.updateStatBar('health-bar', player.health, player.maxHealth);
    
    // Update score and level
    const scoreDisplay = document.querySelector('.score-display');
    const levelDisplay = document.querySelector('.level-display');
    
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${player.score}`;
    if (levelDisplay) levelDisplay.textContent = `Level: ${player.level}`;
    
    // Update leaderboard
    this.updateLeaderboard();
  }

  private updateStatBar(barId: string, current: number, max: number): void {
    const bar = document.getElementById(barId);
    if (!bar) return;
    
    const fill = bar.querySelector('.stat-fill') as HTMLElement;
    const text = bar.querySelector('.stat-text') as HTMLElement;
    
    if (fill) {
      const percentage = Math.max(0, Math.min(100, (current / max) * 100));
      fill.style.width = `${percentage}%`;
    }
    
    if (text) {
      text.textContent = `${Math.round(current)}/${Math.round(max)}`;
    }
  }

  private updateLeaderboard(): void {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;
    
    leaderboard.innerHTML = '<h3>Leaderboard</h3>';
    
    this.gameState.leaderboard.forEach((entry, index) => {
      const div = document.createElement('div');
      div.className = 'leaderboard-entry';
      if (entry.id === this.playerId) {
        div.classList.add('current-player');
      }
      
      div.innerHTML = `
        <span>${index + 1}. ${entry.name}</span>
        <span>${entry.score}</span>
      `;
      
      leaderboard.appendChild(div);
    });
  }

  handleResize(): void {
    this.camera.resize(this.canvas.width, this.canvas.height);
  }
}
