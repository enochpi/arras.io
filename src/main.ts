import { GameClient } from './client/GameClient';
import { InputHandler } from './client/InputHandler';
import { UIManager } from './client/UIManager';

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameClient: GameClient;
  private inputHandler: InputHandler;
  private uiManager: UIManager;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.gameClient = new GameClient(this.canvas, this.ctx);
    this.inputHandler = new InputHandler(this.canvas, this.gameClient);
    this.uiManager = new UIManager();
    
    this.initialize();
  }

  private initialize(): void {
    // Setup canvas
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Initialize UI
    this.uiManager.initialize();
    
    // Start game immediately
    this.gameClient.start();
    
    // Connect to server
    this.connectToServer();
  }

  private resizeCanvas(): void {
    const container = document.getElementById('game-container')!;
    const maxWidth = Math.min(window.innerWidth - 40, 1200);
    const maxHeight = Math.min(window.innerHeight - 40, 800);
    
    this.canvas.width = maxWidth;
    this.canvas.height = maxHeight;
    
    this.gameClient.handleResize();
  }

  private connectToServer(): void {
    const playerName = `Player${Math.floor(Math.random() * 1000)}`;
    
    // Show connection status
    const connectionStatus = document.getElementById('connection-status')!;
    connectionStatus.classList.remove('hidden');
    
    console.log('Connecting to server...');
    
    // Connect to game server
    this.gameClient.connect(playerName);
    
    // Hide connection status after connection
    setTimeout(() => {
      connectionStatus.classList.add('hidden');
    }, 1500);
  }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Starting game...');
  new Game();
});
