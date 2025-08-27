/**
 * Camera System
 * Handles viewport and smooth camera following
 */

export class Camera {
  private x = 0;
  private y = 0;
  private targetX = 0;
  private targetY = 0;
  private smoothing = 0.1;
  
  constructor(
    private viewportWidth: number,
    private viewportHeight: number
  ) {}

  follow(target: { x: number; y: number }): void {
    this.targetX = target.x - this.viewportWidth / 2;
    this.targetY = target.y - this.viewportHeight / 2;
    
    // Smooth camera movement
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(-this.x, -this.y);
  }

  screenToWorld(screenX: number, screenY: number, playerPos: { x: number; y: number }): { x: number; y: number } {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  updateViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  getViewBounds(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.x,
      right: this.x + this.viewportWidth,
      top: this.y,
      bottom: this.y + this.viewportHeight
    };
  }
}
