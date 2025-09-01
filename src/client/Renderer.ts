/**
 * Renderer Module
 * 
 * Handles all visual rendering for the game including:
 * - Players, projectiles, shapes
 * - Grid background and world boundaries
 * - Visual effects (auto-shoot, particles)
 * - Optimized for the EXPANDED 6000x6000 world
 */

import { Camera } from './Camera';

// Shape interface definition for rendering
export interface Shape {
  id: string;
  position: { x: number; y: number };
  size: number;
  type: 'triangle' | 'square' | 'pentagon' | 'hexagon';
  rotation: number;
  health: number;
  maxHealth: number;
  color: string;
}

// Player interface for rendering
export interface Player {
  id: string;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  maxHealth: number;
  name: string;
}

// Projectile interface for rendering
export interface Projectile {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

export class Renderer {
  // Store canvas context reference
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  /**
   * Render the background grid
   * Only renders visible portion for performance
   */
  renderGrid(worldWidth: number, worldHeight: number, camera: Camera): void {
    const gridSize = 50;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    
    // Calculate visible grid bounds
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const endX = Math.ceil((camera.x + camera.viewportWidth) / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;
    const endY = Math.ceil((camera.y + camera.viewportHeight) / gridSize) * gridSize;
    
    // Draw vertical lines
    for (let x = startX; x <= endX && x <= worldWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, Math.max(0, startY));
      this.ctx.lineTo(x, Math.min(worldHeight, endY));
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY && y <= worldHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(Math.max(0, startX), y);
      this.ctx.lineTo(Math.min(worldWidth, endX), y);
      this.ctx.stroke();
    }
  }
  
  /**
   * Render world boundaries with warning gradient
   * Shows the edges of the 6000x6000 world
   */
  renderWorldBoundaries(worldWidth: number, worldHeight: number): void {
    const borderWidth = 5;
    const glowSize = 50;
    
    // Create gradient for boundary glow effect
    this.ctx.strokeStyle = '#00B2E1';
    this.ctx.lineWidth = borderWidth;
    
    // Draw main border
    this.ctx.strokeRect(0, 0, worldWidth, worldHeight);
    
    // Draw warning gradient near edges
    const gradient = this.ctx.createLinearGradient(0, 0, glowSize, 0);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    // Left edge
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, glowSize, worldHeight);
    
    // Right edge
    this.ctx.save();
    this.ctx.translate(worldWidth, 0);
    this.ctx.scale(-1, 1);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, glowSize, worldHeight);
    this.ctx.restore();
    
    // Top edge
    const vGradient = this.ctx.createLinearGradient(0, 0, 0, glowSize);
    vGradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
    vGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    this.ctx.fillStyle = vGradient;
    this.ctx.fillRect(0, 0, worldWidth, glowSize);
    
