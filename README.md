
# Задание 1

Реализовал два сервиса `marketplace` и `stories`.

## marketplace

Данный сервис ответает за создание товара, создание остатка, увеличение остатка, уменьшение остатка, получение остатка по фидльтрам и получения товаров по фильтрам.

Фреймворк: express.js. Система управления базами данных: PostgreSQL. Язык: JavaScript.

`npm i`. Запуск `node stock.js`. URL: `http://localhost:3000`.

Перед запуском следует настроить `.env` файл. Параметры по умолчанию:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=admin
PGDATABASE=marketplace
PGPORT=5432
STORIES_SERVER_URL=http://localhost:3001/v1
```

### структура базы данных

База данных `marketplace` содержит 3 таблицы: `products`, `stock`, `stores`.

Таблица `products`:

`id`: integer, `name`: text, `PLU`: text

Здесь хранятся товары.

Таблица `stock`:

`id`: integer, `product_id`: integer, `store_id`: integer, `quantity_all`: integer, `quantity_reserved`: integer

Здесь хранятся остатки.

Таблица `stores`:

`id`: integer, `name`: text

Здесь хранятся магазины.

### API

API v1. Доступно 6 действий.

- POST /products
- GET /products
- POST /stock
- PUT /stock/increase/:id
- PUT /stock/decrease/:id
- GET /stock

Например: GET `http://localhost:3000/v1/products?PLU=GB1250&name=LEGO Green Baseplate` возвращает все товары с именем `LEGO Green Baseplate` и PLU `GB1250`.

Например: POST `http://localhost:3000/v1/stock` с параметром body: `{ "product_id": 3, "store_id": 1, "quantity_all": 0, "quantity_reserved": 0 }` создает остаток товара с `id` 1 в магазине с `id` 1.

## stories

### структура базы данных

Сервис stories тесно связан с сервисом marketplace. Его задача: записывать все выполненные действия (actions) в собственную базу данных.

`npm i`. Запуск `node stories.js`. URL: `http://localhost:3001`.

Перед запуском следует настроить `.env` файл. Параметры по умолчанию:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=admin
PGDATABASE=stories
PGPORT=5432
```

База данных `stories` содержит 2 таблицы: `actions`, `stories`.

Таблица `actions`:

`id`: integer, `description`: text

Таблица `stories`:

`id`: integer, `store_id`: integer, `PLU`: text, `date`: date, `action_id`: integer

Доступно 2 действия:

- POST /stories
- GET /stories

Например: GET `http://localhost:3001/v1/stories?end_date=2024-12-04&start_date=2024-12-02&page=4` вернет все истории с начальной датой 2024-12-02, по конечную дату 2024-12-04 (в UTC), четвертую страницу.

# Задание 2

Реализовал сервис по возвращению количества пользователей с ошибками из базы данных.

## структура базы данных

База данных `profiles` имеет таблицу `users` со следующей схемой:

`id`: integer, `name`: text, `surname`: text, `age`: integer, `sex`: char, `issues`: boolean

В папке гита `profiles` находится скрипт `populateusers.js`, который можно запустить `node populateusers.js`, чтобы сгенерировать 1 млн пользователей.

`npm i`. Перед запуском следует настроить `.env` файл. Параметры по умолчанию:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=admin
PGDATABASE=profiles
PGPORT=5432
```

В тот же самой папке находится Nest.js проект `user-service`, который можно запустить `npm run start`. URL: `http://localhost:3002`.

`npm i`. Перед запуском следует настроить отдельный `.env` файл. Параметры по умолчанию:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=admin
PGDATABASE=profiles
PGPORT=5432
```

Доступно одно действие:

- PATCH /users/resolve-issues

Обновляет флаги `issues` с `true` на `false` и возвращает количество обновленных флагов.
