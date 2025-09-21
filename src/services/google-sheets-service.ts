import { google } from "googleapis";
import { WBTariffBoxDB } from "#types/wb-api.js";
import env from "#config/env/env.js";
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
                logger.warn("Google Sheets credentials not provided, service will be disabled");
                return;
            }

            const credentials = env.GOOGLE_SHEETS_CREDENTIALS;
            const auth = new google.auth.GoogleAuth({
                keyFile: credentials,
                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
            });

            this.sheets = google.sheets({ version: "v4", auth });
            logger.info("Google Sheets API initialized successfully");
        } catch (error) {
            logger.error("Failed to initialize Google Sheets API:", error);
            throw error;
        }
    }

    private getSpreadsheetIds(): string[] {
        if (!env.GOOGLE_SHEETS_SPREADSHEET_IDS) {
            logger.warn("No Google Sheets IDs provided");
            return [];
        }

        return env.GOOGLE_SHEETS_SPREADSHEET_IDS.split(",").map((id) => id.trim());
    }

    async updateSpreadsheet(spreadsheetId: string, tariffs: WBTariffBoxDB[]): Promise<void> {
        if (!this.sheets) {
            logger.warn("Google Sheets API not initialized, skipping update");
            return;
        }

        try {
            `Updating spreadsheet ${spreadsheetId} with ${tariffs.length} tariffs`;

            const values = this.prepareDataForSheets(tariffs);

            await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "stocks_coefs!A1",
                valueInputOption: "RAW",
                resource: {
                    values,
                },
            });

            logger.info(`Successfully updated spreadsheet ${spreadsheetId}`);
        } catch (error) {
            logger.error(`Error updating spreadsheet ${spreadsheetId}:`, error);
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

            logger.info(`Updating ${allSpreadsheetIds.length} spreadsheets`);

            const updatePromises = allSpreadsheetIds.map((spreadsheetId) => this.updateSpreadsheet(spreadsheetId, tariffs));

            await Promise.all(updatePromises);
            logger.info("Successfully updated all spreadsheets");
        } catch (error) {
            logger.error("Error updating spreadsheets:", error);
            throw error;
        }
    }
}
