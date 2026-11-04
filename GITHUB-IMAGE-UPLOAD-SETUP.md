# Загрузка фотографий из админки в GitHub

Админка отправляет изображение в Supabase Edge Function `upload-image`. Функция проверяет авторизованного администратора и использует GitHub-токен на серверной стороне. Токен никогда не передаётся браузеру.

## 1. Создать GitHub token

Создай Fine-grained personal access token:
- Resource owner: владелец репозитория.
- Repository access: Only select repositories → `valbr-dev/visisite`.
- Repository permissions → Contents → Read and write.
- Другие разрешения не нужны.

## 2. Добавить секреты в Supabase

Открой Supabase Dashboard → проект АРМАДА → Edge Functions → Secrets (или Project Settings → Edge Functions → Secrets) и добавь:

- `GITHUB_TOKEN` — созданный GitHub token.
- `ADMIN_EMAIL` — точный email учётной записи, которой ты входишь в админку.

Не добавляй GitHub token в `supabase-config.js`, HTML, JavaScript или GitHub.

## 3. Развернуть функцию

В Supabase Dashboard открой Edge Functions → Deploy a new function → Via Editor, создай функцию с именем `upload-image` и вставь содержимое файла:

`supabase/functions/upload-image/index.ts`

В настройках функции выключи встроенную опцию Verify JWT (OFF): функция сама проверяет пользовательскую сессию через Supabase Auth и сверяет email с ADMIN_EMAIL. Это также позволяет избежать несовместимости встроенной старой JWT-проверки с новыми ключами подписи Supabase. Не делай функцию публичной: проверка пользователя внутри кода обязательна.

## 4. Использование

Открой админку, войди, выбери раздел с фотографией и нажми «Выбрать и загрузить фото». Поддерживаются JPG, PNG и WebP до 4 МБ. После успешной загрузки функция вернёт GitHub Pages URL, админка подставит его и сохранит ссылку в `site_content`.

Фотографии загружаются в `images/uploads/`. Старые файлы не удаляются автоматически.
