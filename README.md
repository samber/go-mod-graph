# Go module dependency graph

A web-based Go module dependency visualizer that helps you explore and understand the dependency tree of any Go module.

🌐 **Try it live:** [go-mod-graph.samber.dev](https://go-mod-graph.samber.dev)

<a href="https://go-mod-graph.samber.dev" title="go-mod-graph.samber.dev">
  <img width="1330" height="887" alt="image" src="https://github.com/user-attachments/assets/2acf18d5-4001-42bb-9d0a-a479f32326df" />
</a>

## 🚀 Features

- ⚡ **Interactive Dependency Graph** - Interactive, zoomable dependency visualization
- 🔍 **Minimal Version Selection (MVS)** - Go's MVS algorithm for accurate dependency resolution
- 📦 **Version Management** - View and select module versions with searchable dropdown
- 📊 **Module Weights** - Optional size display with color-coded badges
- 🔧 **Custom Proxy Support** - Configure custom Go module proxy for enterprise/offline use
- 📚 **One-Click Documentation** - Click nodes to open module docs on pkg.go.dev

## ⛽️ Usage

### 📦 Development

Start both the proxy server and the frontend dev server:

```bash
# Terminal 1: Start the Go proxy server
cd proxy
go run main.go

# Terminal 2: Start the frontend dev server
cd app
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### 👀 Analyzing a Module

1. Enter a Go module path (e.g., `github.com/stretchr/testify`)
2. Optionally specify a version (e.g., `@v1.9.0`)
3. Click "Analyze" to generate the dependency graph

### 👷 Production Build

```bash
export VITE_GO_MOD_PROXY_URL=xxxx
export ALLOWED_ORIGINS=yyyy
export PORT=8080

# Build the frontend
cd app
npm run build

# Build the Go proxy server
cd ../proxy
go build -o go-mod-graph-proxy main.go
```

The built frontend files will be in `app/dist/`. The proxy server can serve these files directly.

## 🤝 Contributing

- Ping me on Twitter [@samuelberthe](https://twitter.com/samuelberthe) (DMs, mentions, whatever :))
- Fork the [project](https://github.com/samber/go-mod-graph)
- Fix [open issues](https://github.com/samber/go-mod-graph/issues) or request new features

Don't hesitate ;)

## 👤 Contributors

![Contributors](https://contrib.rocks/image?repo=samber/go-mod-graph)

## 💫 Show your support

Give a ⭐️ if this project helped you!

[![GitHub Sponsors](https://img.shields.io/github/sponsors/samber?style=for-the-badge)](https://github.com/sponsors/samber)

## 📝 License

Copyright © 2026 [Samuel Berthe](https://github.com/samber).

This project is [MIT](./LICENSE) licensed.
