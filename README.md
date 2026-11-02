# Типограф

[Открыть сайт](https://typograf.github.io)

## Разработка

Нужен Node.js `^20.19.0`, `^22.13.0` или `>=24`.

```sh
npm ci
npm test
npm run build
python3 -m http.server 8000
```

Откройте `http://localhost:8000`. Сборка создаёт корневой `index.html` и файлы в `dist/`.

Интерактивный редактор и настройки находятся в Preact-корне `#app`, переключатель языка — в `#language-selector`. Статья, метаданные и остальные ссылки остаются в исходном HTML (`src/html/index.html`).
