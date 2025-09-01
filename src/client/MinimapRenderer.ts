/**
 * Minimap Renderer for tactical overview
 */

export class MinimapRenderer {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private minimapSize = 180;
  
  initialize(): void {
    this.canvas = document.getElementById('minimapCanvas') as HTMLCanvasElement;
    if (!this.canvas) {
      console.warn('Minimap canvas not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = this.minimapSize;
    this.canvas.height = this.minimapSize;
  }
  
  update(
    players: Map<string, any>,
    shapes: Map<string, any>,
    currentPlayer: any,
    worldBounds: { width: number; height: number }
  ): void {
    if (!this.ctx) return;
    
    // Clear minimap with dark background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.minimapSize, this.minimapSize);
    
    // Draw grid
    this.ctx.strokeStyle = 'rgba(0, 178, 225, 0.2)';
    this.ctx.lineWidth = 0.5;
    const gridSize = this.minimapSize / 5;
    
    for (let i = 1; i < 5; i++) {
      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(i * gridSize, 0);
      this.ctx.lineTo(i * gridSize, this.minimapSize);
      this.ctx.stroke();
      
      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * gridSize);
      this.ctx.lineTo(this.minimapSize, i * gridSize);
      this.ctx.stroke();
    }
    
    // Scale factor for world to minimap conversion
    const scaleX = this.minimapSize / worldBounds.width;
    const scaleY = this.minimapSize / worldBounds.height;
    
    // Draw shapes as small dots
    shapes.forEach(shape => {
      const x = shape.position.x * scaleX;
      const y = shape.position.y * scaleY;
      
      this.ctx.fillStyle = this.getShapeMinimapColor(shape.type);
      this.ctx.beginPath();
      this.ctx.arc(x, y, 1, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Draw other players
    players.forEach((player, id) => {
      if (currentPlayer && id !== currentPlayer.id) {
        const x = player.position.x * scaleX;
        const y = player.position.y * scaleY;
        
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    
    // Draw current player with pulsing effect
    if (currentPlayer) {
      const x = currentPlayer.position.x * scaleX;
      const y = currentPlayer.position.y * scaleY;
      
      // Outer glow
      const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
      this.ctx.fillStyle = `rgba(0, 178, 225, ${0.3 + pulse * 0.3})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Inner dot
      this.ctx.fillStyle = '#00B2E1';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Direction indicator
      this.ctx.strokeStyle = '#00B2E1';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      const dirX = x + Math.cos(currentPlayer.rotation) * 8;
      const dirY = y + Math.sin(currentPlayer.rotation) * 8;
      this.ctx.lineTo(dirX, dirY);
      this.ctx.stroke();
    }
    
    // Draw border
    this.ctx.strokeStyle = 'rgba(0, 178, 225, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, this.minimapSize, this.minimapSize);
  }
  
  private getShapeMinimapColor(type: string): string {
    switch(type) {
      case 'triangle': return 'rgba(255, 107, 107, 0.6)';
      case 'square': return 'rgba(255, 230, 109, 0.6)';
      case 'pentagon': return 'rgba(78, 205, 196, 0.6)';
      case 'hexagon': return 'rgba(168, 230, 207, 0.6)';
      default: return 'rgba(136, 136, 136, 0.6)';
    }
  }
}
