import { RateLimitedAxiosInstance } from 'axios-rate-limit';
import { YooKassaErrResponse } from '../types/api.types';
/**
 * Конфигурация прокси-сервера (URL строка)
 */
export type ProxyConfig = string;
/**
 * Данные для подключения к API YooKassa
 */
export type ConnectorOpts = {
    /**
     * Идентификатор магазина
     */
    shop_id: string;
    /**
     * Секретный ключ
     */
    secret_key: string;
    /**
     * Эндпоинт API (без слэша в конце)
     * @default "https://api.yookassa.ru/v3"
     */
    endpoint?: string;
    /** Отладочный режим */
    debug?: boolean;
    /** URL для редиректа */
    redirect_url?: string;
    /**
     * Количество запросов в секунду
     * @default 5
     */
    maxRPS?: number;
    /**
     * Таймаут запроса в миллисекундах
     * @default 5000
     */
    timeout?: number;
    /**
     * Количество повторных попыток при ошибках
     * @default 5
     */
    retries?: number;
    /**
     * Конфигурация прокси-сервера
     * Можно указать как строку URL (например, "http://user:pass@proxy.example.com:8080")
     * или объект AxiosProxyConfig
     */
    proxy?: ProxyConfig;
};
export declare const endpoints: {
    refunds: {
        create: {
            method: string;
            endpoint: string;
            description: string;
        };
        list: {
            method: string;
            endpoint: string;
            description: string;
        };
        info: {
            method: string;
            endpoint: string;
            description: string;
        };
    };
    payments: {
        create: {
            method: string;
            endpoint: string;
        };
        list: {
            method: string;
            endpoint: string;
        };
        info: {
            method: string;
            endpoint: string;
        };
        capture: {
            method: string;
            endpoint: string;
        };
        cancel: {
            method: string;
            endpoint: string;
        };
    };
    receipts: {
        create: {
            method: string;
            endpoint: string;
            description: string;
        };
        list: {
            method: string;
            endpoint: string;
            description: string;
        };
        info: {
            method: string;
            endpoint: string;
            description: string;
        };
    };
};
interface IGenReqOpts<P> {
    method: 'GET' | 'POST' | 'DELETE';
    endpoint: string;
    params?: P;
    maxRPS?: number;
    requestId?: string;
    debug?: boolean;
}
export type GetRequestOpts<P = Record<string, any>> = IGenReqOpts<P> & {
    method: 'GET';
};
export type PostRequestOpts<P = Record<string, any>, D = Record<string, any>> = IGenReqOpts<P> & {
    method: 'POST';
    data: D;
};
export type RequestOpts<P = Record<string, any>, D = Record<string, any>> = GetRequestOpts<P> | PostRequestOpts<P, D>;
type BadApiResponse = {
    success: 'NO_OK';
    errorData: YooKassaErrResponse;
    requestId: string;
};
type GoodApiResponse<Res> = {
    success: 'OK';
    data: Res;
    requestId: string;
};
export type ApiResponse<Res> = BadApiResponse | GoodApiResponse<Res>;
/**
 * Базовый класс для работы с API YooKassa
 */
export declare class Connector {
    protected axiosInstance: RateLimitedAxiosInstance;
    protected endpoint: string;
    protected debug: boolean;
    protected maxRPS: number;
    protected timeout: number;
    protected retries: number;
    constructor(init: ConnectorOpts);
    /**
     * Выполняет запрос к API с поддержкой retry и идемпотентности
     */
    protected request<Res = Record<string, any>, Data = Record<string, any>>(opts: RequestOpts<Data>): Promise<ApiResponse<Res>>;
}
export {};
