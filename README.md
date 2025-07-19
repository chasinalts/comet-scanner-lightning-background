# ⚡ COMET Scanner - Interactive Lightning Background

A stunning interactive lightning background system with cursor-responsive energy clouds and space-themed visual effects. Inspired by modern design trends and optimized for performance across all devices.

## ✨ Features

- **🎯 Cursor-Responsive Effects**: Energy particles spawn and follow your cursor movement
- **⚡ Dynamic Lightning**: Beautiful particle connections that create lightning-like effects
- **🌌 Space Theme**: Deep blues, electric teals, and cosmic colors
- **📱 Mobile Support**: Touch-responsive with optimized performance for mobile devices
- **♿ Accessibility**: Respects `prefers-reduced-motion` and includes manual toggles
- **🚀 Performance Optimized**: Automatic quality adjustment based on device capabilities
- **📊 Real-time Stats**: Performance monitoring with FPS, particle count, and more

## 🎮 Demo

**[View Live Demo](https://chasinalts.github.io/comet-scanner-lightning-background/)**

### Controls
- **Move your cursor** around the screen to see lightning effects
- **Click "Show Performance Stats"** to view real-time performance metrics
- **Click "Toggle Effects"** to enable/disable the lightning system

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Toggle performance stats
- `Ctrl/Cmd + E`: Toggle effects on/off  
- `Ctrl/Cmd + R`: Reset the lightning engine

## 🛠️ Technical Implementation

### Architecture
The system consists of three main components:

1. **Lightning Engine** (`js/lightning-engine.js`)
   - Canvas-based rendering system
   - Performance monitoring and quality adjustment
   - Accessibility compliance

2. **Cursor Tracker** (`js/cursor-tracker.js`)
   - Real-time mouse/touch position tracking
   - Velocity and acceleration calculations
   - Movement intensity detection

3. **Particle System** (`js/background-effects.js`)
   - Individual energy particles with physics
   - Cursor attraction and particle interactions
   - Visual effects with trails and connections

### Key Features

#### Performance Optimization
- Automatic quality adjustment based on FPS
- Device capability detection (mobile, screen size, DPI)
- Efficient particle pooling and cleanup
- Canvas optimization with proper scaling

#### Visual Effects
- Glowing particles with radial gradients
- Particle trail effects
- Dynamic connections between nearby particles
- Smooth color transitions and pulsing effects

#### Accessibility
- `prefers-reduced-motion` media query support
- Manual effect toggles
- Keyboard navigation support
- Screen reader friendly

## 🚀 Usage

### Basic Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lightning Background Demo</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <!-- Your content here -->
    
    <!-- Lightning Background Scripts -->
    <script src="js/cursor-tracker.js"></script>
    <script src="js/background-effects.js"></script>
    <script src="js/lightning-engine.js"></script>
</body>
</html>
```

### Advanced Configuration

```javascript
// Custom lightning engine configuration
const lightningEngine = new LightningEngine({
    maxEffects: 20,
    fadeRate: 0.98,
    intensityMultiplier: 1.5,
    performanceMode: 'high',
    enableAccessibility: true
});

// Initialize with custom container
lightningEngine.initialize(document.getElementById('custom-container'));
lightningEngine.start();
```

### Particle System Customization

```javascript
// Access the particle system for customization
const particleSystem = lightningEngine.particleSystem;

// Update settings
particleSystem.updateSettings({
    maxParticles: 75,
    spawnRate: 1.2,
    connectionOpacity: 0.6,
    showConnections: true
});
```

## 📁 Project Structure

```
comet-scanner-lightning-background/
├── index.html              # Demo page
├── js/
│   ├── lightning-engine.js # Main engine and canvas management
│   ├── cursor-tracker.js   # Mouse/touch tracking system
│   ├── background-effects.js # Particle system and effects
│   └── demo-controls.js    # Demo page controls
├── styles/
│   └── main.css           # Demo page styles
└── README.md              # This file
```

## 🎨 Customization

### Color Themes
The system uses HSL colors for easy customization:

```javascript
// Modify particle colors
const particle = new EnergyParticle(x, y, {
    hue: 280,        // Purple theme
    saturation: 90,
    lightness: 60
});
```

### Performance Tuning
Adjust quality levels for different devices:

```javascript
// Custom quality settings
lightningEngine.updateSettings({
    maxEffects: 30,      // Higher for powerful devices
    fadeRate: 0.99,      // Longer trails
    intensityMultiplier: 2.0  // More dramatic effects
});
```

## 🔧 Development

### Local Development
1. Clone the repository
2. Open `index.html` in a modern browser
3. Start developing!

### Building for Production
The system is vanilla JavaScript with no build process required. Simply:
1. Include the CSS and JS files
2. Ensure proper script loading order
3. Initialize the lightning engine

## 📊 Performance

### Benchmarks
- **Desktop (High-end)**: 60 FPS with 50+ particles
- **Desktop (Mid-range)**: 60 FPS with 35+ particles  
- **Mobile (Modern)**: 30-60 FPS with 20+ particles
- **Mobile (Older)**: 30 FPS with 10+ particles

### Optimization Features
- Automatic quality adjustment
- Particle count limiting
- Efficient canvas clearing
- RequestAnimationFrame optimization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple devices
- Ensure accessibility compliance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [Onlook.com](https://onlook.com)'s beautiful interactive background
- Built with modern web technologies and performance best practices
- Designed for the COMET Scanner trading tool ecosystem

---

**Made with ⚡ by [chasinalts](https://github.com/chasinalts)**