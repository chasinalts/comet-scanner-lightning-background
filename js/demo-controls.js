/**
 * COMET Scanner - Demo Controls
 * Interactive controls for the lightning background demo
 */

let statsVisible = false;
let effectsEnabled = true;
let statsUpdateInterval = null;

/**
 * Toggle performance stats display
 */
function toggleStats() {
    const statsSection = document.getElementById('stats-section');
    const button = document.querySelector('.btn-primary');
    
    if (statsVisible) {
        // Hide stats
        statsSection.style.display = 'none';
        button.textContent = '📊 Show Performance Stats';
        statsVisible = false;
        
        // Clear update interval
        if (statsUpdateInterval) {
            clearInterval(statsUpdateInterval);
            statsUpdateInterval = null;
        }
    } else {
        // Show stats
        statsSection.style.display = 'block';
        button.textContent = '📊 Hide Performance Stats';
        statsVisible = true;
        
        // Start updating stats
        updateStats();
        statsUpdateInterval = setInterval(updateStats, 1000);
    }
}

/**
 * Toggle lightning effects on/off
 */
function toggleEffects() {
    const button = document.querySelector('.btn-secondary');
    
    if (effectsEnabled) {
        // Disable effects
        if (window.lightningEngine) {
            window.lightningEngine.stop();
        }
        button.textContent = '⚡ Enable Effects';
        effectsEnabled = false;
    } else {
        // Enable effects
        if (window.lightningEngine) {
            window.lightningEngine.start();
        }
        button.textContent = '⚡ Disable Effects';
        effectsEnabled = true;
    }
}

/**
 * Update performance statistics display
 */
function updateStats() {
    if (!window.lightningEngine || !statsVisible) return;
    
    try {
        const stats = window.lightningEngine.getPerformanceStats();
        const particleStats = window.lightningEngine.particleSystem ? 
            window.lightningEngine.particleSystem.getStats() : null;
        const cursorStats = window.lightningEngine.cursorTracker ? 
            window.lightningEngine.cursorTracker.getStats() : null;
        
        // Update FPS
        const fpsElement = document.getElementById('fps-value');
        if (fpsElement) {
            fpsElement.textContent = stats.fps || '--';
            fpsElement.style.color = stats.fps > 50 ? '#00ff88' : stats.fps > 30 ? '#ffaa00' : '#ff4444';
        }
        
        // Update particle count
        const particleElement = document.getElementById('particle-count');
        if (particleElement && particleStats) {
            particleElement.textContent = particleStats.particleCount || '0';
        }
        
        // Update quality level
        const qualityElement = document.getElementById('quality-level');
        if (qualityElement) {
            qualityElement.textContent = stats.qualityLevel || 'Unknown';
            qualityElement.style.color = 
                stats.qualityLevel === 'high' ? '#00ff88' : 
                stats.qualityLevel === 'medium' ? '#ffaa00' : '#ff4444';
        }
        
        // Update cursor speed
        const speedElement = document.getElementById('cursor-speed');
        if (speedElement && cursorStats) {
            speedElement.textContent = cursorStats.speed + ' px/s' || '0 px/s';
        }
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

/**
 * Initialize demo controls when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Demo controls initialized');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        switch (event.key.toLowerCase()) {
            case 's':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    toggleStats();
                }
                break;
            case 'e':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    toggleEffects();
                }
                break;
            case 'r':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    resetEngine();
                }
                break;
        }
    });
    
    // Add help text
    addHelpText();
});

/**
 * Reset the lightning engine
 */
function resetEngine() {
    if (window.lightningEngine) {
        console.log('🔄 Resetting lightning engine...');
        window.lightningEngine.destroy();
        
        // Reinitialize after a short delay
        setTimeout(() => {
            window.lightningEngine = new LightningEngine();
            if (window.lightningEngine.initialize()) {
                window.lightningEngine.start();
                console.log('✅ Lightning engine reset complete');
            }
        }, 100);
    }
}

/**
 * Add help text for keyboard shortcuts
 */
function addHelpText() {
    const helpText = document.createElement('div');
    helpText.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(15, 20, 25, 0.9);
        color: #ffffff;
        padding: 15px;
        border-radius: 8px;
        font-size: 0.9rem;
        border: 1px solid rgba(0, 212, 255, 0.3);
        z-index: 1000;
        max-width: 250px;
    `;
    
    helpText.innerHTML = `
        <div style="color: #00d4ff; font-weight: bold; margin-bottom: 8px;">Keyboard Shortcuts:</div>
        <div>Ctrl/Cmd + S: Toggle Stats</div>
        <div>Ctrl/Cmd + E: Toggle Effects</div>
        <div>Ctrl/Cmd + R: Reset Engine</div>
        <div style="margin-top: 8px; opacity: 0.7; font-size: 0.8rem;">
            Move your cursor around to see the lightning effects!
        </div>
    `;
    
    document.body.appendChild(helpText);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        helpText.style.opacity = '0.3';
        helpText.style.transition = 'opacity 0.5s ease';
    }, 10000);
}

/**
 * Export functions for global access
 */
window.toggleStats = toggleStats;
window.toggleEffects = toggleEffects;
window.resetEngine = resetEngine;