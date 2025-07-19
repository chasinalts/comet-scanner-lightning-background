/**
 * COMET Scanner - Background Effects System
 * Particle system for energy clouds and lightning effects
 */

/**
 * Individual particle class for energy cloud effects
 */
class EnergyParticle {
    constructor(x, y, options = {}) {
        // Position
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        
        // Velocity and movement
        this.vx = options.vx || (Math.random() - 0.5) * 2;
        this.vy = options.vy || (Math.random() - 0.5) * 2;
        this.friction = options.friction || 0.98;
        
        // Visual properties
        this.size = options.size || Math.random() * 3 + 1;
        this.maxSize = this.size;
        this.opacity = options.opacity || Math.random() * 0.8 + 0.2;
        this.maxOpacity = this.opacity;
        
        // Color (will be set by color manager)
        this.color = options.color || '#00d4ff';
        this.hue = options.hue || 200;
        this.saturation = options.saturation || 100;
        this.lightness = options.lightness || 50;
        
        // Lifecycle
        this.age = 0;
        this.maxAge = options.maxAge || 120; // frames
        this.life = 1.0; // 1.0 = birth, 0.0 = death
        
        // Behavior
        this.attractionStrength = options.attractionStrength || 0.02;
        this.repulsionRadius = options.repulsionRadius || 30;
        this.connectionRadius = options.connectionRadius || 80;
        
        // Energy field properties
        this.energy = options.energy || Math.random() * 0.5 + 0.5;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = options.pulseSpeed || 0.05;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 5;
    }

    /**
     * Update particle physics and lifecycle
     */
    update(deltaTime, cursorData, otherParticles = []) {
        // Update age and life
        this.age++;
        this.life = Math.max(0, 1 - (this.age / this.maxAge));
        
        // Update trail
        this.updateTrail();
        
        // Apply cursor attraction if cursor data is available
        if (cursorData && cursorData.movementIntensity > 0.1) {
            this.applyCursorAttraction(cursorData);
        }
        
        // Apply particle interactions
        this.applyParticleInteractions(otherParticles);
        
        // Update position
        this.x += this.vx * (deltaTime / 16.67); // Normalize to 60fps
        this.y += this.vy * (deltaTime / 16.67);
        
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Update visual properties
        this.updateVisualProperties();
        
        // Return true if particle is still alive
        return this.life > 0;
    }

