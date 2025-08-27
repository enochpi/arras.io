export class Camera {
  public x = 0;
  public y = 0;
  private targetX = 0;
  private targetY = 0;
  private smoothing = 0.1;

  constructor(private width: number, private height: number) {}

  follow(targetX: number, targetY: number): void {
    this.targetX = targetX - this.width / 2;
    this.targetY = targetY - this.height / 2;
  }

  update(deltaTime: number): void {
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(-this.x, -this.y);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
