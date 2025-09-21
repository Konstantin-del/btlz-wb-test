import * as cron from "node-cron";
import { WBApiService } from "./wb-api-service.js";
import { GoogleSheetsService } from "./google-sheets-service.js";
import log4js from "log4js";

const logger = log4js.getLogger("SCHEDULER_SERVICE");

export class SchedulerService {
    private wbApiService: WBApiService;
    private googleSheetsService: GoogleSheetsService;
    private isRunning: boolean = false;

    constructor() {
        this.wbApiService = new WBApiService();
        this.googleSheetsService = new GoogleSheetsService();
    }

    start(): void {
        if (this.isRunning) {
            logger.warn("Scheduler is already running");
            return;
        }

        logger.info("Starting scheduler service");

        // Ежечасное обновление тарифов (в 0 минут каждого часа)
        cron.schedule(
            "0 * * * *",
            async () => {
                await this.updateTariffsTask();
            },
            {
                timezone: "Europe/Moscow",
            },
        );

        // Обновление Google таблиц каждые 2 часа (в 0 и 30 минут)
        cron.schedule(
            "0,30 * * * *",
            async () => {
                await this.updateGoogleSheetsTask();
            },
            {
                timezone: "Europe/Moscow",
            },
        );

        setTimeout(async () => {
            await this.updateTariffsTask();
            await this.updateGoogleSheetsTask();
        }, 30000);

        this.isRunning = true;
        logger.info("Scheduler service started successfully");
    }

    stop(): void {
        if (!this.isRunning) {
            logger.warn("Scheduler is not running");
            return;
        }

        cron.getTasks().forEach((task) => task.stop());
        this.isRunning = false;
        logger.info("Scheduler service stopped");
    }

    private async updateTariffsTask(): Promise<void> {
        try {
            logger.info("Starting tariff update task");
            const startTime = Date.now();

            await this.wbApiService.updateTariffs();

            const duration = Date.now() - startTime;
            logger.info(`Tariff update task completed in ${duration}ms`);
        } catch (error) {
            logger.error("Tariff update task failed:", error);
        }
    }

    private async updateGoogleSheetsTask(): Promise<void> {
        try {
            logger.info("Starting Google Sheets update task");
            const startTime = Date.now();

            const tariffs = await this.wbApiService.getLatestTariffsFromDB();

            if (tariffs.length === 0) {
                logger.warn("No tariffs found in database, skipping Google Sheets update");
                return;
            }

            await this.googleSheetsService.updateAllSpreadsheets(tariffs);

            const duration = Date.now() - startTime;
            logger.info(`Google Sheets update task completed in ${duration}ms`);
        } catch (error) {
            logger.error("Google Sheets update task failed:", error);
        }
    }
}
