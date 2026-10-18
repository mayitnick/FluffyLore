"""
Скрипт сборки автономного Single-File HTML документа FluffyLore_Standalone.html
Объединяет index.html, style.css и app.js в единый файл без внешних зависимостей.
Автоматически считывает текущий git commit hash и внедряет его в шапку.
"""
import os
import re
import subprocess

def get_git_commit():
    try:
        res = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], stderr=subprocess.DEVNULL)
        return res.decode("utf-8").strip()
    except Exception:
        return "latest"

def build():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    commit_hash = get_git_commit()
    
    html_path = os.path.join(base_dir, "index.html")
    css_path = os.path.join(base_dir, "style.css")
    js_path = os.path.join(base_dir, "app.js")
    out_path = os.path.join(base_dir, "FluffyLore_Standalone.html")

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()

    # Внедряем актуальный хэш коммита через регулярные выражения
    js = re.sub(r"const APP_BUILD_COMMIT = '[^']*';", f"const APP_BUILD_COMMIT = '{commit_hash}';", js)
    html = re.sub(r'id="app-commit-hash">[^<]*</span>', f'id="app-commit-hash">{commit_hash}</span>', html)

    # Обновляем исходные app.js и index.html
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    # Заменяем внешнее подключение CSS на инлайновый <style>
    standalone_html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css}\n</style>')

    # Заменяем внешнее подключение JS на инлайновый <script>
    standalone_html = standalone_html.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(standalone_html)

    print(f"Готово! Создан автономный файл: {out_path} ({os.path.getsize(out_path)} байт) [commit: {commit_hash}]")

    print(f"Готово! Создан автономный файл: {out_path} ({os.path.getsize(out_path)} байт) [commit: {commit_hash}]")

if __name__ == "__main__":
    build()
