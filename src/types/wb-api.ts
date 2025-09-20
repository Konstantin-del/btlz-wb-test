/** Типы для API Wildberries тарифов складов */

export interface WBTariffBoxResponse {
    response: {
        data: {
            /** Дата следующей коробки */
            dtNextBox: string;
            /** Дата до максимальной */
            dtTillMax: string;
            /** Список складов */
            warehouseList: WBTariffBox[];
        };
    };
}

export interface WBTariffBox {
    /** Базовая стоимость доставки коробки */
    boxDeliveryBase: string;
    /** Коэффициент выражения доставки коробки */
    boxDeliveryCoefExpr: string;
    /** Литровая стоимость доставки коробки */
    boxDeliveryLiter: string;
    /** Базовая стоимость доставки коробки на маркетплейс */
    boxDeliveryMarketplaceBase: string;
    /** Коэффициент выражения доставки коробки на маркетплейс */
    boxDeliveryMarketplaceCoefExpr: string;
    /** Литровая стоимость доставки коробки на маркетплейс */
    boxDeliveryMarketplaceLiter: string;
    /** Базовая стоимость хранения коробки */
    boxStorageBase: string;
    /** Коэффициент выражения хранения коробки */
    boxStorageCoefExpr: string;
    /** Литровая стоимость хранения коробки */
    boxStorageLiter: string;
    /** Географическое название */
    geoName: string;
    /** Название склада */
    warehouseName: string;
}

export interface WBTariffBoxDB {
    /** Название склада */
    warehouse_name: string;
    /** Географическое название */
    geo_name: string;
    /** Базовая стоимость доставки коробки */
    box_delivery_base: string;
    /** Коэффициент выражения доставки коробки */
    box_delivery_coef_expr: string;
    /** Литровая стоимость доставки коробки */
    box_delivery_liter: string;
    /** Базовая стоимость доставки коробки на маркетплейс */
    box_delivery_marketplace_base: string;
    /** Коэффициент выражения доставки коробки на маркетплейс */
    box_delivery_marketplace_coef_expr: string;
    /** Литровая стоимость доставки коробки на маркетплейс */
    box_delivery_marketplace_liter: string;
    /** Базовая стоимость хранения коробки */
    box_storage_base: string;
    /** Коэффициент выражения хранения коробки */
    box_storage_coef_expr: string;
    /** Литровая стоимость хранения коробки */
    box_storage_liter: string;
    /** Дата получения данных */
    fetch_date: string;
}
