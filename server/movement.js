/**
 * Optimized Movement System
 * Handles player movement with acceleration and deceleration
 */

class MovementSystem {
  constructor(worldWidth, worldHeight) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.baseSpeed = 200; // Base speed in pixels per second
    this.acceleration = 800; // Acceleration rate
    this.friction = 0.9; // Friction coefficient
  }

  processMovement(player, input, deltaTime) {
    if (!player || !input || !input.keys) return;
    
    const speed = this.baseSpeed * player.stats.movement;
    const accel = this.acceleration * deltaTime;
    
    // Apply acceleration based on input
    if (input.keys.w) player.velocity.y -= accel;
    if (input.keys.s) player.velocity.y += accel;
    if (input.keys.a) player.velocity.x -= accel;
    if (input.keys.d) player.velocity.x += accel;
    
    // Apply friction
    player.velocity.x *= this.friction;
    player.velocity.y *= this.friction;
    
    // Limit max speed
    const currentSpeed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
    if (currentSpeed > speed) {
      const scale = speed / currentSpeed;
      player.velocity.x *= scale;
      player.velocity.y *= scale;
    }
    
    // Update position
    const newX = player.position.x + player.velocity.x * deltaTime;
    const newY = player.position.y + player.velocity.y * deltaTime;
    
    // Keep player in bounds
    player.position.x = Math.max(player.size, Math.min(this.worldWidth - player.size, newX));
    player.position.y = Math.max(player.size, Math.min(this.worldHeight - player.size, newY));
    
    // Update legacy position properties
    player.x = player.position.x;
    player.y = player.position.y;
    
    // Update rotation if mouse position provided
    if (input.mousePos) {
      const angle = Math.atan2(
        input.mousePos.y - player.position.y,
        input.mousePos.x - player.position.x
      );
      player.rotation = angle;
    }
    
    player.lastUpdate = Date.now();
  }

  predictPosition(player, deltaTime) {
    // Predict where player will be (for lag compensation)
    return {
      x: player.position.x + player.velocity.x * deltaTime,
      y: player.position.y + player.velocity.y * deltaTime
    };
  }
}

module.exports = MovementSystem;
