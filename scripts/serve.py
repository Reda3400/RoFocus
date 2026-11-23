#!/usr/bin/env python3
"""Serve the finished site and stop a few seconds after its tab closes.

The page pings /__heartbeat while it is open; closing the tab stops the pings
and this process exits, so the launcher's background terminal goes with it.
"""
import os
import sys
import time
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

root, port = sys.argv[1], int(sys.argv[2])
state = {"seen": False, "last": time.monotonic()}
IDLE_SECONDS = 6

BEACON = """<script>
(function () {
  var ping = function () {
    fetch('/__heartbeat', { cache: 'no-store' }).catch(function () {});
  };
  ping();
  var timer = setInterval(ping, 2000);
  window.addEventListener('pagehide', function () { clearInterval(timer); });
})();
</script>"""


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path == '/__heartbeat':
            state["seen"] = True
            state["last"] = time.monotonic()
            self.send_response(204)
            self.end_headers()
            return
        if path in ('/', '/index.html'):
            try:
                with open(os.path.join(root, 'index.html'), 'rb') as source:
                    html = source.read().replace(b'</body>', BEACON.encode() + b'</body>')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(html)))
                self.end_headers()
                self.wfile.write(html)
                return
            except OSError:
                pass
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *args):
        pass


def watchdog():
    while True:
        time.sleep(1)
        idle = time.monotonic() - state["last"]
        if (state["seen"] and idle > IDLE_SECONDS) or (not state["seen"] and idle > 120):
            os._exit(0)


threading.Thread(target=watchdog, daemon=True).start()
ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=root)).serve_forever()
