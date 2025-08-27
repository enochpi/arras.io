/**
 * Movement System
 * Handles WASD/Arrow key input and player position updates
 */

class MovementSystem {
  constructor(worldWidth = 4000, worldHeight = 4000) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.baseSpeed = 250; // Base movement speed (pixels/second)
  }

  /**
   * Process keyboard input and update player position
   * @param {Player} player - Player object to update
   * @param {Object} keys - Key states from client
   * @param {number} deltaTime - Time since last update (seconds)
   */
  updatePosition(player, keys, deltaTime) {
    if (!keys) return;

    let moveX = 0;
    let moveY = 0;

    // WASD and Arrow key movement
    if (keys.w || keys.W || keys.ArrowUp) moveY = -1;
    if (keys.s || keys.S || keys.ArrowDown) moveY = 1;
    if (keys.a || keys.A || keys.ArrowLeft) moveX = -1;
    if (keys.d || keys.D || keys.ArrowRight) moveX = 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/√2
      moveY *= 0.707;
    }

    // Calculate movement speed - use base speed if no stats
    const movementMultiplier = player.stats ? player.stats.movement || 1 : 1;
    const speed = this.baseSpeed * movementMultiplier;
    
    // Initialize velocity if it doesn't exist
    if (!player.velocity) {
      player.velocity = { x: 0, y: 0 };
    }

    // Update velocity
    player.velocity.x = moveX * speed;
    player.velocity.y = moveY * speed;

    // Initialize position if it doesn't exist
    if (!player.position) {
      player.position = { x: player.x || 0, y: player.y || 0 };
    }

    // Update position
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;

    // Also update legacy x/y properties for compatibility
    player.x = player.position.x;
    player.y = player.position.y;

    // Apply world boundaries
    this.constrainToBounds(player);
  }

  /**
   * Keep player within world boundaries
   * @param {Player} player - Player to constrain
   */
  constrainToBounds(player) {
    const radius = 25; // Player tank radius
    
    player.position.x = Math.max(radius, 
      Math.min(this.worldWidth - radius, player.position.x)
    );
    player.position.y = Math.max(radius, 
      Math.min(this.worldHeight - radius, player.position.y)
    );

    // Update legacy properties
    player.x = player.position.x;
    player.y = player.position.y;
  }

  /**
   * Update player rotation based on mouse position
   * @param {Player} player - Player to rotate
   * @param {Object} mousePos - Mouse position {x, y}
   */
  updateRotation(player, mousePos) {
    if (!mousePos || typeof mousePos.x !== 'number' || typeof mousePos.y !== 'number') return;
    
    // Calculate angle from player center to mouse
    const dx = mousePos.x - 400; // Screen center offset
    const dy = mousePos.y - 400;
    player.rotation = Math.atan2(dy, dx);
  }

  /**
   * Process all movement input for a player
   * @param {Player} player - Player to update
   * @param {Object} input - Input data {keys, mousePos}
   * @param {number} deltaTime - Time delta in seconds
   */
  processMovement(player, input, deltaTime) {
    if (!player || !input) return;
    
    this.updatePosition(player, input.keys, deltaTime);
    this.updateRotation(player, input.mousePos);
    player.lastUpdate = Date.now();
  }
}

module.exports = MovementSystem;
