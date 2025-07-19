/**
 * COMET Scanner - Cursor Tracking System
 * Monitors cursor movement and calculates velocity/acceleration for lightning effects
 */

class CursorTracker {
    constructor(callback) {
        // Core properties
        this.position = { x: 0, y: 0 };
        this.previousPosition = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.speed = 0;
        this.direction = 0;
        
        // Movement history for smooth calculations
        this.history = [];
        this.maxHistoryLength = 10;
        
        // Callback for movement updates
        this.callback = callback;
        
        // Touch support
        this.isTouch = false;
        this.touchId = null;
        
        // Tracking state
        this.isTracking = false;
        this.lastUpdateTime = 0;
        
        // Smoothing and filtering
        this.smoothingFactor = 0.8;
        this.minMovementThreshold = 1; // pixels
        
        console.log('🎯 Cursor Tracker initialized');
    }

    /**
     * Start tracking cursor/touch movement
     */
    startTracking() {
        if (this.isTracking) return;
        
        console.log('🎯 Starting cursor tracking...');
        
        // Mouse events
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Touch events for mobile
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        document.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: true });
        
        this.isTracking = true;
        this.lastUpdateTime = performance.now();
        
        console.log('✅ Cursor tracking started');
    }

    /**
     * Stop tracking cursor/touch movement
     */
    stopTracking() {
        if (!this.isTracking) return;
        
        console.log('🎯 Stopping cursor tracking...');
        
        // Remove mouse events
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
        document.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Remove touch events
        document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        document.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
        
        this.isTracking = false;
        
        console.log('✅ Cursor tracking stopped');
    }

    /**
     * Handle mouse move events
     */
    handleMouseMove(event) {
        this.isTouch = false;
        this.updatePosition(event.clientX, event.clientY);
    }

    /**
     * Handle mouse enter events
     */
    handleMouseEnter(event) {
        this.isTouch = false;
        this.updatePosition(event.clientX, event.clientY);
    }

    /**
     * Handle mouse leave events
     */
    handleMouseLeave(event) {
        // Gradually reduce effects when cursor leaves
        this.handleMovementStop();
    }

    /**
     * Handle touch start events
     */
    handleTouchStart(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.isTouch = true;
            this.touchId = touch.identifier;
            this.updatePosition(touch.clientX, touch.clientY);
        }
    }

    /**
     * Handle touch move events
     */
    handleTouchMove(event) {
        if (!this.isTouch || this.touchId === null) return;
        
        // Find the touch with our ID
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            if (touch.identifier === this.touchId) {
                this.updatePosition(touch.clientX, touch.clientY);
                break;
            }
        }
    }

    /**
     * Handle touch end events
     */
    handleTouchEnd(event) {
        // Check if our touch ended
        let touchEnded = true;
        if (this.touchId !== null) {
            for (let i = 0; i < event.touches.length; i++) {
                if (event.touches[i].identifier === this.touchId) {
                    touchEnded = false;
                    break;
                }
            }
        }
        
        if (touchEnded) {
            this.isTouch = false;
            this.touchId = null;
            this.handleMovementStop();
        }
    }

    /**
     * Update cursor position and calculate movement metrics
     */
    updatePosition(x, y) {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        
        // Skip if update is too frequent (< 16ms for 60fps)
        if (deltaTime < 16) return;
        
        // Store previous position
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
        
        // Update current position
        this.position.x = x;
        this.position.y = y;
        
        // Calculate movement delta
        const deltaX = this.position.x - this.previousPosition.x;
        const deltaY = this.position.y - this.previousPosition.y;
        
        // Check minimum movement threshold
        const movementDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (movementDistance < this.minMovementThreshold) return;
        
        // Calculate velocity (pixels per second)
        const timeScale = 1000 / deltaTime; // Convert to per-second
        const newVelocity = {
            x: deltaX * timeScale,
            y: deltaY * timeScale
        };
        
        // Smooth velocity using exponential moving average
        this.velocity.x = this.velocity.x * this.smoothingFactor + newVelocity.x * (1 - this.smoothingFactor);
        this.velocity.y = this.velocity.y * this.smoothingFactor + newVelocity.y * (1 - this.smoothingFactor);
        
        // Calculate speed and direction
        this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        this.direction = Math.atan2(this.velocity.y, this.velocity.x);
        
        // Update movement history
        this.updateHistory(currentTime);
        
        // Calculate acceleration
        this.calculateAcceleration();
        
        // Trigger callback with movement data
        if (this.callback) {
            this.callback(this.getMovementData());
        }
        
        this.lastUpdateTime = currentTime;
    }

    /**
     * Update movement history for trend analysis
     */
    updateHistory(timestamp) {
        const historyEntry = {
            timestamp,
            position: { ...this.position },
            velocity: { ...this.velocity },
            speed: this.speed,
            direction: this.direction
        };
        
        this.history.push(historyEntry);
        
        // Limit history length
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    /**
     * Calculate acceleration based on velocity changes
     */
    calculateAcceleration() {
        if (this.history.length < 2) {
            this.acceleration.x = 0;
            this.acceleration.y = 0;
            return;
        }
        
        const current = this.history[this.history.length - 1];
        const previous = this.history[this.history.length - 2];
        
        const deltaTime = (current.timestamp - previous.timestamp) / 1000; // Convert to seconds
        
        if (deltaTime > 0) {
            this.acceleration.x = (current.velocity.x - previous.velocity.x) / deltaTime;
            this.acceleration.y = (current.velocity.y - previous.velocity.y) / deltaTime;
        }
    }

    /**
     * Handle when movement stops (mouse leave, touch end)
     */
    handleMovementStop() {
        // Gradually reduce velocity to zero
        const fadeRate = 0.9;
        this.velocity.x *= fadeRate;
        this.velocity.y *= fadeRate;
        this.speed *= fadeRate;
        
        // Trigger callback with fading movement
        if (this.callback && this.speed > 1) {
            this.callback(this.getMovementData());
        }
        
        // Clear acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }

    /**
     * Get current movement data
     */
    getMovementData() {
        return {
            position: { ...this.position },
            velocity: { ...this.velocity },
            acceleration: { ...this.acceleration },
            speed: this.speed,
            direction: this.direction,
            isTouch: this.isTouch,
            timestamp: performance.now(),
            movementIntensity: this.getMovementIntensity()
        };
    }

    /**
     * Calculate movement intensity (0-1 scale)
     */
    getMovementIntensity() {
        // Base intensity on speed with logarithmic scaling
        const maxSpeed = 2000; // pixels per second
        const normalizedSpeed = Math.min(this.speed / maxSpeed, 1);
        
        // Apply curve for more natural feeling
        const intensity = Math.pow(normalizedSpeed, 0.7);
        
        return Math.max(0, Math.min(1, intensity));
    }

    /**
     * Get movement trend (accelerating, decelerating, steady)
     */
    getMovementTrend() {
        if (this.history.length < 3) return 'steady';
        
        const recent = this.history.slice(-3);
        const speedTrend = recent[2].speed - recent[0].speed;
        
        if (speedTrend > 50) return 'accelerating';
        if (speedTrend < -50) return 'decelerating';
        return 'steady';
    }

    /**
     * Get average movement direction over recent history
     */
    getAverageDirection() {
        if (this.history.length < 3) return this.direction;
        
        const recent = this.history.slice(-5);
        let avgX = 0, avgY = 0;
        
        recent.forEach(entry => {
            avgX += Math.cos(entry.direction);
            avgY += Math.sin(entry.direction);
        });
        
        return Math.atan2(avgY / recent.length, avgX / recent.length);
    }

    /**
     * Check if cursor is moving in a specific direction
     */
    isMovingInDirection(targetDirection, tolerance = Math.PI / 4) {
        const directionDiff = Math.abs(this.direction - targetDirection);
        const normalizedDiff = Math.min(directionDiff, 2 * Math.PI - directionDiff);
        return normalizedDiff <= tolerance;
    }

    /**
     * Get cursor tracking statistics
     */
    getStats() {
        return {
            position: { ...this.position },
            speed: Math.round(this.speed),
            direction: Math.round(this.direction * 180 / Math.PI), // Convert to degrees
            intensity: Math.round(this.getMovementIntensity() * 100),
            trend: this.getMovementTrend(),
            isTouch: this.isTouch,
            historyLength: this.history.length,
            isTracking: this.isTracking
        };
    }

    /**
     * Reset tracking state
     */
    reset() {
        this.position = { x: 0, y: 0 };
        this.previousPosition = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.speed = 0;
        this.direction = 0;
        this.history = [];
        this.isTouch = false;
        this.touchId = null;
        
        console.log('🎯 Cursor tracker reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CursorTracker;
}