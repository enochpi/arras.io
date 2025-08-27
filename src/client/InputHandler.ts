import { GameClient } from './GameClient';
import { Vector2 } from '../shared/types';

export class InputHandler {
  private keys: Set<string> = new Set();
  private mousePosition: Vector2 = { x: 0, y: 0 };
  private mouseDown = false;

  constructor(private canvas: HTMLCanvasElement, private gameClient: GameClient) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      this.updateInput();
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.updateInput();
    });

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      this.updateInput();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.mouseDown = true;
        this.updateInput();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) { // Left click
        this.mouseDown = false;
        this.updateInput();
      }
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Upgrade menu events
    this.setupUpgradeMenuEvents();
  }

  private updateInput(): void {
    const movement = { x: 0, y: 0 };

    // WASD movement
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) movement.y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) movement.y += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) movement.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) movement.x += 1;

    // Normalize diagonal movement
    if (movement.x !== 0 && movement.y !== 0) {
      const length = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
      movement.x /= length;
      movement.y /= length;
    }

    this.gameClient.updateInput({
      movement,
      mousePosition: this.mousePosition,
      shooting: this.mouseDown
    });
  }

  private setupUpgradeMenuEvents(): void {
    // Create upgrade menu content
    const upgradeMenu = document.getElementById('upgrade-menu')!;
    upgradeMenu.innerHTML = `
      <h2>Upgrade Stats</h2>
      <div class="upgrade-category">
        <h3>Combat</h3>
        <div class="upgrade-buttons">
          <button class="upgrade-btn" data-stat="bulletDamage">Bullet Damage</button>
          <button class="upgrade-btn" data-stat="bulletSpeed">Bullet Speed</button>
          <button class="upgrade-btn" data-stat="bulletPenetration">Bullet Penetration</button>
          <button class="upgrade-btn" data-stat="reload">Reload</button>
        </div>
      </div>
      <div class="upgrade-category">
        <h3>Defense</h3>
        <div class="upgrade-buttons">
          <button class="upgrade-btn" data-stat="maxHealth">Max Health</button>
          <button class="upgrade-btn" data-stat="healthRegen">Health Regen</button>
          <button class="upgrade-btn" data-stat="bodyDamage">Body Damage</button>
        </div>
      </div>
      <div class="upgrade-category">
        <h3>Mobility</h3>
        <div class="upgrade-buttons">
          <button class="upgrade-btn" data-stat="movement">Movement Speed</button>
        </div>
      </div>
      <button id="closeUpgradeMenu">Close</button>
    `;

    // Add event listeners
    upgradeMenu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('upgrade-btn')) {
        const stat = target.getAttribute('data-stat')!;
        this.gameClient.requestUpgrade(stat);
      }
      
      if (target.id === 'closeUpgradeMenu') {
        upgradeMenu.style.display = 'none';
      }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        upgradeMenu.style.display = 'none';
      }
    });
  }
}
