/**
 * Movement Module
 * Handles player input processing and position updates
 */

class MovementSystem {
  constructor(worldWidth = 4000, worldHeight = 4000) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.moveSpeed = 200; // pixels per second
  }

  /**
   * Process player input and update position
   * @param {Player} player - Player object to update
   * @param {Object} input - Input data from client
   * @param {number} deltaTime - Time since last update (ms)
   */
  updatePlayerPosition(player, input, deltaTime) {
    if (!input || !input.movement) return;

    const { x: moveX, y: moveY } = input.movement;
    const deltaSeconds = deltaTime / 1000;
    
    // Calculate movement distance
    const moveDistance = this.moveSpeed * deltaSeconds;
    
    // Apply movement with normalization for diagonal movement
    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
    if (magnitude > 0) {
      const normalizedX = moveX / magnitude;
      const normalizedY = moveY / magnitude;
      
      // Update position
      player.position.x += normalizedX * moveDistance;
      player.position.y += normalizedY * moveDistance;
      
      // Apply world boundaries
      this.applyBoundaries(player);
    }
  }

  /**
   * Keep player within world boundaries
   * @param {Player} player - Player to constrain
   */
  applyBoundaries(player) {
    const margin = 25; // Tank size margin
    
    player.position.x = Math.max(margin, 
      Math.min(this.worldWidth - margin, player.position.x)
    );
    player.position.y = Math.max(margin, 
      Math.min(this.worldHeight - margin, player.position.y)
    );
  }

  /**
   * Update player rotation based on mouse position
   * @param {Player} player - Player to rotate
   * @param {Object} mousePos - Mouse position from client
   */
  updatePlayerRotation(player, mousePos) {
    if (!mousePos) return;
    
    // Calculate angle from player to mouse cursor
    const angle = Math.atan2(
      mousePos.y - 400, // Assuming 800x800 viewport center
      mousePos.x - 400
    );
    
    player.rotation = angle;
  }

  /**
   * Process all movement input for a player
   * @param {Player} player - Player to update
   * @param {Object} input - Complete input data
   * @param {number} deltaTime - Time delta
   */
  processInput(player, input, deltaTime) {
    this.updatePlayerPosition(player, input, deltaTime);
    this.updatePlayerRotation(player, input.mousePosition);
    
    // Update last movement time
    player.lastUpdate = Date.now();
  }
}

module.exports = MovementSystem;
