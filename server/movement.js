/**
 * Movement System with improved physics
 */

class MovementSystem {
  constructor(worldWidth, worldHeight) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.friction = 0.9;
    this.acceleration = 800;
  }

  processMovement(player, input, deltaTime) {
    if (!player || !input || !input.keys) return;

    // Calculate acceleration based on input
    let accelX = 0;
    let accelY = 0;

    if (input.keys.w) accelY -= this.acceleration;
    if (input.keys.s) accelY += this.acceleration;
    if (input.keys.a) accelX -= this.acceleration;
    if (input.keys.d) accelX += this.acceleration;

    // Normalize diagonal movement
    if (accelX !== 0 && accelY !== 0) {
      const factor = 0.707; // 1/sqrt(2)
      accelX *= factor;
      accelY *= factor;
    }

    // Apply acceleration to velocity
    player.velocity.x += accelX * deltaTime;
    player.velocity.y += accelY * deltaTime;

    // Apply friction
    player.velocity.x *= this.friction;
    player.velocity.y *= this.friction;

    // Limit max speed
    const maxSpeed = player.speed || 200;
    const currentSpeed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
    
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      player.velocity.x *= scale;
      player.velocity.y *= scale;
    }

    // Update position
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;

    // Keep player within world bounds with bounce effect
    const margin = 30;
    
    if (player.position.x < margin) {
      player.position.x = margin;
      player.velocity.x = Math.abs(player.velocity.x) * 0.5;
    } else if (player.position.x > this.worldWidth - margin) {
      player.position.x = this.worldWidth - margin;
      player.velocity.x = -Math.abs(player.velocity.x) * 0.5;
    }

    if (player.position.y < margin) {
      player.position.y = margin;
      player.velocity.y = Math.abs(player.velocity.y) * 0.5;
    } else if (player.position.y > this.worldHeight - margin) {
      player.position.y = this.worldHeight - margin;
      player.velocity.y = -Math.abs(player.velocity.y) * 0.5;
    }

    // Update rotation based on mouse position
    if (input.mousePos) {
      const dx = input.mousePos.x - player.position.x;
      const dy = input.mousePos.y - player.position.y;
      player.rotation = Math.atan2(dy, dx);
    }

    // Update last update time
    player.lastUpdate = Date.now();
  }
}

module.exports = MovementSystem;
