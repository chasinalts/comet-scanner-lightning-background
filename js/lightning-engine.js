/**
 * COMET Scanner - Interactive Lightning Background Engine
 * Creates dynamic cursor-responsive lightning effects with space-themed colors
 */

class LightningEngine {
    constructor(options = {}) {
        // Core properties
        this.canvas = null;
        this.context = null;
        this.isWebGL = false;
        this.isRunning = false;
        this.animationId = null;
        
        // Settings with space theme defaults
        this.settings = {
            maxEffects: 15,
            fadeRate: 0.95,
            intensityMultiplier: 1.0,
            colorPalette: 'space-theme',
            performanceMode: 'auto', // 'low', 'medium', 'high', 'auto'
            enableAccessibility: true,
            ...options
        };
        
        // Effect arrays
        this.effects = [];
        this.particles = [];
        
        // Cursor tracking
        this.cursorTracker = null;
        this.lastCursorData = null;
        
        // Particle system
        this.particleSystem = null;
        
        // Performance monitoring
        this.performance = {
            fps: 60,
            frameTime: 16.67,
            lastFrameTime: 0,
            frameCount: 0,
            qualityLevel: 'high'
        };
        
        // Accessibility
        this.motionReduced = false;
        this.isDisabled = false;
        
        console.log('⚡ Lightning Engine initialized');
    }

    /**
     * Initialize the lightning engine
     */
    async initialize(containerElement = document.body) {
        try {
            console.log('⚡ Initializing Lightning Engine...');
            
            // Check for reduced motion preference
            this.checkAccessibilityPreferences();
            
            if (this.isDisabled) {
                console.log('⚡ Lightning Engine disabled due to accessibility preferences');
                return false;
            }
            
            // Create canvas element
            this.createCanvas(containerElement);
            
            // Initialize rendering context
            this.initializeContext();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize performance monitoring
            this.initializePerformanceMonitoring();
            
            // Initialize cursor tracking
            this.initializeCursorTracking();
            
            // Initialize particle system
            this.initializeParticleSystem();
            
            console.log('✅ Lightning Engine initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Lightning Engine:', error);
            return false;
        }
    }

