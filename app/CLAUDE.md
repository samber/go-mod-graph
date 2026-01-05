# go-mod-graph - Claude AI Context

This document provides context for Claude AI (or other AI assistants) working on this codebase.

## Project Overview

**go-mod-graph** is a web-based Go module dependency visualizer. The project consists of:
- **Frontend (`app/`)**: React + TypeScript + Vite application for visualizing dependencies
- **Backend (`proxy/`)**: Go proxy server to bypass CORS restrictions when accessing Go module proxies

## Project Structure

```
go-mod-graph/
├── app/                    # Frontend React application
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── components/    # React components
│   │   │   ├── CustomNode.tsx      # Graph node component (link to pkg.go.dev)
│   │   │   ├── EmptyState.tsx      # Empty state with onboarding
│   │   │   ├── FocusOnTopNode.tsx  # Auto-focus on first node
│   │   │   ├── GraphStats.tsx      # Graph statistics display
│   │   │   ├── Header.tsx          # Header with logo and settings
│   │   │   ├── Logo.tsx            # GoModGraph logo SVG
│   │   │   ├── Loader.tsx          # Loading spinner component
│   │   │   ├── ReleaseSelector.tsx # Version selector dropdown
│   │   │   ├── SearchForm.tsx      # Search input and examples
│   │   │   └── SettingsPanel.tsx   # Settings panel
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useModuleGraph.ts   # Graph state management
│   │   │   └── useModuleInput.ts   # Input normalization
│   │   ├── services/
│   │   │   ├── api/       # API services
│   │   │   ├── config.ts  # Configuration
│   │   │   ├── errors.ts  # Custom error classes
│   │   │   ├── goProxy.ts # Go module proxy API integration
│   │   │   └── types.ts   # TypeScript types
│   │   ├── styles/        # CSS stylesheets
│   │   │   ├── App.css           # ReactFlow custom styles
│   │   │   ├── CustomNode.css    # Node component styles
│   │   │   ├── EmptyState.css    # Empty state styles
│   │   │   ├── Header.css        # Header styles
│   │   │   ├── ReleaseSelector.css # Version selector styles
│   │   │   ├── Search.css        # Search form styles
│   │   │   └── Settings.css      # Settings panel styles
│   │   ├── App.css        # Main app styles (includes loading state)
│   │   └── index.css      # Global styles and CSS variables
│   ├── public/
│   │   └── logo.svg       # App logo
│   ├── .env.example       # Environment variables template
│   ├── index.html
│   └── package.json
└── proxy/                  # Go proxy server
    ├── main.go            # Proxy server implementation
    └── go.mod
```

## Architecture

### Frontend Components

- **`src/App.tsx`** - Main React component containing:
  - Header with logo link (clicking resets to home) and settings button
  - Settings panel with:
    - Go Module Proxy URL configuration (with Reset button)
    - Display weights toggle (show module sizes in graph)
  - Search form with:
    - Input field with automatic normalization (lowercase + remove protocol)
    - Release selector with inline search
    - Examples shortcuts (clickable)
    - Node count display (shows number of loaded modules)
  - Dependency graph visualization with ReactFlow
  - Loading state (shows loader when loading graph)
  - Empty state (shown when no graph is loaded)
  - Graph stats (shows module count, edge count, total size)
  - Error handling for ModuleNotFoundError and ReleaseNotFoundError
  - localStorage persistence for settings
  - Home click handler (resets input, version, and clears graph)

- **`src/components/CustomNode.tsx`** - Graph node component:
  - Displays as an anchor tag linking to pkg.go.dev
  - Shows module path (truncated if too long)
  - Shows release version tag
  - Shows module size badge (if weights enabled)
  - Handles selection state
  - URL preview on hover

- **`src/components/EmptyState.tsx`** - Empty state component:
  - Scrollable container (works on small screens)
  - Logo and title
  - Description
  - Example button (clickable to load testify module)
  - Feature cards (3 features in grid)
  - Sponsor link to GitHub Sponsors
  - Hint about node links

- **`src/components/GraphStats.tsx`** - Graph statistics display:
  - Shows module count
  - Shows dependency edge count
  - Shows total size (if weights enabled)

- **`src/components/Header.tsx`** - Header component:
  - Logo and title as clickable link (resets to home)
  - GitHub repository link
  - Settings toggle button

- **`src/components/SearchForm.tsx`** - Search form component:
  - Input with search icon
  - Release selector dropdown
  - Analyze button with loading state
  - Example shortcuts (testify, gin, lo, cobra, traefik)
  - Node count display (right-aligned, shows when modules loaded)

