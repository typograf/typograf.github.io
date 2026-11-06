# Типограф

[Открыть сайт](https://typograf.github.io)

## Разработка

Нужен Node.js 24.22.1 или новее. Для nvm версия указана в `.nvmrc`.

```sh
npm ci
npm test
python3 -m http.server 8000
```

Откройте `http://localhost:8000`. `npm test` запускает проверки и сборку, создающую корневой `index.html` и файлы в `dist/`. Для отдельной сборки используйте `npm run build`. Сгенерированный `index.html` не хранится в Git.
