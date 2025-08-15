# Cloudscaff - Ionic Development Guide

## Quick Start Commands

### Development Server

```bash
npm start              # Start Ionic dev server
npm run serve:lab      # Start with Ionic Lab (multiple platforms)
npm run serve:external # Serve on network for device testing
```

### Building

```bash
npm run build:dev      # Development build
npm run build          # Production build
```

### Capacitor (Mobile Development)

```bash
# Initial setup
npm run cap:add:ios     # Add iOS platform
npm run cap:add:android # Add Android platform

# Development workflow
npm run cap:sync        # Sync web app with native projects
npm run cap:copy        # Copy web assets to native projects

# Running on devices
npm run cap:run:ios     # Run on iOS device/simulator
npm run cap:run:android # Run on Android device/emulator

# Open in IDEs
npm run cap:open:ios    # Open iOS project in Xcode
npm run cap:open:android # Open Android project in Android Studio
```

### Testing & Quality

```bash
npm run test           # Run unit tests
npm run test:ci        # Run tests in CI mode
npm run lint           # Check code quality
npm run lint:fix       # Fix linting issues
```

### Maintenance

```bash
npm run clean          # Clean install dependencies
npm run audit:check    # Check for vulnerabilities
npm run audit:fix      # Fix safe vulnerabilities
```

## Development Tips

1. **Live Reload**: Use `ionic serve` for fast development with live reload
2. **Device Testing**: Use `ionic serve --external` to test on real devices on your network
3. **Platform Specific**: Use Ionic Lab to see how your app looks on different platforms
4. **Capacitor Sync**: Run `ionic cap sync` after installing new native plugins

## Project Structure

- `src/app/` - Main application code
- `src/assets/` - Static assets
- `src/theme/` - Ionic theming and variables
- `capacitor.config.json` - Capacitor configuration
- `ionic.config.json` - Ionic CLI configuration
