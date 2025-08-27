import { io, Socket } from 'socket.io-client';
import { GameState, Player, Projectile, Enemy, InputState, Vector2 } from '../shared/types';
import { Renderer } from './Renderer';
import { Camera } from './Camera';

export class GameClient {
  private socket: Socket | null = null;
  private gameState: GameState;
  private renderer: Renderer;
  private camera: Camera;
  private playerId: string | null = null;
  private inputState: InputState;
  private lastUpdateTime = 0;
  private isRunning = false;

  constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D) {
    this.gameState = {
      players: new Map(),
      projectiles: new Map(),
      enemies: new Map(),
      leaderboard: [],
      worldBounds: { width: 4000, height: 4000 }
    };

    this.renderer = new Renderer(ctx);
    this.camera = new Camera(canvas.width, canvas.height);
    
    this.inputState = {
      movement: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
      shooting: false,
      upgradeRequests: []
    };

    this.setupSocketListeners();
  }

  connect(playerName: string, gameMode: string): void {
    this.socket = io('http://localhost:3001');
    
    this.socket.emit('join-game', {
      name: playerName,
      mode: gameMode
    });
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('player-joined', (data: { playerId: string }) => {
      this.playerId = data.playerId;
      console.log('Joined game with ID:', this.playerId);
    });

    this.socket.on('game-state', (state: any) => {
      this.updateGameState(state);
    });

    this.socket.on('player-died', () => {
      console.log('Player died!');
      // Handle respawn logic
    });

    this.socket.on('level-up', (data: { level: number, upgradePoints: number }) => {
      console.log('Level up!', data);
      this.showUpgradeMenu();
    });
  }

  private updateGameState(state: any): void {
    // Convert plain objects back to Maps
    this.gameState.players = new Map(Object.entries(state.players));
    this.gameState.projectiles = new Map(Object.entries(state.projectiles));
    this.gameState.enemies = new Map(Object.entries(state.enemies));
    this.gameState.leaderboard = state.leaderboard;
  }

  start(): void {
    this.isRunning = true;
    this.gameLoop();
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update camera to follow player
    if (this.playerId && this.gameState.players.has(this.playerId)) {
      const player = this.gameState.players.get(this.playerId)!;
      this.camera.followTarget(player.position);
    }

    // Send input to server
    if (this.socket) {
      this.socket.emit('player-input', this.inputState);
    }

    // Reset one-time inputs
    this.inputState.upgradeRequests = [];
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render game world
    this.renderer.renderBackground(this.camera);
    this.renderer.renderEnemies(this.gameState.enemies, this.camera);
    this.renderer.renderProjectiles(this.gameState.projectiles, this.camera);
    this.renderer.renderPlayers(this.gameState.players, this.camera, this.playerId);
    this.renderer.renderUI(this.gameState, this.playerId);
  }

  updateInput(inputState: Partial<InputState>): void {
    Object.assign(this.inputState, inputState);
  }

  handleResize(): void {
    this.camera.updateViewport(this.canvas.width, this.canvas.height);
  }

  private showUpgradeMenu(): void {
    const upgradeMenu = document.getElementById('upgrade-menu')!;
    upgradeMenu.style.display = 'block';
  }

  requestUpgrade(statName: string): void {
    this.inputState.upgradeRequests.push(statName);
  }
}
