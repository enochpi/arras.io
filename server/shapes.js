/**
 * Enhanced Shape System with better distribution
 */

class Shape {
  constructor(id, type, position, size) {
    this.id = id;
    this.type = type;
    this.position = { ...position };
    this.size = size;
    this.health = this.getMaxHealth();
    this.maxHealth = this.health;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }

  getMaxHealth() {
    switch(this.type) {
      case 'triangle': return 30;
      case 'square': return 50;
      case 'pentagon': return 100;
      case 'hexagon': return 150;
      default: return 50;
    }
  }

  update(deltaTime) {
    // Slowly rotate shape
    this.rotation += this.rotationSpeed;
  }

  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }

  getClientData() {
    return {
      id: this.id,
      type: this.type,
      position: { ...this.position },
      size: this.size,
      health: this.health,
      maxHealth: this.maxHealth,
      rotation: this.rotation,
      color: this.getColor()
    };
  }

  getColor() {
    switch(this.type) {
      case 'triangle': return '#FF6B6B';
      case 'square': return '#FFE66D';
      case 'pentagon': return '#4ECDC4';
      case 'hexagon': return '#A8E6CF';
      default: return '#888888';
    }
  }
}

class ShapeSystem {
  constructor(worldWidth, worldHeight) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.shapes = new Map();
    this.nextShapeId = 1;
    this.maxShapes = 150; // Increased for larger world
    this.spawnTimer = 0;
    this.spawnInterval = 1000; // Spawn every second
    
    // Shape distribution weights
    this.shapeWeights = {
      triangle: 40,
      square: 30,
      pentagon: 20,
      hexagon: 10
    };
    
    // Initial spawn
    this.spawnInitialShapes();
  }

  spawnInitialShapes() {
    const initialCount = Math.floor(this.maxShapes * 0.7);
    
    for (let i = 0; i < initialCount; i++) {
      this.spawnShape();
    }
  }

  spawnShape() {
    if (this.shapes.size >= this.maxShapes) return;

    const type = this.getRandomShapeType();
    const size = this.getShapeSize(type);
    
    // Find a valid spawn position
    let position;
    let attempts = 0;
    const maxAttempts = 50;
    
    do {
      position = {
        x: Math.random() * (this.worldWidth - 200) + 100,
        y: Math.random() * (this.worldHeight - 200) + 100
      };
      attempts++;
    } while (this.isPositionOccupied(position, size * 2) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) return; // Could not find valid position
    
    const shape = new Shape(
      `shape_${this.nextShapeId++}`,
      type,
      position,
      size
    );
    
    this.shapes.set(shape.id, shape);
  }

  isPositionOccupied(position, minDistance) {
    for (const shape of this.shapes.values()) {
      const dx = shape.position.x - position.x;
      const dy = shape.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance + shape.size) {
        return true;
      }
    }
    return false;
  }

  getRandomShapeType() {
    const totalWeight = Object.values(this.shapeWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(this.shapeWeights)) {
      random -= weight;
      if (random <= 0) return type;
    }
    
    return 'square'; // Fallback
  }

  getShapeSize(type) {
    switch(type) {
      case 'triangle': return 20;
      case 'square': return 25;
      case 'pentagon': return 30;
      case 'hexagon': return 35;
      default: return 25;
    }
  }

  getShapeXPReward(type) {
    switch(type) {
      case 'triangle': return 10;
      case 'square': return 25;
      case 'pentagon': return 50;
      case 'hexagon': return 100;
      default: return 10;
    }
  }

  update(deltaTime) {
    // Update all shapes
    this.shapes.forEach(shape => {
      shape.update(deltaTime);
    });
    
    // Spawn new shapes periodically
    this.spawnTimer += deltaTime * 1000;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      
      // Spawn multiple shapes if we're below the target
      const deficit = this.maxShapes - this.shapes.size;
      const toSpawn = Math.min(3, Math.ceil(deficit * 0.1));
      
      for (let i = 0; i < toSpawn; i++) {
        this.spawnShape();
      }
    }
  }

  damageShape(shapeId, damage) {
    const shape = this.shapes.get(shapeId);
    if (!shape) return false;
    
    const destroyed = shape.takeDamage(damage);
    if (destroyed) {
      this.shapes.delete(shapeId);
    }
    
    return destroyed;
  }

  getAllShapes() {
    const shapesData = {};
    this.shapes.forEach((shape, id) => {
      shapesData[id] = shape.getClientData();
    });
    return shapesData;
  }

  getShapeStats() {
    const stats = {
      triangle: 0,
      square: 0,
      pentagon: 0,
      hexagon: 0
    };
    
    this.shapes.forEach(shape => {
      if (stats[shape.type] !== undefined) {
        stats[shape.type]++;
      }
    });
    
    return stats;
  }
}

module.exports = { ShapeSystem, Shape };
