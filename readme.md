# YooKassa SDK

[![npm version](https://img.shields.io/npm/v/yookassa-api-sdk.svg)](https://www.npmjs.com/package/yookassa-api-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-compatible-f9f1e1.svg)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Современный TypeScript SDK для интеграции с [YooKassa API](https://yookassa.ru/developers/api). Поддерживает платежи, возвраты, чеки и многое другое.

## Особенности

- 🚀 **Полная типизация** — написан на TypeScript с полной поддержкой типов
- 🔄 **Автоматические повторы** — retry с exponential backoff при сетевых ошибках
- 🔑 **Идемпотентность** — автоматическая генерация `Idempotence-Key` для безопасных повторов
- 🌐 **Поддержка прокси** — работа через HTTP/HTTPS прокси
- ⚡ **Rate limiting** — встроенное ограничение частоты запросов
- 🕐 **Таймауты** — настраиваемые таймауты запросов
- 📦 **Кэширование инстансов** — эффективное переиспользование соединений
- 🔧 **Совместимость** — работает с Node.js, Bun и другими рантаймами

## Установка

```sh
# npm
npm install yookassa-api-sdk

# yarn
yarn add yookassa-api-sdk

# bun
bun add yookassa-api-sdk
```

## Быстрый старт

```ts
import { YooKassa } from 'yookassa-api-sdk';

const sdk = YooKassa({
    shop_id: 'ваш_идентификатор_магазина',
    secret_key: 'ваш_секретный_ключ',
});

// Создание платежа
const payment = await sdk.payments.create({
    amount: { value: '100.00', currency: 'RUB' },
    confirmation: { type: 'redirect', return_url: 'https://example.com' },
    description: 'Заказ №1',
});

console.log(payment.confirmation.confirmation_url);
```

## Параметры подключения

```ts
interface ConnectorOpts {
    /** Идентификатор магазина (обязательный) */
    shop_id: string;

    /** Секретный ключ магазина (обязательный) */
    secret_key: string;

    /** Режим отладки — логирует запросы и ответы */
    debug?: boolean;

    /** Таймаут запроса в миллисекундах (по умолчанию: 5000) */
    timeout?: number;

    /** Количество повторных попыток при ошибках (по умолчанию: 5) */
    retries?: number;

    /** Максимальное количество запросов в секунду (по умолчанию: 5) */
    maxRPS?: number;

    /** Прокси-сервер (строка URL или объект конфигурации) */
    proxy?: string | AxiosProxyConfig;

    /** Кастомный эндпоинт API */
    endpoint?: string;
}
```

### Примеры инициализации

```ts
// Базовая инициализация
const sdk = YooKassa({
    shop_id: '123456',
    secret_key: 'test_secret_key',
});

// С отладкой и кастомными настройками
const sdk = YooKassa({
    shop_id: '123456',
    secret_key: 'live_secret_key',
    debug: true,
    timeout: 10000, // 10 секунд
    retries: 3, // 3 повтора
    maxRPS: 10, // 10 запросов в секунду
});

// С прокси (строка)
const sdk = YooKassa({
    shop_id: '123456',
    secret_key: 'live_secret_key',
    proxy: 'http://user:password@proxy.example.com:8080',
});

// С прокси (объект)
const sdk = YooKassa({
    shop_id: '123456',
    secret_key: 'live_secret_key',
    proxy: {
        host: 'proxy.example.com',
        port: 8080,
        auth: { username: 'user', password: 'password' },
    },
});
```

## Кэширование инстансов

SDK автоматически кэширует инстансы по `shop_id`. Это позволяет:

- Переиспользовать соединения
- Работать с несколькими магазинами одновременно

```ts
// Оба вызова вернут один и тот же инстанс
const sdk1 = YooKassa({ shop_id: '123', secret_key: 'key1' });
const sdk2 = YooKassa({ shop_id: '123', secret_key: 'key1' });
console.log(sdk1 === sdk2); // true

// Разные магазины — разные инстансы
const shop1 = YooKassa({ shop_id: '111', secret_key: 'key1' });
const shop2 = YooKassa({ shop_id: '222', secret_key: 'key2' });

// Принудительное создание нового инстанса
const newSdk = YooKassa({ shop_id: '123', secret_key: 'new_key' }, true);

// Очистка кэша
import { clearYooKassaCache } from 'yookassa-api-sdk';
clearYooKassaCache('123'); // Удалить конкретный магазин
clearYooKassaCache(); // Очистить весь кэш
```

## Платежи

### Создание платежа

```ts
import { CurrencyEnum } from 'yookassa-api-sdk';

const payment = await sdk.payments.create({
    amount: {
        value: '100.00',
        currency: CurrencyEnum.RUB,
    },
    confirmation: {
        type: 'redirect',
        return_url: 'https://example.com/return',
    },
    capture: true,
    description: 'Заказ №123',
    receipt: {
        customer: { email: 'customer@example.com' },
        items: [
            {
                description: 'Товар',
                quantity: 1,
                amount: { value: '100.00', currency: CurrencyEnum.RUB },
                vat_code: 1,
            },
        ],
    },
    metadata: {
        order_id: '123',
    },
});
```

[Документация по созданию платежа](https://yookassa.ru/developers/api#create_payment)

### Получение информации о платеже

```ts
const payment = await sdk.payments.load('payment_id');
console.log(payment.status); // pending, waiting_for_capture, succeeded, canceled
```

[Документация](https://yookassa.ru/developers/api#get_payment)

### Список платежей

```ts
const payments = await sdk.payments.list({
    created_at: { gte: '2024-01-01T00:00:00.000Z' },
    status: 'succeeded',
    limit: 50,
});
```

[Документация](https://yookassa.ru/developers/api#get_payments_list)

### Подтверждение платежа

```ts
const payment = await sdk.payments.capture('payment_id');
```

[Документация](https://yookassa.ru/developers/payment-acceptance/getting-started/payment-process#capture-and-cancel)

### Отмена платежа

```ts
const payment = await sdk.payments.cancel('payment_id');
```

[Документация](https://yookassa.ru/developers/payment-acceptance/getting-started/payment-process#capture-and-cancel)

## Возвраты

### Создание возврата

```ts
const refund = await sdk.refunds.create({
    payment_id: 'payment_id',
    amount: {
        value: '50.00',
        currency: CurrencyEnum.RUB,
    },
});
```

[Документация](https://yookassa.ru/developers/api#create_refund)

### Получение информации о возврате

```ts
const refund = await sdk.refunds.load('refund_id');
```

[Документация](https://yookassa.ru/developers/api#get_refund)

### Список возвратов

```ts
const refunds = await sdk.refunds.list({
    payment_id: 'payment_id',
    limit: 10,
});
```

[Документация](https://yookassa.ru/developers/api#get_refunds_list)

## Чеки

### Создание чека

```ts
const receipt = await sdk.receipts.create({
    type: 'payment',
    payment_id: 'payment_id',
    customer: {
        email: 'customer@example.com',
    },
    items: [
        {
            description: 'Товар',
            quantity: 1,
            amount: { value: '100.00', currency: CurrencyEnum.RUB },
            vat_code: 1,
        },
    ],
    send: true,
});
```

[Документация](https://yookassa.ru/developers/api#create_receipt)

### Получение информации о чеке

```ts
const receipt = await sdk.receipts.load('receipt_id');
```

[Документация](https://yookassa.ru/developers/api#get_receipt)

### Список чеков

```ts
const receipts = await sdk.receipts.list({
    payment_id: 'payment_id',
});
```

[Документация](https://yookassa.ru/developers/api#get_receipts_list)

## Обработка ошибок

SDK возвращает унифицированный формат ответа:

```ts
try {
    const payment = await sdk.payments.create({ ... })
    // Успех
} catch (error) {
    // YooKassaErr содержит:
    // - error.name — код ошибки (например, 'invalid_request')
    // - error.message — описание ошибки
    // - error.id — идентификатор запроса
    console.error(error.name, error.message)
}
```

### Типы ошибок

| Код                     | Описание                |
| ----------------------- | ----------------------- |
| `invalid_request`       | Неверный запрос         |
| `invalid_credentials`   | Неверные учётные данные |
| `forbidden`             | Доступ запрещён         |
| `not_found`             | Объект не найден        |
| `too_many_requests`     | Превышен лимит запросов |
| `internal_server_error` | Ошибка сервера          |
| `NETWORK_ERROR`         | Сетевая ошибка          |
| `ECONNABORTED`          | Таймаут запроса         |

## Справочник методов

### Payments

| Метод          | Описание                |
| -------------- | ----------------------- |
| `create(data)` | Создание платежа        |
| `load(id)`     | Получение платежа по ID |
| `list(filter)` | Список платежей         |
| `capture(id)`  | Подтверждение платежа   |
| `cancel(id)`   | Отмена платежа          |

### Refunds

| Метод          | Описание                 |
| -------------- | ------------------------ |
| `create(data)` | Создание возврата        |
| `load(id)`     | Получение возврата по ID |
| `list(filter)` | Список возвратов         |

### Receipts

| Метод          | Описание             |
| -------------- | -------------------- |
| `create(data)` | Создание чека        |
| `load(id)`     | Получение чека по ID |
| `list(filter)` | Список чеков         |

## Автор

**Aleksey Aleksyuk** ([@awardix](https://github.com/awardix))

## Благодарности

Этот проект является форком [yookassa-sdk](https://github.com/googlesheets-ru/yookassa-sdk) от **Dmitriy** ([@Mityayka1](https://github.com/Mityayka1)). Спасибо за оригинальную реализацию!

## Лицензия

[MIT](LICENSE)