    /**
     * Apply cursor attraction force
     */
    applyCursorAttraction(cursorData) {
        const dx = cursorData.position.x - this.x;
        const dy = cursorData.position.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < 200) {
            // Attraction force based on cursor intensity and distance
            const force = (cursorData.movementIntensity * this.attractionStrength) / (distance * 0.01);
            const forceX = (dx / distance) * force;
            const forceY = (dy / distance) * force;
            
            this.vx += forceX;
            this.vy += forceY;
            
            // Increase energy when near cursor
            this.energy = Math.min(1, this.energy + cursorData.movementIntensity * 0.02);
        }
    }

    /**
     * Apply interactions with other particles
     */
    applyParticleInteractions(otherParticles) {
        for (const other of otherParticles) {
            if (other === this) continue;
            
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < this.repulsionRadius) {
                // Repulsion force to prevent clustering
                const force = (this.repulsionRadius - distance) * 0.001;
                const forceX = -(dx / distance) * force;
                const forceY = -(dy / distance) * force;
                
                this.vx += forceX;
                this.vy += forceY;
            }
        }
    }

    /**
     * Update visual properties based on energy and lifecycle
     */
    updateVisualProperties() {
        // Pulse effect
        const pulse = Math.sin(this.age * this.pulseSpeed + this.pulsePhase) * 0.3 + 0.7;
        
        // Size based on life and energy
        this.size = this.maxSize * this.life * pulse * (0.5 + this.energy * 0.5);
        
        // Opacity based on life and energy
        this.opacity = this.maxOpacity * this.life * (0.3 + this.energy * 0.7);
        
        // Color intensity based on energy
        this.lightness = 30 + this.energy * 40;
    }

    /**
     * Update particle trail
     */
    updateTrail() {
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity * 0.5 });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Fade trail points
        this.trail.forEach((point) => {
            point.opacity *= 0.9;
        });
    }

    /**
     * Check if particle can connect to another particle
     */
    canConnectTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.connectionRadius && distance > 10;
    }

    /**
     * Get connection strength to another particle
     */
    getConnectionStrength(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance >= this.connectionRadius) return 0;
        
        const strength = 1 - (distance / this.connectionRadius);
        return strength * this.energy * other.energy;
    }

    /**
     * Render the particle
     */
    render(context) {
        if (this.opacity <= 0 || this.size <= 0) return;
        
        context.save();
        
        // Render trail first
        this.renderTrail(context);
        
        // Main particle glow effect
        const gradient = context.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        
        const color = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.3, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity * 0.8})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);
        
        // Draw particle
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        context.fill();
        
        // Core particle
        context.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${Math.min(90, this.lightness + 20)}%, ${this.opacity})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
    }

    /**
     * Render particle trail
     */
    renderTrail(context) {
        if (this.trail.length < 2) return;
        
        context.save();
        context.strokeStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity * 0.3})`;
        context.lineWidth = this.size * 0.5;
        context.lineCap = 'round';
        
        context.beginPath();
        context.moveTo(this.trail[0].x, this.trail[0].y);
        
        for (let i = 1; i < this.trail.length; i++) {
            context.lineTo(this.trail[i].x, this.trail[i].y);
        }
        
        context.stroke();
        context.restore();
    }
}

/**
 * Particle system manager for energy cloud effects
 */
class ParticleSystem {
    constructor(options = {}) {
        this.particles = [];
        this.maxParticles = options.maxParticles || 50;
        this.spawnRate = options.spawnRate || 0.5; // particles per frame
        this.spawnAccumulator = 0;
        
        // Spawn area
        this.spawnRadius = options.spawnRadius || 100;
        this.followCursor = options.followCursor !== false;
        
        // Visual settings
        this.connectionOpacity = options.connectionOpacity || 0.3;
        this.showConnections = options.showConnections !== false;
        
        console.log('✨ Particle System initialized');
    }

    /**
     * Update all particles
     */
    update(deltaTime, cursorData) {
        // Spawn new particles if needed
        this.spawnParticles(cursorData);
        
        // Update existing particles
        this.particles = this.particles.filter(particle => 
            particle.update(deltaTime, cursorData, this.particles)
        );
        
        // Limit particle count
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    /**
     * Spawn new particles based on cursor activity
     */
    spawnParticles(cursorData) {
        if (!cursorData || cursorData.movementIntensity < 0.1) {
            this.spawnAccumulator *= 0.95; // Gradually reduce spawning
            return;
        }
        
        // Increase spawn rate based on cursor movement
        const dynamicSpawnRate = this.spawnRate * (1 + cursorData.movementIntensity * 2);
        this.spawnAccumulator += dynamicSpawnRate;
        
        while (this.spawnAccumulator >= 1 && this.particles.length < this.maxParticles) {
            this.spawnAccumulator--;
            
            // Spawn particle near cursor with some randomness
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.spawnRadius;
            const x = cursorData.position.x + Math.cos(angle) * distance;
            const y = cursorData.position.y + Math.sin(angle) * distance;
            
            // Create particle with properties based on cursor movement
            const particle = new EnergyParticle(x, y, {
                vx: (Math.random() - 0.5) * 4 + cursorData.velocity.x * 0.01,
                vy: (Math.random() - 0.5) * 4 + cursorData.velocity.y * 0.01,
                size: Math.random() * 2 + 1 + cursorData.movementIntensity * 2,
                opacity: 0.3 + cursorData.movementIntensity * 0.5,
                energy: cursorData.movementIntensity,
                maxAge: 60 + Math.random() * 60
            });
            
            this.particles.push(particle);
        }
    }

    /**
     * Render all particles and connections
     */
    render(context) {
        if (this.particles.length === 0) return;
        
        // Render connections first
        if (this.showConnections) {
            this.renderConnections(context);
        }
        
        // Render particles
        this.particles.forEach(particle => {
            particle.render(context);
        });
    }

    /**
     * Render connections between nearby particles
     */
    renderConnections(context) {
        context.save();
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle1 = this.particles[i];
            
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle2 = this.particles[j];
                
                if (particle1.canConnectTo(particle2)) {
                    const strength = particle1.getConnectionStrength(particle2);
                    
                    if (strength > 0.1) {
                        // Draw connection line
                        const opacity = strength * this.connectionOpacity;
                        const avgHue = (particle1.hue + particle2.hue) / 2;
                        const avgLightness = (particle1.lightness + particle2.lightness) / 2;
                        
                        context.strokeStyle = `hsla(${avgHue}, 80%, ${avgLightness}%, ${opacity})`;
                        context.lineWidth = strength * 2;
                        context.lineCap = 'round';
                        
                        context.beginPath();
                        context.moveTo(particle1.x, particle1.y);
                        context.lineTo(particle2.x, particle2.y);
                        context.stroke();
                    }
                }
            }
        }
        
        context.restore();
    }

    /**
     * Get particle system statistics
     */
    getStats() {
        return {
            particleCount: this.particles.length,
            maxParticles: this.maxParticles,
            spawnRate: this.spawnRate,
            averageEnergy: this.particles.reduce((sum, p) => sum + p.energy, 0) / this.particles.length || 0
        };
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.spawnAccumulator = 0;
    }

    /**
     * Update system settings
     */
    updateSettings(newSettings) {
        Object.assign(this, newSettings);
        console.log('✨ Particle System settings updated');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnergyParticle, ParticleSystem };
}