    // Bottom edge
    this.ctx.save();
    this.ctx.translate(0, worldHeight);
    this.ctx.scale(1, -1);
    this.ctx.fillStyle = vGradient;
    this.ctx.fillRect(0, 0, worldWidth, glowSize);
    this.ctx.restore();
  }
  
  /**
   * Render a player tank
   */
  renderPlayer(player: Player, isCurrentPlayer: boolean): void {
    const { position, rotation, health, maxHealth, name } = player;
    
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    
    // Draw health bar above player
    this.renderHealthBar(health, maxHealth, -30);
    
    // Draw player name
    this.ctx.fillStyle = isCurrentPlayer ? '#00B2E1' : '#FFFFFF';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(name, 0, -40);
    
    // Rotate for tank direction
    this.ctx.rotate(rotation);
    
    // Draw tank body with gradient
    const bodyGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    if (isCurrentPlayer) {
      bodyGradient.addColorStop(0, '#00B2E1');
      bodyGradient.addColorStop(1, '#0099CC');
    } else {
      bodyGradient.addColorStop(0, '#FF6B6B');
      bodyGradient.addColorStop(1, '#CC5555');
    }
    
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw tank outline
    this.ctx.strokeStyle = isCurrentPlayer ? '#00D4FF' : '#FF8888';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw tank barrel
    this.ctx.fillStyle = isCurrentPlayer ? '#0088BB' : '#BB4444';
    this.ctx.fillRect(15, -5, 25, 10);
    
    // Draw barrel outline
    this.ctx.strokeStyle = isCurrentPlayer ? '#00AADD' : '#DD6666';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(15, -5, 25, 10);
    
    this.ctx.restore();
  }
  
  /**
   * Render a projectile with trail effect
   */
  renderProjectile(projectile: Projectile): void {
    const { position, velocity } = projectile;
    
    this.ctx.save();
    
    // Draw trail effect
    const trailLength = 20;
    const angle = Math.atan2(velocity.y, velocity.x);
    const trailX = position.x - Math.cos(angle) * trailLength;
    const trailY = position.y - Math.sin(angle) * trailLength;
    
    const gradient = this.ctx.createLinearGradient(
      trailX, trailY,
      position.x, position.y
    );
    gradient.addColorStop(0, 'rgba(255, 230, 0, 0)');
    gradient.addColorStop(1, 'rgba(255, 230, 0, 0.8)');
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(trailX, trailY);
    this.ctx.lineTo(position.x, position.y);
    this.ctx.stroke();
    
    // Draw projectile core
    this.ctx.fillStyle = '#FFE600';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw glow effect
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#FFE600';
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
    
    this.ctx.restore();
  }
  
  /**
   * Render a shape (triangle, square, pentagon, hexagon)
   */
  renderShape(shape: Shape): void {
    const { position, size, type, rotation, health, maxHealth, color } = shape;
    
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(rotation);
    
    // Create gradient for shape
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, this.lightenColor(color, 20));
    gradient.addColorStop(1, color);
    
    this.ctx.fillStyle = gradient;
    this.ctx.strokeStyle = this.darkenColor(color, 20);
    this.ctx.lineWidth = 2;
    
    // Draw shape based on type
    this.ctx.beginPath();
    switch(type) {
      case 'triangle':
        this.drawPolygon(3, size);
        break;
      case 'square':
        this.ctx.rect(-size, -size, size * 2, size * 2);
        break;
      case 'pentagon':
        this.drawPolygon(5, size);
        break;
      case 'hexagon':
        this.drawPolygon(6, size);
        break;
    }
    
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw health bar if damaged
    if (health < maxHealth) {
      this.ctx.rotate(-rotation); // Unrotate for health bar
      this.renderHealthBar(health, maxHealth, -size - 15);
    }
    
    this.ctx.restore();
  }
  
  /**
   * ⭐ NEW FEATURE: Render auto-shoot visual effect
   * Shows golden border glow when auto-shoot is active
   */
  renderAutoShootEffect(canvasWidth: number, canvasHeight: number): void {
    this.ctx.save();
    
    // Create pulsing effect
    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
    
    // Draw golden border glow
    this.ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
    this.ctx.lineWidth = 8;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    
    // Draw border
    this.ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    
    // Add corner accents
    const cornerSize = 50;
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = `rgba(255, 230, 0, ${pulse})`;
    
    // Top-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(0, cornerSize);
    this.ctx.lineTo(0, 0);
    this.ctx.lineTo(cornerSize, 0);
    this.ctx.stroke();
    
    // Top-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(canvasWidth - cornerSize, 0);
    this.ctx.lineTo(canvasWidth, 0);
    this.ctx.lineTo(canvasWidth, cornerSize);
    this.ctx.stroke();
    
    // Bottom-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(0, canvasHeight - cornerSize);
    this.ctx.lineTo(0, canvasHeight);
    this.ctx.lineTo(cornerSize, canvasHeight);
    this.ctx.stroke();
    
    // Bottom-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(canvasWidth - cornerSize, canvasHeight);
    this.ctx.lineTo(canvasWidth, canvasHeight);
    this.ctx.lineTo(canvasWidth, canvasHeight - cornerSize);
    this.ctx.stroke();
    
    this.ctx.restore();
  }
  
  /**
   * Helper: Draw a regular polygon
   */
  private drawPolygon(sides: number, size: number): void {
    const angle = (Math.PI * 2) / sides;
    
    for (let i = 0; i < sides; i++) {
      const x = Math.cos(angle * i - Math.PI / 2) * size;
      const y = Math.sin(angle * i - Math.PI / 2) * size;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
  }
  
  /**
   * Helper: Render a health bar
   */
  private renderHealthBar(health: number, maxHealth: number, yOffset: number): void {
    const barWidth = 40;
    const barHeight = 4;
    const healthPercent = health / maxHealth;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(-barWidth/2, yOffset, barWidth, barHeight);
    
    // Health fill with color based on percentage
    if (healthPercent > 0.6) {
      this.ctx.fillStyle = '#4CAF50';
    } else if (healthPercent > 0.3) {
      this.ctx.fillStyle = '#FF9800';
    } else {
      this.ctx.fillStyle = '#F44336';
    }
    
    this.ctx.fillRect(-barWidth/2, yOffset, barWidth * healthPercent, barHeight);
    
    // Border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-barWidth/2, yOffset, barWidth, barHeight);
  }
  
  /**
   * Helper: Lighten a color
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }
  
  /**
   * Helper: Darken a color
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0))
      .toString(16).slice(1);
  }
}
