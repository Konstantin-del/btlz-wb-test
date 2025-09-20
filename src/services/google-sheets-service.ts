import { google } from "googleapis";
import { WBTariffBoxDB } from "#types/wb-api.js";
import env from "#config/env/env.js";
import knex from "#postgres/knex.js";
import log4js from "log4js";

const logger = log4js.getLogger("GOOGLE_SHEETS_SERVICE");

export class GoogleSheetsService {
    private sheets: any;
    private spreadsheetIds: string[];

    constructor() {
        this.initializeGoogleSheets();
        this.spreadsheetIds = this.getSpreadsheetIds();
    }

    // Инициализация Google Sheets API
    private initializeGoogleSheets(): void {
        try {
            if (!env.GOOGLE_SHEETS_CREDENTIALS) {
                console.log("Google Sheets credentials not provided, service will be disabled");
                logger.warn("Google Sheets credentials not provided, service will be disabled");
                return;
            }

            const credentials = env.GOOGLE_SHEETS_CREDENTIALS;
            const auth = new google.auth.GoogleAuth({
                keyFile: credentials,
                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
            });

            this.sheets = google.sheets({ version: "v4", auth });
            console.log("Google Sheets API initialized successfully");
        } catch (error) {
            console.log("Failed to initialize Google Sheets API:", error);
            throw error;
        }
    }

    // Получает список ID таблиц из переменной окружения
    private getSpreadsheetIds(): string[] {
        if (!env.GOOGLE_SHEETS_SPREADSHEET_IDS) {
            console.log("No Google Sheets IDs provided");
            logger.warn("No Google Sheets IDs provided");
            return [];
        }

        return env.GOOGLE_SHEETS_SPREADSHEET_IDS.split(",").map((id) => id.trim());
    }

    //  Обновляет данные в Google таблице

    async updateSpreadsheet(spreadsheetId: string, tariffs: WBTariffBoxDB[]): Promise<void> {
        if (!this.sheets) {
            console.log("Google Sheets API not initialized, skipping update");
            logger.warn("Google Sheets API not initialized, skipping update");
            return;
        }

        try {
            `Updating spreadsheet ${spreadsheetId} with ${tariffs.length} tariffs`;

            // Подготавливаем данные для записи
            const values = this.prepareDataForSheets(tariffs);

            // Обновляем лист stocks_coefs
            await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "stocks_coefs!A1",
                valueInputOption: "RAW",
                resource: {
                    values,
                },
            });

            console.log(`Successfully updated spreadsheet ${spreadsheetId}`);
        } catch (error) {
            console.log(`Error updating spreadsheet ${spreadsheetId}:`, error);
            throw error;
        }
    }

    private prepareDataForSheets(tariffs: WBTariffBoxDB[]): any[][] {
        const headers = [
            "Название склада",
            "Географическое название",
            "Базовая стоимость доставки коробки",
            "Коэффициент выражения доставки коробки",
            "Литровая стоимость доставки коробки",
            "Базовая стоимость доставки коробки на маркетплейс",
            "Коэффициент выражения доставки коробки на маркетплейс",
            "Литровая стоимость доставки коробки на маркетплейс",
            "Базовая стоимость хранения коробки",
            "Коэффициент выражения хранения коробки",
            "Литровая стоимость хранения коробки",
            "Дата получения данных",
        ];

        const data = tariffs.map((tariff) => [
            tariff.warehouse_name,
            tariff.geo_name,
            tariff.box_delivery_base,
            tariff.box_delivery_coef_expr,
            tariff.box_delivery_liter,
            tariff.box_delivery_marketplace_base,
            tariff.box_delivery_marketplace_coef_expr,
            tariff.box_delivery_marketplace_liter,
            tariff.box_storage_base,
            tariff.box_storage_coef_expr,
            tariff.box_storage_liter,
            tariff.fetch_date,
        ]);

        return [headers, ...data];
    }

    async updateAllSpreadsheets(tariffs: WBTariffBoxDB[]): Promise<void> {
        try {
            const allSpreadsheetIds = this.spreadsheetIds;

            if (allSpreadsheetIds.length === 0) {
                logger.warn("No spreadsheets configured for update");
                return;
            }

            console.log(`Updating ${allSpreadsheetIds.length} spreadsheets`);

            const updatePromises = allSpreadsheetIds.map((spreadsheetId) => this.updateSpreadsheet(spreadsheetId, tariffs));

            await Promise.all(updatePromises);
            console.log("Successfully updated all spreadsheets");
        } catch (error) {
            console.log("Error updating spreadsheets:", error);
            throw error;
        }
    }
}
