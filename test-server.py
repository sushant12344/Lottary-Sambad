#!/usr/bin/env python3
"""
Simple HTTP server for testing the lottery website locally.
This allows proper testing of the responsive design and mobile layout.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for better testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Override to reduce console spam
        return

def start_server(port=8000):
    """Start a simple HTTP server for testing"""
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Server starting at http://localhost:{port}")
            print(f"📱 For mobile testing, use: http://localhost:{port}")
            print(f"🔧 Use browser dev tools to test mobile responsiveness")
            print("\nPress Ctrl+C to stop the server")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{port}')
            except:
                pass
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048 or e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Trying port {port + 1}...")
            start_server(port + 1)
        else:
            print(f"❌ Error starting server: {e}")
            sys.exit(1)

if __name__ == "__main__":
    # Change to the directory containing the HTML files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    start_server()
