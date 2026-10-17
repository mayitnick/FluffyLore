"""
Скрипт сборки автономного Single-File HTML документа LoreHelper_Standalone.html
Объединяет index.html, style.css и app.js в единый файл без внешних зависимостей.
"""
import os

def build():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    html_path = os.path.join(base_dir, "index.html")
    css_path = os.path.join(base_dir, "style.css")
    js_path = os.path.join(base_dir, "app.js")
    out_path = os.path.join(base_dir, "LoreHelper_Standalone.html")

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()

    # Заменяем внешнее подключение CSS на инлайновый <style>
    html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css}\n</style>')

    # Заменяем внешнее подключение JS на инлайновый <script>
    html = html.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Готово! Создан автономный файл: {out_path} ({os.path.getsize(out_path)} байт)")

if __name__ == "__main__":
    build()
