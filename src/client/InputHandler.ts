import { GameClient } from './GameClient';

export class InputHandler {
  private keys: { [key: string]: boolean } = {};
  private mousePos = { x: 0, y: 0 };
  private shooting = false;

  constructor(private canvas: HTMLCanvasElement, private gameClient: GameClient) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.sendInput();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.sendInput();
    });

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
      this.sendInput();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.shooting = true;
        this.sendInput();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) { // Left click
        this.shooting = false;
        this.sendInput();
      }
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private sendInput(): void {
    const input = {
      keys: {
        w: this.keys['KeyW'] || this.keys['ArrowUp'],
        a: this.keys['KeyA'] || this.keys['ArrowLeft'],
        s: this.keys['KeyS'] || this.keys['ArrowDown'],
        d: this.keys['KeyD'] || this.keys['ArrowRight']
      },
      mousePos: this.mousePos,
      shooting: this.shooting,
      timestamp: Date.now()
    };

    this.gameClient.sendInput(input);
  }
}
