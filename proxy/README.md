# Go Module Graph Proxy

A simple Go proxy server to bypass proxy.golang.org CDN restrictions when accessing Go module proxies from the browser.

## Features

- **CORS-enabled**: Allows cross-origin requests from your frontend
- **Configurable proxy**: Forward requests to any Go module proxy (defaults to proxy.golang.org)
- **Static file serving**: Also serves the frontend built files
- **Health check endpoint**: `/health` for monitoring

## Installation

```bash
cd proxy
go mod init go-mod-graph-proxy
go get .
```

## Usage

### Development

```bash
# From the proxy directory
go run main.go
```

The server will start on `http://localhost:8080`

### API Endpoints

#### Proxy Request

```
GET /proxy?path=<module_path>&proxy=<proxy_url>
```

Parameters:
- `path` (required): The Go module path to proxy (e.g., `/github.com/stretchr/testify/@v/list`)
- `proxy` (optional): The target Go module proxy URL (defaults to `https://proxy.golang.org`)

Example:
```
GET http://localhost:8080/proxy?path=/github.com/stretchr/testify/@v/list
```

#### Health Check

```
GET /health
```

Returns:
```json
{"status":"ok","service":"go-mod-graph-proxy"}
```

## Integrating with Frontend

Update your `src/services/goProxy.ts` to use the local proxy:

```typescript
const fetchFromProxy = async (proxyUrl: string, path: string): Promise<any> => {
  // Use local proxy instead of direct call
  const localProxyUrl = 'http://localhost:8080';
  const url = `${localProxyUrl}/proxy?path=${encodeURIComponent(path)}&proxy=${encodeURIComponent(proxyUrl)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.text();
};
```

## Building

```bash
go build -o go-mod-graph-proxy main.go
./go-mod-graph-proxy
```

## Configuration

You can modify the following constants in `main.go`:
- `defaultProxyURL`: Default Go module proxy to use
- `port`: Port to listen on
