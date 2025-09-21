import axios, { AxiosResponse } from "axios";
import { WBTariffBoxResponse, WBTariffBox, WBTariffBoxDB } from "#types/wb-api.js";
import env from "#config/env/env.js";
import knex from "#postgres/knex.js";
import log4js from "log4js";

const logger = log4js.getLogger("WB_API_SERVICE");

export class WBApiService {
    private readonly baseUrl = "https://common-api.wildberries.ru/api/v1/tariffs/box";

    private readonly token: string;

    constructor() {
        this.token = env.WB_API_TOKEN;
    }

    async getTariffs(date: string): Promise<WBTariffBox[]> {
        try {
            logger.info(`Fetching tariffs for date: ${date}`);

            const response: AxiosResponse<WBTariffBoxResponse> = await axios.get(this.baseUrl, {
                headers: {
                    "Authorization": this.token,
                    "Content-Type": "application/json",
                },
                params: {
                    date: date,
                },
                timeout: 30000, // 30 секунд таймаут
            });

            if (!response.data?.response?.data?.warehouseList) {
                throw new Error("Invalid response structure from WB API");
            }

            const warehouses = response.data.response.data.warehouseList;
            logger.info(`Successfully fetched ${warehouses.length} warehouses`);

            return warehouses;
        } catch (error) {
            logger.error("Error fetching tariffs from WB API:", error);
            throw error;
        }
    }

    async saveTariffsToDB(tariffs: WBTariffBox[], fetchDate: string): Promise<void> {
        try {
            logger.info(`Saving ${tariffs.length} tariffs to database for date: ${fetchDate}`);

            await knex("spreadsheets").where("fetch_date", fetchDate).del();

            const dbTariffs: WBTariffBoxDB[] = tariffs.map((tariff) => ({
                warehouse_name: tariff.warehouseName,
                geo_name: tariff.geoName,
                box_delivery_base: tariff.boxDeliveryBase,
                box_delivery_coef_expr: tariff.boxDeliveryCoefExpr,
                box_delivery_liter: tariff.boxDeliveryLiter,
                box_delivery_marketplace_base: tariff.boxDeliveryMarketplaceBase,
                box_delivery_marketplace_coef_expr: tariff.boxDeliveryMarketplaceCoefExpr,
                box_delivery_marketplace_liter: tariff.boxDeliveryMarketplaceLiter,
                box_storage_base: tariff.boxStorageBase,
                box_storage_coef_expr: tariff.boxStorageCoefExpr,
                box_storage_liter: tariff.boxStorageLiter,
                fetch_date: fetchDate,
            }));

            await knex("spreadsheets").insert(dbTariffs);

            logger.info(`Successfully saved ${tariffs.length} tariffs to database`);
        } catch (error) {
            logger.error("Error saving tariffs to database:", error);
            throw error;
        }
    }

    async getTariffsFromDB(fetchDate: string): Promise<WBTariffBoxDB[]> {
        try {
            const tariffs = await knex("spreadsheets").where("fetch_date", fetchDate).orderBy("box_delivery_coef_expr", "asc");

            logger.info(`Retrieved ${tariffs.length} tariffs from database for date: ${fetchDate}`);
            return tariffs;
        } catch (error) {
            logger.error("Error retrieving tariffs from database:", error);
            throw error;
        }
    }

    async getLatestTariffsFromDB(): Promise<WBTariffBoxDB[]> {
        try {
            const latestDate = await knex("spreadsheets").max("fetch_date as latest_date").first();
            if (!latestDate?.latest_date) {
                logger.warn("No tariffs found in database");
                return [];
            }

            return this.getTariffsFromDB(latestDate.latest_date);
        } catch (error) {
            logger.error("Error retrieving latest tariffs from database:", error);
            throw error;
        }
    }

    async updateTariffs(): Promise<void> {
        const targetDate = new Date().toISOString().split("T")[0];

        try {
            logger.info(`Starting tariff update for date: ${targetDate}`);

            const tariffs = await this.getTariffs(targetDate);

            await this.saveTariffsToDB(tariffs, targetDate);

            logger.info(`Successfully updated tariffs for date: ${targetDate}`);
        } catch (error) {
            logger.error(`Failed to update tariffs for date: ${targetDate}`, error);
            throw error;
        }
    }
}
