# Типограф

[Открыть сайт](https://typograf.github.io)

## Разработка

Нужен Node.js 24.22.1 или новее. Для nvm версия указана в `.nvmrc`.

```sh
npm ci
npm test
npm run build
python3 -m http.server 8000
```

Откройте `http://localhost:8000`. Сборка создаёт корневой `index.html` и файлы в `dist/`.

При сборке Preact заранее создаёт HTML редактора, переключателя языка и ссылки на расширение в `index.html`. В браузере приложение подключается к готовой разметке и выбирает ссылку на расширение для текущего браузера. Статья, метаданные и остальные ссылки остаются в исходном HTML (`src/html/index.html`), поэтому текст доступен поисковым системам без выполнения JavaScript. Отдельный сервер для публикации не нужен.

## CI и публикация

Workflow `.github/workflows/pages.yml` запускается для pull request в `master` и при push в `master`. Он устанавливает зависимости, собирает сайт и выполняет `npm test`, который включает ESLint, проверку типов и Vitest. После успешных проверок push в `master` публикует свежую сборку в GitHub Pages. Публикуются только `index.html`, нужные файлы из `dist/`, иконки, манифест, `robots.txt`, `sitemap.xml` и favicon.

В настройках репозитория **Settings → Pages → Build and deployment → Source** один раз выберите **GitHub Actions**. Pull request проверяется без публикации.