- **`src/hooks/useModuleGraph.ts`** - Graph state management:
  - `loadGraph()` - Loads dependency graph for a module
  - `loadVersions()` - Loads available versions for a module
  - `clearGraph()` - Clears nodes, edges, and error state
  - Uses dagre for auto-layout (nodesep: 150, ranksep: 200)
  - Edge styling: blue (#57534e), stroke-width 2.5px, animated hover
  - Node positioning with custom layout

- **`src/hooks/useModuleInput.ts`** - Input normalization:
  - Automatically lowercases module paths
  - Removes protocol prefix (https://, http://)
  - Parses path and version from input

- **`src/services/goProxy.ts`** - Service layer providing:
  - `getDependencyGraph()` - Fetch and build complete dependency tree using MVS
  - `getModuleReleases()` - List all available releases for a module
  - `getLatestRelease()` - Get the latest version of a module (fallback when list is empty)
  - `getGoMod()` - Parse go.mod file for dependencies
  - `getModuleSize()` - Fetch module size via .zip file Content-Length header
  - `formatBytes()`, `getSizeColor()`, `getSizeTextColor()` - Size formatting helpers
  - Custom error classes: `ModuleNotFoundError`, `ReleaseNotFoundError`
  - All module paths are normalized (lowercase, remove quotes)

- **`src/index.css`** - CSS design system:
  - Color variables (primary, accent, borders, text, background)
  - Spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
  - Typography scale (xs, sm, md, base, lg, xl, 2xl)
  - Border radius scale (sm, md, lg, full)
  - Shadow scale (sm, md, lg)
  - Transitions (fast, normal, slow)
  - Z-index layers (base, overlay)

- **`src/styles/*.css`** - Component-specific styles:
  - `App.css` - ReactFlow custom styles, loading state, graph container
  - `CustomNode.css` - Node component styles
  - `EmptyState.css` - Empty state styles with scrolling
  - `Header.css` - Header styles
  - `ReleaseSelector.css` - Version selector dropdown styles
  - `Search.css` - Search form styles with examples stats
  - `Settings.css` - Settings panel styles

### Backend (Proxy Server)

- **`proxy/main.go`** - HTTP proxy server that:
  - Accepts requests with `proxy` and `path` query parameters
  - Forwards requests to Go module proxies
  - Handles CORS headers
  - Can also serve static frontend files

## How It Works

1. **Frontend** makes requests to the local Go proxy server (configurable via `VITE_GO_MOD_PROXY_URL` environment variable, defaults to `http://localhost:8080`)
2. **Proxy Server** forwards the request to the actual Go module proxy (e.g., `proxy.golang.org`)
3. **Proxy Server** returns the response with proper CORS headers
4. **Frontend** visualizes the dependency tree using ReactFlow with dagre auto-layout

## Module Input Normalization

All module paths are automatically normalized:
- **Lowercased**: `GitHub.com/User/Repo` → `github.com/user/repo`
- **Protocol removed**: `https://github.com/user/repo` → `github.com/user/repo`
- Applied in real-time to the input field as user types
- Applied to all dependencies in the graph

## Settings Panel

The settings panel (accessed via gear icon) contains:
1. **Go Module Proxy URL** - Custom Go module proxy URL configuration
   - Input field for proxy URL
   - Reset button to restore default (`https://proxy.golang.org`)
   - Auto-saved to localStorage
2. **Display weights** - Toggle to show/hide module sizes
   - Shows module size as colored badges (green → red gradient)
   - Auto-saved to localStorage

## Go Module Proxy API

This project relies on the [Go Module Proxy](https://proxy.golang.org) protocol:

- `GET /{module_path}/@v/list` - Returns all available versions
- `GET /{module_path}/@v/{version}.info` - Returns module metadata
- `GET /{module_path}/@v/{version}.mod` - Returns the go.mod file containing dependencies
- `GET /{module_path}/@v/{version}.zip` - Returns module source zip (used for size)

The proxy server formats requests as:
```
http://localhost:8080/proxy?path=/github.com/stretchr/testify/@v/list&proxy=https://proxy.golang.org
```

## Release Selector Behavior

The release selector (`ReleaseSelector` component) has specific behavior:

### Default State
- Initial value: "latest"
- "latest" is always shown as the top choice
- Display value shows "latest" when no release is selected

### Loading Releases
- Releases load automatically after 2 seconds of inactivity when typing a module path
- Debounce timing: 2000ms (2 seconds)
- Only loads when input contains no version suffix
- **Fallback**: If `@v/list` returns empty, falls back to `/@latest` endpoint

### Sorting
- Releases are sorted by date (descending)
- Pseudo-versions (with timestamps like `v0.0.0-20220101234000-deadbeef`) are sorted by their timestamp
- Regular versions are sorted semver descending
- "latest" always appears at the top

### Input Field Behavior
- Selecting a release from dropdown does NOT update input unless input already has `@version` suffix
- If input is `github.com/foo` → selecting v1.0.0 keeps input as `github.com/foo`
- If input is `github.com/foo@v1.0.0` → selecting v2.0.0 updates input to `github.com/foo@v2.0.0`
- Selecting "latest" removes `@version` suffix from input if present
- Manually typing `@version` in input updates the selector

### Error States
- "No releases found" message displayed when module doesn't exist
- "latest" button remains clickable even when no releases found
- Different error messages for "module not found" vs "release not found"

## Dependency Graph Algorithm (Minimal Version Selection)

The dependency graph implements Go's Minimal Version Selection (MVS) algorithm:

1. **Initialize**: Start with root module path and version
2. **Queue-based processing**: Use a queue to process modules breadth-first
3. **Track selected versions**: Maintain a map of module path → selected version
4. **Version comparison**: When a module is encountered multiple times:
   - If the new version is higher than the currently selected version, update it
   - Re-fetch dependencies for the bumped version
   - Queue the new dependencies for processing
5. **Build tree**: Construct the final tree from the selected versions and their dependencies
6. **Auto-layout**: Uses dagre library for automatic node positioning (top-to-bottom)

### Key MVS Rules Implemented:
- Each module path has exactly one selected version
- The selected version is the **highest minimal version** required by any dependency
- When a version is bumped, all its dependencies are recomputed
- Major versions (v2+, v3+) are treated as separate module paths
- Proper semver comparison including pre-release and pseudo-versions
- All module paths are lowercased for consistency

### Version Comparison:
- Regular versions: v1.2.3 < v1.2.4 < v1.3.0
- Pre-release: v1.2.3-beta < v1.2.3
- Pseudo-versions: v0.0.0-20220101234000-abcdef < v0.0.0-20220102234000-abcdef

## Module Weights (Sizes)

When "Display weights" is enabled:
- Module sizes are fetched via HEAD request to `.zip` files
- Sizes are displayed as colored badges in nodes
- Color gradient based on size:
  - < 1 MB: Green
  - 1-5 MB: Yellow
  - 5-10 MB: Orange
  - 10-25 MB: Red (light)
  - > 25 MB: Red (dark)
- Sizes are formatted as human-readable (e.g., "1.2 MB", "500 KB")

## Console Logging

After loading a dependency graph, the number of loaded dependencies is logged:
```
Loaded 42 dependencies for github.com/stretchr/testify@latest
```

## Storage

### LocalStorage Keys (prefixed with `go-mod-graph.`)
- `go-mod-graph.goProxyUrl` - Custom Go module proxy URL
- `go-mod-graph.includeWeights` - Display module sizes toggle state

Settings are automatically persisted and restored on page load.

## Development

### Frontend Development

```bash
cd app
npm install
npm run dev    # Start dev server on http://localhost:5173
npm run build  # Build for production
npm run lint   # Run ESLint
```

### Proxy Server Development

```bash
cd proxy
go run main.go    # Start proxy server on http://localhost:8080
go build -o ../dist/go-mod-graph-proxy main.go
```

### Running Both Servers

```bash
# Terminal 1
cd proxy && go run main.go

# Terminal 2
cd app && npm run dev
```

## Code Conventions

### Frontend
- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Styling**: TailwindCSS utility classes + custom CSS in component files
- **Imports**: Relative imports from `src/` directory
- **Naming**: Use "release" instead of "version" for UI elements
- **Constants**: localStorage keys stored in `STORAGE_KEYS` constant object

### Backend (Proxy)
- **Go**: Standard library only (no external dependencies)
- **HTTP**: Uses `net/http` package
- **Configuration**: Environment variables for `PORT` and `ALLOWED_ORIGINS`

## Common Tasks

### Adding a New Feature

1. Update the appropriate component (usually `App.tsx`)
2. Add any new service functions to `goProxy.ts`
3. If backend changes are needed, update `proxy/main.go`
4. Update styles in `App.css` or use Tailwind classes
5. Run `npm run lint` to check code quality

### Fixing a Bug

1. Reproduce the issue with both servers running
2. Add appropriate error handling in `goProxy.ts` or `App.tsx`
3. Test with various Go modules
4. Consider edge cases like private modules, invalid versions, etc.

### Updating Dependencies

```bash
# Frontend
cd app
npm outdated
npm install package@latest

# Backend (proxy has no external dependencies)
# Just update Go version if needed
```

## Known Limitations

- Max recursion depth: 50 levels (to prevent infinite loops)
- Private modules require proper GOPRIVATE configuration or authentication
- Very large dependency trees may impact performance
- The Go proxy may rate-limit requests
- Both servers must be running for full functionality
- Release list loading has 2 second debounce

## Environment Variables

### Frontend (`app/`)
- `VITE_GO_MOD_PROXY_URL` - Local proxy server URL (default: `http://localhost:8080`)

Example `.env` file:
```bash
VITE_GO_MOD_PROXY_URL=http://localhost:8080
```

### Proxy Server (`proxy/`)
- `PORT` - Port for the proxy server (default: `8080`)
- `ALLOWED_ORIGINS` - CORS allowed origins (default: `*`)

## Related Resources

- [Go Module Proxy Protocol](https://go.dev/ref/mod#module-proxy)
- [pkg.go.dev](https://pkg.go.dev) - Go package discovery site
- [ReactFlow Documentation](https://reactflow.dev)
- [dagre Layout Library](https://github.com/dagrejs/dagre)
- [proxy/README.md](../proxy/README.md) - Proxy server documentation
