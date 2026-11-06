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

При сборке Preact заранее создаёт HTML редактора, переключателя языка и ссылки на расширение в `index.html`. В браузере приложение подключается к готовой разметке и выбирает ссылку на расширение для текущего браузера. Статья и метаданные вставляются в шаблон `src/html/index.html` при сборке, поэтому текст доступен поисковым системам без выполнения JavaScript. Отдельный сервер для публикации не нужен.

## CI и публикация

Workflow `.github/workflows/tests.yml` выполняет `npm test` при push в рабочие ветки и для pull request в `master`. Команда включает ESLint, проверку типов, сборку и Vitest. Workflow `.github/workflows/pages.yml` вызывает те же проверки и публикует сборку только из `master`. Публикуются только `index.html`, нужные файлы из `dist/`, иконки, манифест, `robots.txt`, `sitemap.xml` и favicon.

В настройках репозитория **Settings → Pages → Build and deployment → Source** один раз выберите **GitHub Actions**. Pull request проверяется без публикации.
