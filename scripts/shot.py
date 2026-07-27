"""
Captura a página com emulação de dispositivo REAL via CDP.

O --window-size do Chrome headless no Windows não desce abaixo de ~504px de
largura de layout, então ele não serve para testar mobile. Aqui a viewport é
forçada por Emulation.setDeviceMetricsOverride, que é o que o DevTools usa.

uso: python shot.py <url> <saida.png> [largura] [altura] [--full]
"""
import json, subprocess, sys, time, urllib.request, socket, os, base64
import websocket

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def porta_livre():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def capturar(url, saida, largura=390, altura=844, pagina_inteira=False):
    porta = porta_livre()
    perfil = os.path.join(os.environ["TEMP"], f"cdp-{porta}")
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
         f"--remote-debugging-port={porta}", f"--user-data-dir={perfil}",
         "--remote-allow-origins=*",  # senão o Chrome recusa o handshake do CDP
         "--hide-scrollbars", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    try:
        alvo = None
        for _ in range(60):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{porta}/json") as r:
                    abas = json.load(r)
                alvo = next((a for a in abas if a["type"] == "page"), None)
                if alvo:
                    break
            except Exception:
                pass
            time.sleep(0.25)
        if not alvo:
            raise RuntimeError("Chrome não subiu a interface de depuração")

        ws = websocket.create_connection(alvo["webSocketDebuggerUrl"], timeout=30)
        n = [0]

        def cmd(metodo, params=None):
            n[0] += 1
            ws.send(json.dumps({"id": n[0], "method": metodo, "params": params or {}}))
            while True:
                msg = json.loads(ws.recv())
                if msg.get("id") == n[0]:
                    return msg.get("result", {})

        cmd("Page.enable")
        cmd("Emulation.setDeviceMetricsOverride", {
            "width": largura, "height": altura,
            "deviceScaleFactor": 2, "mobile": True,
        })
        cmd("Emulation.setTouchEmulationEnabled", {"enabled": True})
        cmd("Page.navigate", {"url": url})
        time.sleep(4.0)

        # Mede o quanto a página passa da largura da tela: é o teste que pega
        # estouro horizontal, que no celular vira barra de rolagem lateral.
        r = cmd("Runtime.evaluate", {
            "expression": """(() => {
              const d = document.documentElement;
              const culpados = [];
              for (const el of document.querySelectorAll('body *')) {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.right > d.clientWidth + 1) {
                  culpados.push(el.tagName.toLowerCase()
                    + (el.className && typeof el.className === 'string'
                       ? '.' + el.className.trim().split(/\\s+/).slice(0,3).join('.') : '')
                    + ' -> ' + Math.round(r.right) + 'px');
                }
              }
              return JSON.stringify({
                innerWidth: window.innerWidth,
                scrollWidth: d.scrollWidth,
                clientWidth: d.clientWidth,
                estouram: culpados.slice(0, 12)
              });
            })()""",
            "returnByValue": True,
        })
        diag = json.loads(r["result"]["value"])
        print(json.dumps(diag, indent=2, ensure_ascii=False))

        params = {"format": "png"}
        if pagina_inteira:
            params["captureBeyondViewport"] = True
        shot = cmd("Page.captureScreenshot", params)
        open(saida, "wb").write(base64.b64decode(shot["data"]))
        print("salvo:", saida)
        ws.close()
    finally:
        proc.terminate()


if __name__ == "__main__":
    url, saida = sys.argv[1], sys.argv[2]
    w = int(sys.argv[3]) if len(sys.argv) > 3 else 390
    h = int(sys.argv[4]) if len(sys.argv) > 4 else 844
    capturar(url, saida, w, h, "--full" in sys.argv)
