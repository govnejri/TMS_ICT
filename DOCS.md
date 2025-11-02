# 📚 Документация проекта ICT

Добро пожаловать в документацию проекта ICT Shipment Management System!

## 📖 Содержание документации

### Основные документы

1. **[README.md](README.md)** - Главная страница проекта
   - Описание проекта
   - Возможности
   - Технологии
   - Быстрый старт
   - Структура проекта

2. **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - Загрузка на GitHub
   - Пошаговая инструкция
   - Настройка Git
   - Создание репозитория
   - Первый коммит

3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Развертывание
   - Vercel
   - Netlify
   - GitHub Pages
   - Docker
   - Настройка Supabase

4. **[CONTRIBUTING.md](CONTRIBUTING.md)** - Как внести вклад
   - Процесс разработки
   - Стандарты кода
   - Pull Request процесс
   - Стиль коммитов

5. **[CHANGELOG.md](CHANGELOG.md)** - История изменений
   - Версии релизов
   - Новые функции
   - Исправления

6. **[SECURITY.md](SECURITY.md)** - Безопасность
   - Отчет об уязвимостях
   - Лучшие практики
   - Поддерживаемые версии

7. **[LICENSE](LICENSE)** - Лицензия MIT

## 🗂️ Структура документов GitHub

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml        # Шаблон для сообщений об ошибках
│   └── feature_request.yml   # Шаблон для запросов функций
├── workflows/
│   └── ci.yml                # CI/CD конфигурация
└── pull_request_template.md  # Шаблон Pull Request
```

## 🚀 Быстрые ссылки

### Для начала работы
- Хотите начать разработку? → [README.md](README.md#быстрый-старт)
- Загрузить на GitHub? → [GITHUB_SETUP.md](GITHUB_SETUP.md)
- Развернуть в production? → [DEPLOYMENT.md](DEPLOYMENT.md)

### Для контрибьюторов
- Хотите помочь проекту? → [CONTRIBUTING.md](CONTRIBUTING.md)
- Нашли ошибку? → [Создать Issue](../../issues/new?template=bug_report.yml)
- Есть идея? → [Запросить функцию](../../issues/new?template=feature_request.yml)

### Для безопасности
- Нашли уязвимость? → [SECURITY.md](SECURITY.md)

## 📂 Структура кода

```
src/
├── components/          # React компоненты
│   ├── CitySearch.tsx          # Поиск городов с автокомплитом
│   ├── CreateShipmentFlow.tsx  # Многошаговая форма создания
│   ├── MapView.tsx             # Карта с маршрутом
│   └── ShipmentsOverview.tsx   # Список и фильтрация грузов
├── services/
│   └── api.ts           # API сервисы (Supabase, ShipEngine, Nominatim)
├── types/
│   └── index.ts         # TypeScript типы и интерфейсы
├── App.tsx              # Главный компонент приложения
├── main.tsx             # Точка входа React
└── index.css            # Глобальные стили (Tailwind)
```

## 🔧 Конфигурационные файлы

| Файл | Назначение |
|------|------------|
| `vite.config.ts` | Конфигурация Vite |
| `tsconfig.json` | Настройки TypeScript |
| `tailwind.config.js` | Конфигурация TailwindCSS |
| `eslint.config.js` | Правила ESLint |
| `postcss.config.js` | PostCSS плагины |
| `package.json` | Зависимости и скрипты |

## 🎯 Основные компоненты

### ShipmentsOverview
**Файл**: `src/components/ShipmentsOverview.tsx`

Главная страница со списком всех грузоперевозок.

**Функции**:
- Отображение списка грузов
- Фильтрация по статусу
- Кнопка создания нового груза
- Навигация к отслеживанию

**Props**:
```typescript
interface ShipmentsOverviewProps {
  onCreateShipment: () => void;
  onTrackShipment: (shipment: Shipment) => void;
}
```

### CreateShipmentFlow
**Файл**: `src/components/CreateShipmentFlow.tsx`

Многошаговая форма для создания груза.

**Шаги**:
1. Выбор городов (origin, destination)
2. Информация о грузе
3. Выбор перевозчика и тарифа
4. Подтверждение

**Props**:
```typescript
interface CreateShipmentFlowProps {
  onBack: () => void;
  onSuccess: () => void;
}
```

### MapView
**Файл**: `src/components/MapView.tsx`

Интерактивная карта с маршрутом груза.

**Функции**:
- Отображение маркеров origin/destination
- Линия маршрута
- Информационные popup'ы

**Props**:
```typescript
interface MapViewProps {
  shipment: Shipment;
  onBack: () => void;
}
```

### CitySearch
**Файл**: `src/components/CitySearch.tsx`

Компонент автокомплита для поиска городов.

**Функции**:
- Поиск через Nominatim API
- Debouncing запросов
- Отображение результатов

**Props**:
```typescript
interface CitySearchProps {
  label: string;
  value: string;
  onChange: (city: string, location: Location) => void;
  placeholder?: string;
}
```

## 🌐 API Сервисы

### apiService
**Файл**: `src/services/api.ts`

Централизованный сервис для работы с API.

**Методы**:

```typescript
// Получить список грузов
getShipments(status?: string): Promise<Shipment[]>

