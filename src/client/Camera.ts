/**
 * Camera System
 * 
 * Manages viewport following and smooth camera movement
 * Essential for navigating the EXPANDED 6000x6000 world
 */

export class Camera {
  // Current camera position (top-left corner of viewport)
  public x: number = 0;
  public y: number = 0;
  
  // Target position for smooth following
  private targetX: number = 0;
  private targetY: number = 0;
  
  // Viewport dimensions
  public viewportWidth: number;
  public viewportHeight: number;
  
  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }
  
  /**
   * Set camera target position (instant snap)
   */
  setTarget(x: number, y: number): void {
    // Center camera on target
    this.targetX = x - this.viewportWidth / 2;
    this.targetY = y - this.viewportHeight / 2;
    
    // Snap to target immediately
    this.x = this.targetX;
    this.y = this.targetY;
  }
  
  /**
   * Update camera position with smooth following
   * @param targetX - World X position to follow
   * @param targetY - World Y position to follow
   * @param smoothing - Smoothing factor (0-1, lower = smoother)
   */
  update(targetX: number, targetY: number, smoothing: number = 0.1): void {
    // Update target position (centered on target)
    this.targetX = targetX - this.viewportWidth / 2;
    this.targetY = targetY - this.viewportHeight / 2;
    
    // Smooth camera movement using linear interpolation
    this.x += (this.targetX - this.x) * smoothing;
    this.y += (this.targetY - this.y) * smoothing;
  }
  
  /**
   * Update viewport dimensions (called on window resize)
   */
  updateViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }
  
  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }
  
  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }
  
  /**
   * Check if a position is within the camera view
   * Used for culling optimization
   */
  isInView(x: number, y: number, margin: number = 100): boolean {
    return x >= this.x - margin &&
           x <= this.x + this.viewportWidth + margin &&
           y >= this.y - margin &&
           y <= this.y + this.viewportHeight + margin;
  }
}
