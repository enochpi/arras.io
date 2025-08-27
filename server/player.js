/**
 * Enhanced Player Class
 * Handles player state, stats, and game mechanics
 */

class Player {
  constructor(id, name = null) {
    // Basic player info
    this.id = id;
    this.name = name || `Player_${id.substring(0, 6)}`;
    
    // Position in game world (spawn randomly)
    this.position = {
      x: Math.random() * 3000 + 500, // Spawn away from edges
      y: Math.random() * 3000 + 500
    };
    
    // Legacy position properties for compatibility
    this.x = this.position.x;
    this.y = this.position.y;
    
    // Movement properties
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0; // Tank facing direction
    
    // Player stats
    this.health = 100;
    this.maxHealth = 100;
    this.score = 0;
    this.level = 1;
    
    // Game stats that affect gameplay
    this.stats = {
      movement: 1.0,      // Movement speed multiplier
      bulletSpeed: 5,     // Bullet speed
      bulletDamage: 25,   // Damage per bullet
      reload: 1.0,        // Reload speed multiplier
      maxHealth: 100      // Maximum health
    };
    
    // Visual properties
    this.color = this.getRandomColor();
    this.size = 25; // Tank radius
    
    // Timing and shooting
    this.lastUpdate = Date.now();
    this.lastShot = 0;
    this.joinedAt = Date.now();
    
    // Health regeneration
    this.lastRegen = Date.now();
    this.regenRate = 2; // HP per second when not taking damage
    this.regenDelay = 3000; // 3 seconds after taking damage
    this.lastDamageTime = 0;
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
   * Check if player can shoot based on reload time
   * @returns {boolean} True if can shoot
   */
  canShoot() {
    const reloadTime = 300 / this.stats.reload; // Base 300ms, affected by reload stat
    return Date.now() - this.lastShot >= reloadTime;
  }

  /**
   * Record that player shot (for reload timing)
   */
  recordShot() {
    this.lastShot = Date.now();
  }

  /**
   * Update player position (legacy method for compatibility)
   */
  updatePosition(deltaX, deltaY) {
    this.position.x = Math.max(25, Math.min(3975, this.position.x + deltaX));
    this.position.y = Math.max(25, Math.min(3975, this.position.y + deltaY));
    this.x = this.position.x;
    this.y = this.position.y;
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
   * @param {number} points - Points to add
   * @returns {boolean} True if leveled up
   */
  addScore(points) {
    this.score += points;
    const newLevel = Math.floor(this.score / 500) + 1; // Level up every 500 points
    
    if (newLevel > this.level) {
      this.level = newLevel;
      
      // Increase stats on level up
      this.stats.maxHealth += 10;
      this.maxHealth = this.stats.maxHealth;
      this.health = this.maxHealth; // Full heal on level up
      this.stats.bulletDamage += 2;
      this.stats.movement += 0.05;
      
      return true; // Indicate level up occurred
    }
    return false;
  }

  /**
   * Take damage and return true if player died
   * @param {number} damage - Damage amount
   * @returns {boolean} True if player died
   */
  takeDamage(damage) {
    this.health -= damage;
    this.lastDamageTime = Date.now();
    
    if (this.health <= 0) {
      this.health = 0;
      return true; // Player died
    }
    return false;
  }

  /**
   * Handle health regeneration
   * @param {number} deltaTime - Time since last update (ms)
   */
  regenerate(deltaTime) {
    const now = Date.now();
    
    // Only regenerate if enough time has passed since last damage
    if (now - this.lastDamageTime >= this.regenDelay && this.health < this.maxHealth) {
      const regenAmount = (this.regenRate * deltaTime) / 1000;
      this.health = Math.min(this.maxHealth, this.health + regenAmount);
    }
  }

  /**
   * Get player data to send to clients
   */
  getClientData() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      x: this.position.x, // Legacy compatibility
      y: this.position.y, // Legacy compatibility
      rotation: this.rotation,
      health: Math.round(this.health),
      maxHealth: this.maxHealth,
      score: this.score,
      level: this.level,
      color: this.color,
      size: this.size,
      stats: this.stats
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
