import http.server
import os
import socket
import socketserver
import sys
import threading
import time
import webbrowser


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
START_PORT = 5200
HOST = "0.0.0.0"


class LoveHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format, *args):
        pass


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def pick_server():
    for port in range(START_PORT, START_PORT + 20):
        try:
            server = ReusableTCPServer((HOST, port), LoveHandler)
            return server, port
        except OSError:
            continue
    raise RuntimeError("No free port found from 5200 to 5219.")


def get_lan_ips():
    ips = set()

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            ips.add(sock.getsockname()[0])
    except OSError:
        pass

    try:
        for item in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = item[4][0]
            if not ip.startswith("127."):
                ips.add(ip)
    except OSError:
        pass

    return sorted(ips)


def write_share_file(port):
    local_url = "http://127.0.0.1:{}/".format(port)
    lan_urls = ["http://{}:{}/".format(ip, port) for ip in get_lan_ips()]
    title = "\u8d75\u6c38\u4e50 & \u5218\u6676\u6676\u7684\u7231\u60c5\u7f51\u9875"
    lines = [
        title,
        "",
        "\u81ea\u5df1\u7535\u8111\u6253\u5f00\uff1a",
        local_url,
        "",
        "\u540c\u4e00\u4e2a Wi-Fi / \u540c\u4e00\u4e2a\u5c40\u57df\u7f51\u5185\uff0c\u5bf9\u8c61\u53ef\u590d\u5236\u6253\u5f00\uff1a",
    ]
    lines.extend(lan_urls or ["\u6ca1\u6709\u68c0\u6d4b\u5230\u5c40\u57df\u7f51\u5730\u5740\uff0c\u8bf7\u786e\u8ba4\u5df2\u8fde\u63a5 Wi-Fi\u3002"])
    lines.extend([
        "",
        "\u6ce8\u610f\uff1a\u8fd9\u4e2a\u9ed1\u8272\u7a97\u53e3\u4e0d\u8981\u5173\uff0c\u5173\u6389\u540e\u94fe\u63a5\u5c31\u4e0d\u80fd\u8bbf\u95ee\u4e86\u3002",
        "\u5982\u679c\u5bf9\u8c61\u4e0d\u5728\u540c\u4e00\u4e2a Wi-Fi\uff0c\u9700\u8981\u628a\u7f51\u7ad9\u53d1\u5e03\u5230\u516c\u7f51\u6216\u628a\u6574\u4e2a love_net \u6587\u4ef6\u5939\u53d1\u7ed9\u5bf9\u65b9\u3002",
    ])

    path = os.path.join(BASE_DIR, "share_link.txt")
    with open(path, "w", encoding="utf-8-sig") as file:
        file.write("\n".join(lines))
    return local_url, lan_urls, path


def open_browser(url):
    time.sleep(0.8)
    webbrowser.open(url)


def main():
    os.chdir(BASE_DIR)
    server, port = pick_server()
    local_url, lan_urls, share_path = write_share_file(port)

    print("")
    print("Love website is running.")
    print("Open on this computer: {}".format(local_url))
    print("")
    print("Share on the same Wi-Fi:")
    if lan_urls:
        for url in lan_urls:
            print(url)
    else:
        print("No LAN IP detected.")
    print("")
    print("The links are saved in: {}".format(share_path))
    print("Keep this window open. Press Ctrl + C to stop the website.")
    print("")

    if "--no-browser" not in sys.argv:
        threading.Thread(target=open_browser, args=(local_url,), daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("")
        print("Love website stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