    /**
     * Create canvas element and add to DOM
     */
    createCanvas(container) {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'lightning-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
        `;
        
        // Set canvas size
        this.resizeCanvas();
        
        // Add to container
        container.appendChild(this.canvas);
        
        console.log('⚡ Lightning canvas created and added to DOM');
    }

    /**
     * Initialize rendering context (Canvas 2D for now, WebGL later)
     */
    initializeContext() {
        try {
            // Try to get 2D context first
            this.context = this.canvas.getContext('2d');
            
            if (!this.context) {
                throw new Error('Failed to get 2D rendering context');
            }
            
            // Configure context for optimal performance
            this.context.imageSmoothingEnabled = true;
            this.context.imageSmoothingQuality = 'high';
            
            console.log('⚡ Canvas 2D context initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize rendering context:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Accessibility preference changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', () => {
            this.checkAccessibilityPreferences();
        });
        
        console.log('⚡ Event listeners setup complete');
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        this.performance.lastFrameTime = performance.now();
        
        // Determine initial quality level based on device
        this.detectDeviceCapabilities();
        
        console.log(`⚡ Performance monitoring initialized - Quality: ${this.performance.qualityLevel}`);
    }

    /**
     * Initialize cursor tracking system
     */
    initializeCursorTracking() {
        try {
            // Check if CursorTracker is available
            if (typeof CursorTracker === 'undefined') {
                throw new Error('CursorTracker class not found - check script loading order');
            }
            
            // Create cursor tracker with callback
            this.cursorTracker = new CursorTracker((movementData) => {
                this.handleCursorMovement(movementData);
            });
            
            // Start tracking
            this.cursorTracker.startTracking();
            
            console.log('⚡ Cursor tracking initialized');
        } catch (error) {
            console.error('❌ Failed to initialize cursor tracking:', error);
            throw error;
        }
    }

    /**
     * Handle cursor movement data
     */
    handleCursorMovement(movementData) {
        this.lastCursorData = movementData;
        
        // For now, just log the movement data (will be used for effects later)
        if (this.performance.frameCount % 30 === 0) { // Log every 30 frames to avoid spam
            console.log('🎯 Cursor movement:', {
                speed: Math.round(movementData.speed),
                intensity: Math.round(movementData.movementIntensity * 100),
                position: {
                    x: Math.round(movementData.position.x),
                    y: Math.round(movementData.position.y)
                }
            });
        }
    }

    /**
     * Initialize particle system
     */
    initializeParticleSystem() {
        try {
            // Check if ParticleSystem is available
            if (typeof ParticleSystem === 'undefined') {
                throw new Error('ParticleSystem class not found - check script loading order');
            }
            
            // Create particle system with settings based on performance level
            const particleSettings = {
                maxParticles: this.getMaxParticlesForQuality(),
                spawnRate: 0.8,
                spawnRadius: 120,
                followCursor: true,
                connectionOpacity: 0.4,
                showConnections: true
            };
            
            this.particleSystem = new ParticleSystem(particleSettings);
            
            console.log('⚡ Particle system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize particle system:', error);
            throw error;
        }
    }

    /**
     * Get maximum particles based on quality level
     */
    getMaxParticlesForQuality() {
        switch (this.performance.qualityLevel) {
            case 'low': return 20;
            case 'medium': return 35;
            case 'high': return 50;
            default: return 35;
        }
    }

    /**
     * Detect device capabilities and set appropriate quality level
     */
    detectDeviceCapabilities() {
        // Basic device detection
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasHighDPI = window.devicePixelRatio > 1;
        const screenSize = window.innerWidth * window.innerHeight;
        
        if (isMobile || screenSize < 800 * 600) {
            this.performance.qualityLevel = 'low';
            this.settings.maxEffects = 8;
        } else if (screenSize < 1920 * 1080 || !hasHighDPI) {
            this.performance.qualityLevel = 'medium';
            this.settings.maxEffects = 12;
        } else {
            this.performance.qualityLevel = 'high';
            this.settings.maxEffects = 15;
        }
    }

    /**
     * Check accessibility preferences
     */
    checkAccessibilityPreferences() {
        if (!this.settings.enableAccessibility) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            this.motionReduced = true;
            this.isDisabled = true;
            console.log('⚡ Lightning effects disabled due to reduced motion preference');
        } else {
            this.motionReduced = false;
            this.isDisabled = false;
        }
    }

    /**
     * Resize canvas to match window size
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set actual size in memory (scaled for high DPI)
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Set display size (CSS pixels)
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Scale the drawing context so everything draws at the correct size
        if (this.context) {
            this.context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
            this.context.scale(dpr, dpr);
        }
    }

    /**
     * Start the lightning engine
     */
    start() {
        if (this.isDisabled || this.isRunning) return;
        
        console.log('⚡ Starting Lightning Engine...');
        this.isRunning = true;
        this.render();
    }

    /**
     * Stop the lightning engine
     */
    stop() {
        console.log('⚡ Stopping Lightning Engine...');
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear canvas
        this.clearCanvas();
    }

    /**
     * Pause the lightning engine
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Resume the lightning engine
     */
    resume() {
        if (this.isDisabled || this.isRunning) return;
        
        this.isRunning = true;
        this.render();
    }

    /**
     * Main render loop
     */
    render() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.performance.lastFrameTime;
        
        // Update performance metrics
        this.updatePerformanceMetrics(deltaTime);
        
        // Clear canvas
        this.clearCanvas();
        
        // Update and render effects (placeholder for now)
        this.updateEffects(deltaTime);
        this.renderEffects();
        
        // Schedule next frame
        this.animationId = requestAnimationFrame(() => this.render());
        this.performance.lastFrameTime = currentTime;
    }

    /**
     * Update performance metrics and adjust quality if needed
     */
    updatePerformanceMetrics(deltaTime) {
        this.performance.frameTime = deltaTime;
        this.performance.fps = 1000 / deltaTime;
        this.performance.frameCount++;
        
        // Adjust quality every 60 frames (roughly 1 second)
        if (this.performance.frameCount % 60 === 0) {
            this.adjustQualityBasedOnPerformance();
        }
    }

    /**
     * Adjust quality based on current performance
     */
    adjustQualityBasedOnPerformance() {
        const avgFps = this.performance.fps;
        
        if (avgFps < 30 && this.performance.qualityLevel !== 'low') {
            this.performance.qualityLevel = 'low';
            this.settings.maxEffects = Math.max(5, this.settings.maxEffects - 3);
            console.log('⚡ Reduced quality to maintain performance');
        } else if (avgFps > 50 && this.performance.qualityLevel === 'low') {
            this.performance.qualityLevel = 'medium';
            this.settings.maxEffects = Math.min(15, this.settings.maxEffects + 2);
            console.log('⚡ Increased quality due to good performance');
        }
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        if (!this.context) return;
        
        // Clear with slight fade for trail effect
        this.context.fillStyle = `rgba(0, 0, 0, ${1 - this.settings.fadeRate})`;
        this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    /**
     * Update effects
     */
    updateEffects(deltaTime) {
        // Update particle system
        if (this.particleSystem && this.lastCursorData) {
            this.particleSystem.update(deltaTime, this.lastCursorData);
        }
        
        // Update other effects (lightning bolts will be added in later tasks)
        this.effects.forEach((effect, index) => {
            if (!effect.update(deltaTime)) {
                this.effects.splice(index, 1);
            }
        });
    }

    /**
     * Render effects
     */
    renderEffects() {
        // Render particle system
        if (this.particleSystem) {
            this.particleSystem.render(this.context);
        }
        
        // Render other effects (lightning bolts will be added in later tasks)
        this.effects.forEach(effect => {
            effect.render(this.context);
        });
        
        // Show test pattern for first few seconds to verify engine is working
        if (this.performance.frameCount < 120) {
            this.drawTestPattern();
        }
    }

    /**
     * Draw test pattern to verify engine is working
     */
    drawTestPattern() {
        if (!this.context) return;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const time = this.performance.frameCount * 0.05;
        
        // Draw pulsing circle
        this.context.beginPath();
        this.context.arc(centerX, centerY, 50 + Math.sin(time) * 20, 0, Math.PI * 2);
        this.context.strokeStyle = '#00d4ff';
        this.context.lineWidth = 2;
        this.context.stroke();
        
        // Draw text
        this.context.fillStyle = '#00d4ff';
        this.context.font = '16px Arial';
        this.context.textAlign = 'center';
        this.context.fillText('Lightning Engine Active', centerX, centerY + 80);
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('⚡ Lightning Engine settings updated:', newSettings);
    }

    /**
     * Get current performance stats
     */
    getPerformanceStats() {
        return {
            fps: Math.round(this.performance.fps),
            frameTime: Math.round(this.performance.frameTime * 100) / 100,
            qualityLevel: this.performance.qualityLevel,
            effectCount: this.effects.length,
            particleCount: this.particles.length,
            isRunning: this.isRunning
        };
    }

    /**
     * Cleanup and destroy the engine
     */
    destroy() {
        console.log('⚡ Destroying Lightning Engine...');
        
        this.stop();
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Stop cursor tracking
        if (this.cursorTracker) {
            this.cursorTracker.stopTracking();
            this.cursorTracker = null;
        }
        
        // Clear particle system
        if (this.particleSystem) {
            this.particleSystem.clear();
            this.particleSystem = null;
        }
        
        // Clear references
        this.canvas = null;
        this.context = null;
        this.effects = [];
        this.particles = [];
        this.lastCursorData = null;
        
        console.log('⚡ Lightning Engine destroyed');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lightning engine
    window.lightningEngine = new LightningEngine();
    
    // Start the engine after a short delay to ensure page is fully loaded
    setTimeout(() => {
        if (window.lightningEngine.initialize()) {
            window.lightningEngine.start();
            console.log('⚡ Lightning Engine auto-started');
        }
    }, 500);
});

// Export for testing and external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LightningEngine;
}