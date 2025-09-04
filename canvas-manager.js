/**
 * Canvas Manager
 * Handles canvas setup with cross-browser compatibility
 * Fixes canvas context issues with proper fallbacks
 */

class CanvasManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.supportedFeatures = {};
  }

  /**
   * Initialize the main game canvas with proper feature detection
   */
  initCanvas(canvasId = 'gameCanvas') {
    console.log('🎨 Initializing Canvas Manager...');
    
    // Get canvas element
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`❌ Canvas element '${canvasId}' not found!`);
      return false;
    }
    
    // Set initial size
    this.resizeCanvas();
    
    // Try to get context with optimal settings, but fallback if needed
    this.ctx = this.getOptimalContext();
    
    if (!this.ctx) {
      console.error('❌ Failed to get canvas context!');
      return false;
    }
    
    // Detect supported features
    this.detectFeatures();
    
    // Setup resize handler
    this.setupResizeHandler();
    
    // Setup pixel ratio handling for sharp rendering
    this.setupPixelRatio();
    
    // Initialize offscreen canvas if supported
    this.initOffscreenCanvas();
    
    console.log('✅ Canvas initialized successfully!');
    console.log('📊 Supported features:', this.supportedFeatures);
    
    return true;
  }

  /**
   * Get optimal 2D context with fallbacks
   */
  getOptimalContext() {
    const contexts = [
      // Best performance options (might not be supported everywhere)
      {
        name: 'optimal',
        options: {
          alpha: false,
          desynchronized: true,
          willReadFrequently: false
        }
      },
      // Good performance (widely supported)
      {
        name: 'performance',
        options: {
          alpha: false,
          willReadFrequently: false
        }
      },
      // Basic with transparency disabled
      {
        name: 'basic-no-alpha',
        options: {
          alpha: false
        }
      },
      // Fallback to default
      {
        name: 'default',
        options: {}
      }
    ];
    
    // Try each context configuration
    for (const config of contexts) {
      try {
        const ctx = this.canvas.getContext('2d', config.options);
        if (ctx) {
          console.log(`✅ Using '${config.name}' canvas context`);
          this.supportedFeatures.contextType = config.name;
          return ctx;
        }
      } catch (e) {
        console.warn(`⚠️ Context '${config.name}' not supported:`, e.message);
      }
    }
    
    // Last resort - basic context with no options
    try {
      const ctx = this.canvas.getContext('2d');
      console.log('⚠️ Using fallback canvas context');
      this.supportedFeatures.contextType = 'fallback';
      return ctx;
    } catch (e) {
      console.error('❌ Cannot get any 2D context:', e);
      return null;
    }
  }

  /**
   * Detect browser canvas features
   */
  detectFeatures() {
    // Check for imageSmoothingEnabled
    this.supportedFeatures.imageSmoothing = 'imageSmoothingEnabled' in this.ctx;
    
    // Check for filter support
    this.supportedFeatures.filters = 'filter' in this.ctx;
    
    // Check for globalCompositeOperation
    this.supportedFeatures.compositing = 'globalCompositeOperation' in this.ctx;
    
    // Check for shadow support
    this.supportedFeatures.shadows = 'shadowBlur' in this.ctx;
    
    // Check for offscreen canvas
    this.supportedFeatures.offscreenCanvas = typeof OffscreenCanvas !== 'undefined';
    
    // Check for WebGL (for future use)
    const testCanvas = document.createElement('canvas');
    this.supportedFeatures.webgl = !!(
      testCanvas.getContext('webgl') || 
      testCanvas.getContext('experimental-webgl')
    );
    
    // Check for requestAnimationFrame
    this.supportedFeatures.raf = typeof requestAnimationFrame !== 'undefined';
    
    // Check performance API
    this.supportedFeatures.performanceAPI = typeof performance !== 'undefined' && 
                                            typeof performance.now !== 'undefined';
  }

  /**
   * Setup canvas resizing
   */
  resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Store old dimensions
    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;
    
    // Set new dimensions
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Return whether size changed
    return oldWidth !== width || oldHeight !== height;
  }

  /**
   * Setup resize handler with debouncing
   */
  setupResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      // Clear previous timeout
      clearTimeout(resizeTimeout);
      
      // Debounce resize to avoid too many redraws
      resizeTimeout = setTimeout(() => {
        if (this.resizeCanvas()) {
          console.log('📐 Canvas resized:', this.canvas.width, 'x', this.canvas.height);
          
          // Re-apply pixel ratio
          this.setupPixelRatio();
          
          // Dispatch custom event for game to handle
          window.dispatchEvent(new CustomEvent('canvasResized', {
            detail: {
              width: this.canvas.width,
              height: this.canvas.height
            }
          }));
        }
      }, 100);
    });
  }

  /**
   * Setup pixel ratio for sharp rendering on high-DPI displays
   */
  setupPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    
    // Only apply if not already applied and DPR > 1
    if (dpr > 1 && GAME_CONFIG?.PERFORMANCE?.ENABLE_ANTIALIAS !== false) {
      const rect = this.canvas.getBoundingClientRect();
      
      // Set actual canvas size
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      
      // Scale canvas back down using CSS
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      
      // Scale context to match device pixel ratio
      this.ctx.scale(dpr, dpr);
      
      console.log(`📱 Applied device pixel ratio: ${dpr}`);
      this.supportedFeatures.pixelRatio = dpr;
    } else {
      this.supportedFeatures.pixelRatio = 1;
    }
  }

  /**
   * Initialize offscreen canvas for double buffering (if supported)
   */
  initOffscreenCanvas() {
    if (!this.supportedFeatures.offscreenCanvas) {
      console.log('ℹ️ OffscreenCanvas not supported');
      return;
    }
    
    try {
      this.offscreenCanvas = new OffscreenCanvas(
        this.canvas.width, 
        this.canvas.height
      );
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      
      console.log('✅ OffscreenCanvas initialized for double buffering');
      this.supportedFeatures.doubleBuffering = true;
    } catch (e) {
      console.warn('⚠️ Could not create OffscreenCanvas:', e);
      this.supportedFeatures.doubleBuffering = false;
    }
  }

  /**
   * Apply rendering optimizations based on browser capabilities
   */
  applyOptimizations() {
    if (!this.ctx) return;
    
    // Disable image smoothing for pixel art style (if desired)
    if (this.supportedFeatures.imageSmoothing) {
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.mozImageSmoothingEnabled = false;
      this.ctx.webkitImageSmoothingEnabled = false;
      this.ctx.msImageSmoothingEnabled = false;
    }
    
    // Set line cap and join for better performance
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Set default composite operation
    if (this.supportedFeatures.compositing) {
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }

  /**
   * Clear the canvas efficiently
   */
  clear() {
    if (!this.ctx) return;
    
    // Most efficient clear method
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Clear and fill with background color
   */
  clearWithBackground(color = '#1a1a2e') {
    if (!this.ctx) return;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Get canvas center point
   */
  getCenter() {
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
  }

  /**
   * Convert screen coordinates to canvas coordinates
   * Handles pixel ratio and scaling
   */
  screenToCanvas(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    return {
      x: (screenX - rect.left) * scaleX,
      y: (screenY - rect.top) * scaleY
    };
  }

  /**
   * Save canvas state
   */
  save() {
    if (this.ctx) this.ctx.save();
  }

  /**
   * Restore canvas state
   */
  restore() {
    if (this.ctx) this.ctx.restore();
  }

  /**
   * Create a gradient
   */
  createRadialGradient(x, y, r1, r2, colors) {
    if (!this.ctx) return null;
    
    const gradient = this.ctx.createRadialGradient(x, y, r1, x, y, r2);
    
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    
    return gradient;
  }

  /**
   * Create linear gradient
   */
  createLinearGradient(x1, y1, x2, y2, colors) {
    if (!this.ctx) return null;
    
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    
    return gradient;
  }

  /**
   * Check if a point is visible on screen (for culling)
   */
  isVisible(x, y, margin = 100) {
    return x >= -margin && 
           x <= this.canvas.width + margin &&
           y >= -margin && 
           y <= this.canvas.height + margin;
  }

  /**
   * Get performance stats
   */
  getStats() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
      pixelRatio: this.supportedFeatures.pixelRatio || 1,
      features: this.supportedFeatures
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.CanvasManager = CanvasManager;
  
  // Create and initialize default instance
  window.addEventListener('DOMContentLoaded', () => {
    window.canvasManager = new CanvasManager();
    
    // Only initialize if we're in single-player mode
    if (typeof GAME_CONFIG !== 'undefined' && GAME_CONFIG.MODE === 'single-player') {
      window.canvasManager.initCanvas();
    }
  });
}