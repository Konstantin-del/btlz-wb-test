import knex, { migrate, seed } from "#postgres/knex.js";
import { SchedulerService } from "#services/scheduler-service.js";
import log4js from "log4js";

const logger = log4js.getLogger("SCHEDULER_SERVICE");

async function startApplication() {
    try {
        logger.info("Starting WB Tariffs Service...");

        logger.info("Running database migrations...");
        await migrate.latest();
        //await seed.run();
        logger.info("Database migrations completed");

        const scheduler = new SchedulerService();
        scheduler.start();

        logger.info("WB Tariffs Service started successfully");

        process.on("SIGINT", () => {
            logger.info("Received SIGINT, shutting down gracefully...");
            scheduler.stop();
            knex.destroy().then(() => {
                logger.info("Database connection closed");
                process.exit(0);
            });
        });

        process.on("SIGTERM", () => {
            logger.info("Received SIGTERM, shutting down gracefully...");
            scheduler.stop();
            knex.destroy().then(() => {
                logger.info("Database connection closed");
                process.exit(0);
            });
        });
    } catch (error) {
        logger.error("Failed to start application:", error);
        process.exit(1);
    }
}

startApplication();
