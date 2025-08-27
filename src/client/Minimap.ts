/**
 * Minimap Component
 * Displays a small overview of the game world
 */

import { Player, Projectile } from './GameClient';
import { Shape } from './Renderer';

interface GameState {
  players: { [key: string]: Player };
  projectiles: { [key: string]: Projectile };
  shapes: { [key: string]: Shape };
}

export class Minimap {
  private size = 150;
  private padding = 20;
  private scale = 0;

  render(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    currentPlayer: Player,
    worldBounds: { width: number; height: number }
  ): void {
    const x = ctx.canvas.width - this.size - this.padding;
    const y = ctx.canvas.height - this.size - this.padding;
    
    // Calculate scale
    this.scale = this.size / Math.max(worldBounds.width, worldBounds.height);
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, this.size, this.size);
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.size, this.size);
    
    // Render shapes (as dots)
    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
    for (const shape of Object.values(gameState.shapes)) {
      const sx = x + shape.position.x * this.scale;
      const sy = y + shape.position.y * this.scale;
      const size = Math.max(1, shape.size * this.scale * 0.5);
      
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Render other players
    for (const [id, player] of Object.entries(gameState.players)) {
      if (id === currentPlayer.id) continue;
      
      const px = x + player.position.x * this.scale;
      const py = y + player.position.y * this.scale;
      
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Render current player (highlighted)
    const px = x + currentPlayer.position.x * this.scale;
    const py = y + currentPlayer.position.y * this.scale;
    
    // Player dot
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // View cone
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    const viewRadius = 50;
    ctx.beginPath();
    ctx.arc(px, py, viewRadius * this.scale, 0, Math.PI * 2);
    ctx.stroke();
    
    // Minimap label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MINIMAP', x + this.size / 2, y - 5);
  }
}
