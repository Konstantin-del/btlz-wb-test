# WB Tariffs Service

Сервис для автоматического получения тарифов Wildberries и обновления Google таблиц.

## Описание

Сервис выполняет две основные задачи:

1. **Регулярное получение информации о тарифах WB** - ежечасное обращение к API Wildberries для получения актуальных тарифов коробов и сохранение их в PostgreSQL
2. **Обновление Google таблиц** - регулярное обновление данных в настроенных Google таблицах с актуальными тарифами

## Возможности

- ✅ Ежечасное получение тарифов с API Wildberries
- ✅ Сохранение данных в PostgreSQL с историей
- ✅ Автоматическое обновление Google таблиц
- ✅ Логирование всех операций
- ✅ Docker контейнеризация

## Технологии

- **Node.js** + **TypeScript**
- **PostgreSQL** + **Knex.js** (ORM)
- **Google Sheets API**
- **Docker** + **Docker Compose**
- **node-cron** (планировщик задач)
- **log4js** (логирование)

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd btlz-wb-test
```

### 2. Настройка окружения

# Токен API Wildberries (обязательно)

WB_API_TOKEN=your_wb_api_token_here

# Google Sheets (обязательно)

GOOGLE_SHEETS_CREDENTIALS=json_key
GOOGLE_SHEETS_SPREADSHEET_IDS=spreadsheet_id_1,spreadsheet_id_2

````

### 3. Запуск с Docker

```bash
docker compose up -d
````

Сервис автоматически:

- Создаст и настроит базу данных
- Выполнит миграции
- Запустит планировщик задач

### 4. Проверка работы

```bash
# Проверить статус сервиса
docker compose logs app

# Проверить логи
tail -f logs/app.log
```
