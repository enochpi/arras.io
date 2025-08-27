import { Vector2 } from '../shared/types';
import { MathUtils } from '../shared/utils';

export class Camera {
  public position: Vector2 = { x: 0, y: 0 };
  public width: number;
  public height: number;
  private targetPosition: Vector2 = { x: 0, y: 0 };
  private smoothing = 0.1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  followTarget(target: Vector2): void {
    this.targetPosition = {
      x: target.x - this.width / 2,
      y: target.y - this.height / 2
    };

    // Smooth camera movement
    this.position.x = MathUtils.lerp(this.position.x, this.targetPosition.x, this.smoothing);
    this.position.y = MathUtils.lerp(this.position.y, this.targetPosition.y, this.smoothing);
  }

  worldToScreen(worldPos: Vector2): Vector2 {
    return {
      x: worldPos.x - this.position.x,
      y: worldPos.y - this.position.y
    };
  }

  screenToWorld(screenPos: Vector2): Vector2 {
    return {
      x: screenPos.x + this.position.x,
      y: screenPos.y + this.position.y
    };
  }

  updateViewport(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  isInView(position: Vector2, size: number = 0): boolean {
    return position.x + size >= this.position.x &&
           position.x - size <= this.position.x + this.width &&
           position.y + size >= this.position.y &&
           position.y - size <= this.position.y + this.height;
  }
}
