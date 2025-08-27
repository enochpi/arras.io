/**
 * Input Handler
 * Manages keyboard and mouse input with proper event handling
 */

export class InputHandler {
  private keys: { [key: string]: boolean } = {};
  private mousePos = { x: 0, y: 0 };
  private shooting = false;

  constructor(private canvas: HTMLCanvasElement) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        this.keys[key] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        this.keys[key] = false;
      }
    });

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        e.preventDefault();
        this.shooting = true;
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        e.preventDefault();
        this.shooting = false;
      }
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Handle focus loss
    window.addEventListener('blur', () => {
      this.keys = {};
      this.shooting = false;
    });
  }

  getInput() {
    return {
      keys: {
        w: this.keys['w'] || false,
        a: this.keys['a'] || false,
        s: this.keys['s'] || false,
        d: this.keys['d'] || false
      },
      mousePos: { ...this.mousePos },
      shooting: this.shooting
    };
  }

  reset(): void {
    this.keys = {};
    this.shooting = false;
  }
}
