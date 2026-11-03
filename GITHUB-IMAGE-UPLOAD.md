# Загрузка фотографий из админки прямо в GitHub

Админка может отправлять изображения в GitHub через Supabase Edge Function. GitHub-токен хранится только в серверных секретах и никогда не попадает в браузер.

## Однократная настройка

### 1. Создай GitHub fine-grained token

Открой GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.

- Resource owner: `valbr-dev`
- Repository access: Only select repositories → `visisite`
- Repository permissions: **Contents — Read and write**
- Metadata — Read-only (обычно включается автоматически)

Скопируй токен. Не отправляй его в чат и не добавляй в файлы репозитория.

### 2. Добавь секреты Supabase

В Supabase открой Edge Functions → Secrets и добавь:

- `GITHUB_TOKEN` — созданный GitHub token
- `ADMIN_EMAIL` — точный email учётной записи администратора Supabase Auth

Опционально (в коде уже заданы значения по умолчанию):
- `GITHUB_OWNER` = `valbr-dev`
- `GITHUB_REPO` = `visisite`
- `GITHUB_BRANCH` = `main`

`SUPABASE_URL` и `SUPABASE_ANON_KEY` доступны Edge Functions автоматически.

### 3. Разверни функцию

Из корня локальной копии репозитория выполни:

```bash
supabase login
supabase link --project-ref wqoenkjofkhgvqhvvamw
supabase functions deploy upload-image
```

Либо используй Supabase CLI из своего окружения. Файл функции находится в `supabase/functions/upload-image/index.ts`.

## Как пользоваться

В админке открой раздел с фотографией и нажми **«Загрузить с устройства»**. Поддерживаются JPG, PNG, WebP и AVIF до 8 МБ. Фото появится в GitHub в папке `images`, ссылка автоматически запишется в контент Supabase. GitHub Pages может публиковать новый файл 1–2 минуты.

Загрузка доступна только вошедшему пользователю, чей email совпадает с серверным секретом `ADMIN_EMAIL`.
