import os

# Gunicorn configuration optimized for Render Free Tier (512MB RAM constraint)

# Single worker process to prevent duplicating PyTorch in multiple processes
workers = 1

# 2 threads share the single in-memory model across concurrent requests
threads = 2

# Port binding from Render's $PORT environment variable
port = os.environ.get("PORT", "10000")
bind = f"0.0.0.0:{port}"

# Generous timeout for deep learning inference
timeout = 120

# Keep-alive connections
keepalive = 5

# Ensure master does not preload the app to save startup memory overhead
preload_app = False

# Maximum requests per worker before restarting (prevents memory fragmentation)
max_requests = 250
max_requests_jitter = 25
