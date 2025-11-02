# Руководство по развертыванию

Это руководство поможет вам развернуть ICT Shipment Management System на различных платформах.

## 📋 Содержание

- [Локальная разработка](#локальная-разработка)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [GitHub Pages](#github-pages)
- [Docker](#docker)

## 🔧 Подготовка

Перед развертыванием убедитесь, что:

1. ✅ Проект собирается без ошибок (`npm run build`)
2. ✅ Настроены переменные окружения
3. ✅ База данных Supabase создана и настроена
4. ✅ Получены API ключи (ShipEngine)

## 💻 Локальная разработка

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/ваш-username/ict.git
cd ict

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env

# Отредактировать .env файл с вашими ключами
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_SHIPENGINE_API_KEY=...

# Запустить dev-сервер
npm run dev
```

Приложение будет доступно на `http://localhost:5173`

## ☁️ Vercel

### Развертывание через UI

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте ваш GitHub репозиторий
4. Настройте переменные окружения:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SHIPENGINE_API_KEY`
5. Нажмите "Deploy"

### Развертывание через CLI

```bash
# Установить Vercel CLI
npm i -g vercel

# Войти в аккаунт
vercel login

# Развернуть
vercel

# Для production
vercel --prod
```

### Настройка переменных через CLI

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_SHIPENGINE_API_KEY
```

## 🌐 Netlify

### Развертывание через UI

1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите "Add new site" → "Import an existing project"
3. Выберите ваш GitHub репозиторий
4. Настройте сборку:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Добавьте переменные окружения в Settings → Environment
6. Нажмите "Deploy"

### Развертывание через CLI

```bash
# Установить Netlify CLI
npm i -g netlify-cli

# Войти в аккаунт
netlify login

# Инициализировать проект
netlify init

# Развернуть
netlify deploy --prod
```

### netlify.toml (опционально)

Создайте файл `netlify.toml` в корне проекта:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📄 GitHub Pages

### Настройка vite.config.ts

Обновите `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ict/', // Замените на название вашего репозитория
})
```

### Автоматическое развертывание

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_SHIPENGINE_API_KEY: ${{ secrets.VITE_SHIPENGINE_API_KEY }}
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Настройка GitHub Secrets

1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте секреты:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SHIPENGINE_API_KEY`

### Включить GitHub Pages

1. Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `gh-pages` / `root`

## 🐳 Docker

### Dockerfile

Создайте `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

Создайте `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_SHIPENGINE_API_KEY=${VITE_SHIPENGINE_API_KEY}
    restart: unless-stopped
```

### Команды Docker

```bash
# Сборка образа
docker build -t ict-shipment .

# Запуск контейнера
docker run -p 3000:80 ict-shipment

# Или с docker-compose
docker-compose up -d
```

## 🗄️ Настройка Supabase

### Создание таблицы

```sql
-- Создать таблицу shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Booked', 'In Transit', 'Delivered')),
  carrier TEXT NOT NULL,
  goods_info TEXT,
  price DECIMAL(10, 2),
  current_location JSONB NOT NULL,
  estimated_arrival TIMESTAMP,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Создать индексы
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);

-- Создать функцию обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создать триггер
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS)

```sql
-- Включить RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все могут читать)
CREATE POLICY "Allow public read access" ON shipments
  FOR SELECT USING (true);

-- Политика для создания (все могут создавать)
CREATE POLICY "Allow public insert access" ON shipments
  FOR INSERT WITH CHECK (true);

-- Для production рекомендуется настроить аутентификацию
```

## 🔍 Проверка развертывания

После развертывания проверьте:

- [ ] Приложение загружается без ошибок
- [ ] Можно создать новую отправку
- [ ] Карта отображается корректно
- [ ] API запросы работают
- [ ] Нет ошибок в консоли браузера

## 🐛 Устранение неполадок

### Белый экран после развертывания
- Проверьте `base` в `vite.config.ts`
- Проверьте настройки CORS в Supabase
- Проверьте переменные окружения

### API ошибки
- Убедитесь, что все API ключи добавлены
- Проверьте ограничения CORS в настройках API
- Проверьте логи в консоли

### Проблемы с картой
- Убедитесь, что Leaflet CSS загружается
- Проверьте настройки Content Security Policy

## 📚 Дополнительные ресурсы

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

💡 **Совет**: Всегда тестируйте сборку локально перед развертыванием с помощью `npm run build && npm run preview`
