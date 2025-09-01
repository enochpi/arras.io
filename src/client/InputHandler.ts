/**
 * Enhanced Input Handler
 * Now includes auto-shoot functionality on 'E' key
 */

export class InputHandler {
  private keys: { [key: string]: boolean } = {};
  private mousePos = { x: 0, y: 0 };
  private shooting = false;
  private autoShooting = false;
  private autoShootIndicator: HTMLElement | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.setupEventListeners();
    this.createAutoShootIndicator();
  }

  private createAutoShootIndicator(): void {
    this.autoShootIndicator = document.createElement('div');
    this.autoShootIndicator.id = 'auto-shoot-indicator';
    this.autoShootIndicator.innerHTML = `
      <span class="indicator-icon">🎯</span>
      <span class="indicator-text">AUTO</span>
    `;
    this.autoShootIndicator.style.display = 'none';
    document.body.appendChild(this.autoShootIndicator);
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      
      // Movement keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        this.keys[key] = true;
      }
      
      // Auto-shoot toggle on 'E'
      if (key === 'e' && !this.autoShooting) {
        e.preventDefault();
        this.autoShooting = true;
        this.shooting = false; // Disable manual shooting during auto-shoot
        this.showAutoShootIndicator();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      
      // Movement keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        this.keys[key] = false;
      }
      
      // Stop auto-shoot when 'E' is released
      if (key === 'e') {
        e.preventDefault();
        this.autoShooting = false;
        this.hideAutoShootIndicator();
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
      if (e.button === 0 && !this.autoShooting) { // Left click, but not during auto-shoot
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
      this.autoShooting = false;
      this.hideAutoShootIndicator();
    });
  }

  private showAutoShootIndicator(): void {
    if (this.autoShootIndicator) {
      this.autoShootIndicator.style.display = 'flex';
      this.autoShootIndicator.classList.add('active');
    }
  }

  private hideAutoShootIndicator(): void {
    if (this.autoShootIndicator) {
      this.autoShootIndicator.classList.remove('active');
      setTimeout(() => {
        if (this.autoShootIndicator) {
          this.autoShootIndicator.style.display = 'none';
        }
      }, 300);
    }
  }

  getInput() {
    // Combine WASD and arrow keys
    const moveUp = this.keys['w'] || this.keys['arrowup'] || false;
    const moveDown = this.keys['s'] || this.keys['arrowdown'] || false;
    const moveLeft = this.keys['a'] || this.keys['arrowleft'] || false;
    const moveRight = this.keys['d'] || this.keys['arrowright'] || false;

    return {
      keys: {
        w: moveUp,
        a: moveLeft,
        s: moveDown,
        d: moveRight
      },
      mousePos: { ...this.mousePos },
      shooting: this.shooting,
      autoShooting: this.autoShooting
    };
  }

  reset(): void {
    this.keys = {};
    this.shooting = false;
    this.autoShooting = false;
    this.hideAutoShootIndicator();
  }

  isAutoShooting(): boolean {
    return this.autoShooting;
  }
}
