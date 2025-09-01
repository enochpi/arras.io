/**
 * Enhanced Player class with auto-shoot support
 */

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
    this.score = 0;
    this.speed = 200;
    this.shootCooldown = 0;
    this.lastUpdate = Date.now();
    this.lastAutoShot = 0;
    this.regenTimer = 0;
    this.damageMultiplier = 1;
  }

  takeDamage(damage) {
    this.health -= damage;
    this.regenTimer = 0; // Reset regeneration timer when damaged
    
    if (this.health <= 0) {
      this.health = 0;
      return true; // Player is dead
    }
    return false;
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  regenerate(deltaTime) {
    // Start regenerating after 3 seconds of not taking damage
    this.regenTimer += deltaTime;
    
    if (this.regenTimer >= 3000 && this.health < this.maxHealth) {
      // Regenerate 2 health per second
      this.heal(2 * (deltaTime / 1000));
    }
    
    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }
  }

  addXP(amount) {
    this.xp += amount;
    this.score += Math.floor(amount * 0.5);
    
    // Level up logic
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xpToNext = this.level * 100;
    
    // Increase stats on level up
    this.maxHealth += 10;
    this.health = this.maxHealth; // Full heal on level up
    this.speed += 5;
    this.damageMultiplier += 0.1;
    
    console.log(`${this.name} leveled up to ${this.level}!`);
  }

  canShoot() {
    return this.shootCooldown <= 0;
  }

  recordShot() {
    this.shootCooldown = 100; // 100ms cooldown between shots
  }

  getClientData() {
    return {
      id: this.id,
      name: this.name,
      position: { ...this.position },
      rotation: this.rotation,
      health: Math.round(this.health),
      maxHealth: this.maxHealth,
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext,
      score: this.score,
      velocity: { ...this.velocity }
    };
  }

  respawn(worldWidth, worldHeight) {
    // Reset player stats
    this.health = this.maxHealth;
    this.position.x = Math.random() * (worldWidth - 1000) + 500;
    this.position.y = Math.random() * (worldHeight - 1000) + 500;
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.shootCooldown = 0;
    this.regenTimer = 0;
    
    // Lose some XP on death
    this.xp = Math.floor(this.xp * 0.7);
    this.score = Math.floor(this.score * 0.9);
  }
}

module.exports = Player;