// Получить груз по ID
getShipment(id: string): Promise<Shipment>

// Создать груз
createShipment(data: CreateShipmentRequest): Promise<Shipment>

// Получить тарифы перевозчиков
getCarrierRates(origin: string, destination: string): Promise<CarrierRate[]>

// Поиск городов
searchCities(query: string): Promise<City[]>
```

## 📊 TypeScript типы

### Основные интерфейсы

```typescript
// Локация (координаты)
interface Location {
  lat: number;
  lon: number;
}

// Грузоперевозка
interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'Booked' | 'In Transit' | 'Delivered';
  carrier: string;
  currentLocation: Location;
  estimatedArrival?: string;
  progress?: number;
}

// Тариф перевозчика
interface CarrierRate {
  carrierName: string;
  price: number;
  days: number;
}

// Город
interface City {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  country: string;
}
```

## 🛠️ Полезные команды

```bash
# Разработка
npm run dev          # Запустить dev-сервер (localhost:5173)

# Сборка
npm run build        # Production сборка
npm run preview      # Предпросмотр production

# Проверка кода
npm run lint         # Проверить с ESLint

# Git
git status           # Статус изменений
git add .            # Добавить все файлы
git commit -m "msg"  # Создать коммит
git push             # Загрузить на GitHub

# Зависимости
npm install          # Установить все
npm update           # Обновить все
npm audit            # Проверить безопасность
```

## 🔍 Переменные окружения

Создайте `.env` файл в корне проекта:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# ShipEngine
VITE_SHIPENGINE_API_KEY=your_api_key
```

⚠️ **Важно**: Никогда не коммитьте `.env` файл!

## 📞 Получение помощи

### Есть вопрос?
1. Проверьте [Issues](../../issues) - возможно, кто-то уже спрашивал
2. Прочитайте [CONTRIBUTING.md](CONTRIBUTING.md)
3. Создайте новый [Issue](../../issues/new)

### Нашли ошибку?
1. Используйте [Bug Report Template](../../issues/new?template=bug_report.yml)
2. Опишите проблему подробно
3. Приложите скриншоты

### Есть идея?
1. Используйте [Feature Request Template](../../issues/new?template=feature_request.yml)
2. Объясните, зачем это нужно
3. Обсудите с командой

## 🎓 Обучающие ресурсы

### React
- [React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Vite
- [Vite Guide](https://vitejs.dev/guide/)
- [Vite Config Reference](https://vitejs.dev/config/)

### TailwindCSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Leaflet
- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet Docs](https://react-leaflet.js.org/)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 📝 Чеклист для новых контрибьюторов

- [ ] Прочитать [README.md](README.md)
- [ ] Ознакомиться с [CONTRIBUTING.md](CONTRIBUTING.md)
- [ ] Установить проект локально
- [ ] Настроить переменные окружения
- [ ] Убедиться, что проект запускается
- [ ] Изучить структуру кода
- [ ] Выбрать Issue для работы
- [ ] Создать feature ветку
- [ ] Внести изменения
- [ ] Создать Pull Request

## 🌟 Проект поддерживается

Этот проект активно развивается. Звездочка на GitHub поможет привлечь больше контрибьюторов!

⭐ [Star on GitHub](../../stargazers)

---

**Последнее обновление**: 2 ноября 2025

**Версия документации**: 1.0.0
