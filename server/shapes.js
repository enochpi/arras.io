/**
 * Shape System for Arras.io Game
 * Handles enemy shapes with different types, health, and XP rewards
 */

class Shape {
  constructor(id, type, x, y) {
    this.id = id;
    this.type = type;
    this.position = { x, y };
    this.health = this.getMaxHealth();
    this.maxHealth = this.getMaxHealth();
    this.size = this.getSize();
    this.xpReward = this.getXPReward();
    this.color = this.getColor();
    this.createdAt = Date.now();
    
    // Movement properties (shapes can drift slowly)
    this.velocity = {
      x: (Math.random() - 0.5) * 10, // Very slow drift
      y: (Math.random() - 0.5) * 10
    };
  }

  /**
   * Get health based on shape type
   */
  getMaxHealth() {
    switch(this.type) {
      case 'triangle': return 1;
      case 'square': return 2;
      case 'pentagon': return 5;
      case 'hexagon': return 10;
      default: return 1;
    }
  }

  /**
   * Get size based on shape type
   */
  getSize() {
    switch(this.type) {
      case 'triangle': return 15;
      case 'square': return 20;
      case 'pentagon': return 25;
      case 'hexagon': return 30;
      default: return 15;
    }
  }

  /**
   * Get XP reward for destroying this shape
   */
  getXPReward() {
    switch(this.type) {
      case 'triangle': return 10;
      case 'square': return 25;
      case 'pentagon': return 75;
      case 'hexagon': return 150;
      default: return 10;
    }
  }

  /**
   * Get color based on shape type
   */
  getColor() {
    switch(this.type) {
      case 'triangle': return '#FFE135'; // Yellow
      case 'square': return '#FC7677'; // Red
      case 'pentagon': return '#00B2E1'; // Blue
      case 'hexagon': return '#00E06B'; // Green
      default: return '#FFE135';
    }
  }

  /**
   * Update shape position (slow drift)
   */
  update(deltaTime, worldWidth, worldHeight) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Bounce off world boundaries
    if (this.position.x <= this.size || this.position.x >= worldWidth - this.size) {
      this.velocity.x *= -1;
      this.position.x = Math.max(this.size, Math.min(worldWidth - this.size, this.position.x));
    }
    
    if (this.position.y <= this.size || this.position.y >= worldHeight - this.size) {
      this.velocity.y *= -1;
      this.position.y = Math.max(this.size, Math.min(worldHeight - this.size, this.position.y));
    }
  }

  /**
   * Take damage and return true if destroyed
   */
  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }

  /**
   * Get client data for rendering
   */
  getClientData() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      health: this.health,
      maxHealth: this.maxHealth,
      size: this.size,
      color: this.color
    };
  }
}

class ShapeSystem {
  constructor(worldWidth, worldHeight) {
    this.shapes = new Map();
    this.nextId = 1;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.maxShapes = 50; // Maximum shapes on map
    this.spawnRate = 0.5; // Shapes per second
    this.lastSpawn = Date.now();
    
    // Shape spawn probabilities
    this.spawnWeights = {
      triangle: 0.5,   // 50% chance
      square: 0.3,     // 30% chance
      pentagon: 0.15,  // 15% chance
      hexagon: 0.05    // 5% chance
    };
    
    this.initializeShapes();
  }

  /**
   * Initialize starting shapes on the map
   */
  initializeShapes() {
    const initialShapes = 20;
    for (let i = 0; i < initialShapes; i++) {
      this.spawnRandomShape();
    }
  }

  /**
   * Spawn a random shape at a random location
   */
  spawnRandomShape() {
    if (this.shapes.size >= this.maxShapes) return null;
    
    const type = this.getRandomShapeType();
    const margin = 100;
    const x = margin + Math.random() * (this.worldWidth - 2 * margin);
    const y = margin + Math.random() * (this.worldHeight - 2 * margin);
    
    const shape = new Shape(this.nextId++, type, x, y);
    this.shapes.set(shape.id, shape);
    
    return shape;
  }

  /**
   * Get random shape type based on spawn weights
   */
  getRandomShapeType() {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [type, weight] of Object.entries(this.spawnWeights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        return type;
      }
    }
    
    return 'triangle'; // Fallback
  }

  /**
   * Update all shapes
   */
  update(deltaTime) {
    // Update existing shapes
    for (const [id, shape] of this.shapes) {
      shape.update(deltaTime, this.worldWidth, this.worldHeight);
    }
    
    // Spawn new shapes periodically
    const now = Date.now();
    if (now - this.lastSpawn >= (1000 / this.spawnRate)) {
      this.spawnRandomShape();
      this.lastSpawn = now;
    }
  }

  /**
   * Remove shape by ID
   */
  removeShape(shapeId) {
    return this.shapes.delete(shapeId);
  }

  /**
   * Get shape by ID
   */
  getShape(shapeId) {
    return this.shapes.get(shapeId);
  }

  /**
   * Get all shapes for client
   */
  getAllShapes() {
    const result = {};
    for (const [id, shape] of this.shapes) {
      result[id] = shape.getClientData();
    }
    return result;
  }

  /**
   * Get shapes count by type (for debugging)
   */
  getShapeStats() {
    const stats = { triangle: 0, square: 0, pentagon: 0, hexagon: 0, total: 0 };
    
    for (const shape of this.shapes.values()) {
      stats[shape.type]++;
      stats.total++;
    }
    
    return stats;
  }
}

module.exports = { Shape, ShapeSystem };
