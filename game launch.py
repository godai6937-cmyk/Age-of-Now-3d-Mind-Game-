import http.server
import socketserver
import webbrowser
import os

# Your exact game folder location
GAME_DIR = r"C:\Users\User\Desktop\new billing software Final 08-03-26\GAME"
PORT = 8000

# Change the working directory to your game folder
if os.path.exists(GAME_DIR):
    os.chdir(GAME_DIR)
else:
    print(f"❌ Error: Could not find the folder at {GAME_DIR}")
    print("Please double-check that the path is exactly correct.")
    input("\nPress Enter to exit...")
    exit()

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disables browser caching so game updates show up instantly
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

# Automatically open your web browser to the game
webbrowser.open(f'http://localhost:{PORT}')

print(f"Game server successfully started for: {GAME_DIR}")
print(f"Running at: http://localhost:{PORT}")
print("Keep this window open while playing. Press CTRL+C to stop.")

# Start the server
with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped smoothly.")