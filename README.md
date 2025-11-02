# 🚢 ICT Shipment Management System

Современная система управления и отслеживания грузоперевозок с интерактивной картой и интеграцией с логистическими API.

Для ICT assigment
Bekzat
Diyar
Didar

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan?logo=tailwindcss)

## 📋 Описание

ICT Shipment Management System - это веб-приложение для управления грузоперевозками с возможностью:

- Создания и отслеживания грузоперевозок
- Просмотра маршрутов на интерактивной карте
- Получения расчетов стоимости от разных перевозчиков
- Фильтрации грузов по статусу
- Реального времени обновления местоположения

## ✨ Возможности

- **📦 Управление грузами**: Создание, просмотр и отслеживание грузоперевозок
- **🗺️ Интерактивная карта**: Визуализация маршрутов с помощью Leaflet/OpenStreetMap
- **💰 Расчет стоимости**: Интеграция с ShipEngine API для получения тарифов перевозчиков
- **🔍 Поиск городов**: Автоматический поиск городов через Nominatim API
- **📊 Фильтрация**: Фильтрация грузов по статусу (Booked, In Transit, Delivered)
- **🎨 Современный UI**: Темная тема с TailwindCSS и Lucide Icons
- **⚡ Быстрая разработка**: Vite для мгновенного HMR

## 🛠️ Технологии

### Frontend

- **React 18.3** - UI библиотека
- **TypeScript 5.5** - Типизированный JavaScript
- **Vite 5.4** - Сборщик и dev-сервер
- **TailwindCSS 3.4** - Utility-first CSS фреймворк
- **React Leaflet 4.2** - Интерактивные карты
- **Lucide React** - Иконки

### Backend & APIs

- **Supabase** - Backend as a Service (база данных, аутентификация)
- **ShipEngine API** - Расчет тарифов перевозчиков
- **Nominatim API** - Геокодирование и поиск городов
- **Axios** - HTTP клиент

## 📁 Структура проекта

```
ict/
├── src/
│   ├── components/          # React компоненты
│   │   ├── CitySearch.tsx          # Поиск городов
│   │   ├── CreateShipmentFlow.tsx  # Создание груза
│   │   ├── MapView.tsx             # Карта с маршрутом
│   │   └── ShipmentsOverview.tsx   # Список грузов
│   ├── services/
│   │   └── api.ts           # API сервисы
│   ├── types/
│   │   └── index.ts         # TypeScript типы
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   └── index.css            # Глобальные стили
├── public/                  # Статические файлы
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ и npm/yarn
- Git

### Установка

1. **Клонируйте репозиторий**

```bash
git clone https://github.com/ваш-username/ict.git
cd ict
```

2. **Установите зависимости**

```bash
npm install
```

3. **Настройте переменные окружения**
   Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SHIPENGINE_API_KEY=your_shipengine_api_key
```

4. **Запустите dev-сервер**

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

## 📦 Команды

```bash
npm run dev      # Запустить dev-сервер
npm run build    # Собрать для production
npm run preview  # Предпросмотр production сборки
npm run lint     # Проверить код линтером
```

## 🗄️ База данных

### Supabase Schema

```sql
-- Таблица shipments
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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);
```

## 🔧 Конфигурация API

### ShipEngine API

1. Зарегистрируйтесь на [ShipEngine](https://www.shipengine.com/)
2. Получите API ключ
3. Добавьте в `.env` как `VITE_SHIPENGINE_API_KEY`

### Supabase

1. Создайте проект на [Supabase](https://supabase.com/)
2. Создайте таблицу `shipments` (схема выше)
3. Добавьте URL и ключ в `.env`

## 🎨 Компоненты

### ShipmentsOverview

Главный компонент для отображения списка грузоперевозок с фильтрацией по статусу.

### CreateShipmentFlow

Многошаговая форма создания груза:

1. Выбор городов отправления/назначения
2. Описание груза
3. Выбор перевозчика и тарифа
4. Подтверждение

### MapView

Интерактивная карта с маркерами и линией маршрута между городами.

### CitySearch

Компонент автокомплита для поиска городов через Nominatim API.

## 🌐 API Endpoints

```typescript
// Получить все грузы (с фильтрацией)
GET /api/shipments?status=In Transit

// Получить груз по ID
GET /api/shipments/:id

// Создать груз
POST /api/shipments
{
  "origin": "Moscow",
  "destination": "Saint Petersburg",
  "goodsInfo": "Electronics",
  "selectedCarrier": {
    "carrierName": "DHL",
    "price": 150
  }
}

// Получить тарифы перевозчиков
POST /api/carriers/rates
{
  "origin": "Moscow",
  "destination": "Saint Petersburg"
}
```

## 🧪 Типы данных

```typescript
interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: "Booked" | "In Transit" | "Delivered";
  carrier: string;
  currentLocation: Location;
  estimatedArrival?: string;
  progress?: number;
}

interface Location {
  lat: number;
  lon: number;
}

interface CarrierRate {
  carrierName: string;
  price: number;
  days: number;
}
```

## 🎯 Планы развития

- [ ] Аутентификация пользователей
- [ ] Уведомления о смене статуса груза
- [ ] История изменений груза
- [ ] Экспорт данных в PDF/Excel
- [ ] Мобильное приложение
- [ ] Интеграция с дополнительными перевозчиками
- [ ] Аналитика и отчеты
- [ ] Multi-language support

## 🤝 Вклад в проект

Мы приветствуем вклад в проект! Пожалуйста:

1. Сделайте Fork проекта
2. Создайте feature ветку (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 👥 Авторы

- Bekzat
- Diyar
- Didar

## 📧 Контакты

Вопросы и предложения: bekzatuteulin@gmail.com

## 🙏 Благодарности

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/)
- [Supabase](https://supabase.com/)
- [ShipEngine](https://www.shipengine.com/)

---

⭐ Поставьте звезду, если проект был полезен!
