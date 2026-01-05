package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	defaultProxyURL = "https://proxy.golang.org"
	defaultPort     = "8080"
)

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	allowedOrigins, ok := os.LookupEnv("ALLOWED_ORIGINS")
	if !ok {
		allowedOrigins = "*"
	}
	w.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
	w.Header().Set("Access-Control-Allow-Methods", "HEAD, GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Get target proxy address from query param (default to proxy.golang.org)
	targetProxy := r.URL.Query().Get("proxy")
	if targetProxy == "" {
		targetProxy = defaultProxyURL
	}

	// Get the path to proxy
	path := r.URL.Query().Get("path")
	if path == "" {
		http.Error(w, "Missing 'path' parameter", http.StatusBadRequest)
		return
	}

	// Ensure path starts with /
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	// Build the target URL
	targetURL, err := url.Parse(targetProxy)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid proxy URL: %v", err), http.StatusBadRequest)
		return
	}

	// Construct the full target URL
	targetURL.Path = path
	targetURL.RawQuery = r.URL.RawQuery

	// Remove our custom query params from the forwarded request
	q := targetURL.Query()
	q.Del("proxy")
	q.Del("path")
	targetURL.RawQuery = q.Encode()

	// Create the HTTP request with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create new request with body if present
	var body io.Reader
	if r.Body != nil {
		body = r.Body
	}
	proxyReq, err := http.NewRequest(r.Method, targetURL.String(), body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create request: %v", err), http.StatusInternalServerError)
		return
	}

	// Copy relevant headers
	if accept := r.Header.Get("Accept"); accept != "" {
		proxyReq.Header.Set("Accept", accept)
	}
	if acceptEncoding := r.Header.Get("Accept-Encoding"); acceptEncoding != "" {
		proxyReq.Header.Set("Accept-Encoding", acceptEncoding)
	}
	if userAgent := r.Header.Get("User-Agent"); userAgent != "" {
		proxyReq.Header.Set("User-Agent", userAgent)
	}

	// Execute the request
	resp, err := client.Do(proxyReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("Proxy request failed: %v", err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy all response headers (including Content-Length, Content-Encoding, etc.)
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.Header().Set("Content-Length", resp.Header.Get("Content-Length"))
	w.Header().Set("Content-Encoding", resp.Header.Get("Content-Encoding"))

	// Add Cache-Control header unless URL contains "latest" or "list"
	if !strings.Contains(targetURL.String(), "latest") && !strings.Contains(targetURL.String(), "list") {
		w.Header().Set("Cache-Control", "public, max-age=3600")
	}

	// Write status code (must be after setting headers, before writing body)
	w.WriteHeader(resp.StatusCode)

	// Copy response body
	_, err = io.Copy(w, resp.Body)
	if err != nil {
		log.Printf("Error copying response: %v", err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"ok","service":"go-mod-graph-proxy"}`)
}

func main() {
	// Register handlers
	http.HandleFunc("/proxy", proxyHandler)
	http.HandleFunc("/health", healthHandler)

	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = defaultPort
	}
	addr := ":" + port

	log.Printf("Go Module Graph Proxy starting on %s", addr)
	log.Printf("Proxy endpoint: http://localhost%s/proxy?path=<module_path>&proxy=<proxy_url>", addr)
	log.Printf("Serving static files from: ../dist")
	log.Printf("Default proxy: %s", defaultProxyURL)

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}
