/**
 * Player Management Module
 * Handles player creation, updates, and game state management
 */

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name || `Player_${id.substring(0, 6)}`;
    
    // Position and movement
    this.position = {
      x: Math.random() * 4000, // Random spawn in 4000x4000 world
      y: Math.random() * 4000
    };
    this.rotation = 0; // Tank facing direction
    this.velocity = { x: 0, y: 0 };
    
    // Tank stats
    this.health = 100;
    this.maxHealth = 100;
    this.shield = 50;
    this.maxShield = 50;
    this.energy = 100;
    this.maxEnergy = 100;
    
    // Game progression
    this.score = 0;
    this.level = 1;
    this.tankClass = 'basic';
    this.color = this.getRandomColor();
    
    // Combat stats
    this.stats = {
      healthRegen: 1,
      maxHealth: 100,
      bodyDamage: 10,
      bulletSpeed: 8,
      bulletPenetration: 1,
      bulletDamage: 20,
      reload: 1, // Shots per second
      movement: 3 // Movement speed multiplier
    };
    
    // Timing
    this.lastShot = 0;
    this.lastUpdate = Date.now();
    this.upgradePoints = 0;
  }

  /**
   * Get random tank color
   */
  getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Update player position based on input
   */
  updatePosition(input, deltaTime) {
    if (!input.movement) return;

    const speed = this.stats.movement;
    const moveX = input.movement.x * speed * deltaTime;
    const moveY = input.movement.y * speed * deltaTime;

    // Update position with bounds checking
    this.position.x = Math.max(0, Math.min(4000, this.position.x + moveX));
    this.position.y = Math.max(0, Math.min(4000, this.position.y + moveY));
  }

  /**
   * Update tank rotation based on mouse position
   */
  updateRotation(mousePosition) {
    if (!mousePosition) return;
    
    // Calculate angle from tank to mouse (relative to screen center)
    const angle = Math.atan2(
      mousePosition.y - 400, // Assuming 800x800 viewport
      mousePosition.x - 400
    );
    this.rotation = angle;
  }

  /**
   * Check if player can shoot based on reload time
   */
  canShoot() {
    const reloadTime = 1000 / this.stats.reload; // Convert to milliseconds
    return Date.now() - this.lastShot >= reloadTime;
  }

  /**
   * Record shot time
   */
  recordShot() {
    this.lastShot = Date.now();
  }

  /**
   * Regenerate health and shield over time
   */
  regenerate(deltaTime) {
    const regenRate = this.stats.healthRegen * deltaTime / 1000;
    
    // Health regeneration (slower)
    if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + regenRate * 0.5);
    }
    
    // Shield regeneration (faster)
    if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + regenRate);
    }
  }

  /**
   * Take damage, shield absorbs first
   */
  takeDamage(damage) {
    if (this.shield > 0) {
      const shieldDamage = Math.min(this.shield, damage);
      this.shield -= shieldDamage;
      damage -= shieldDamage;
    }
    
    if (damage > 0) {
      this.health -= damage;
    }
    
    return this.health <= 0; // Return true if player died
  }

  /**
   * Add score and check for level up
   */
  addScore(points) {
    this.score += points;
    const newLevel = Math.floor(this.score / 1000) + 1;
    
    if (newLevel > this.level) {
      this.level = newLevel;
      this.upgradePoints += 1;
      return true; // Level up occurred
    }
    return false;
  }

  /**
   * Get player data for client
   */
  getClientData() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      rotation: this.rotation,
      health: this.health,
      maxHealth: this.maxHealth,
      shield: this.shield,
      maxShield: this.maxShield,
      score: this.score,
      level: this.level,
      color: this.color,
      tankClass: this.tankClass
    };
  }
}

module.exports = Player;
