/**
 * Player Class - Handles individual player state and logic
 * Keeps track of position, health, score, and basic stats
 */

class Player {
  constructor(id, name = null) {
    // Basic player info
    this.id = id;
    this.name = name || `Player_${id.substring(0, 6)}`;
    
    // Position in game world (spawn randomly)
    this.x = Math.random() * 2000; // 2000x2000 world for now
    this.y = Math.random() * 2000;
    this.rotation = 0; // Tank facing direction
    
    // Player stats
    this.health = 100;
    this.maxHealth = 100;
    this.score = 0;
    this.level = 1;
    
    // Visual properties
    this.color = this.getRandomColor();
    this.size = 20; // Tank size
    
    // Timing
    this.lastUpdate = Date.now();
    this.joinedAt = Date.now();
  }

  /**
   * Get a random color for the player's tank
   */
  getRandomColor() {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal  
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEAA7', // Yellow
      '#DDA0DD'  // Purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Update player position (will be expanded in Step 2)
   */
  updatePosition(deltaX, deltaY) {
    // Basic bounds checking - keep player in world
    this.x = Math.max(0, Math.min(2000, this.x + deltaX));
    this.y = Math.max(0, Math.min(2000, this.y + deltaY));
    this.lastUpdate = Date.now();
  }

  /**
   * Update tank rotation based on target angle
   */
  updateRotation(targetAngle) {
    this.rotation = targetAngle;
  }

  /**
   * Add points to player score and check for level up
   */
  addScore(points) {
    this.score += points;
    const newLevel = Math.floor(this.score / 100) + 1; // Level up every 100 points
    
    if (newLevel > this.level) {
      this.level = newLevel;
      this.maxHealth += 10; // Increase max health on level up
      this.health = this.maxHealth; // Full heal on level up
      return true; // Indicate level up occurred
    }
    return false;
  }

  /**
   * Take damage and return true if player died
   */
  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }

  /**
   * Get player data to send to clients
   */
  getClientData() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      health: this.health,
      maxHealth: this.maxHealth,
      score: this.score,
      level: this.level,
      color: this.color,
      size: this.size
    };
  }

  /**
   * Get time since player joined (in seconds)
   */
  getPlayTime() {
    return Math.floor((Date.now() - this.joinedAt) / 1000);
  }
}

module.exports = Player;
