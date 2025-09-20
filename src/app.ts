import knex, { migrate, seed } from "#postgres/knex.js";
import { SchedulerService } from "#services/scheduler-service.js";

async function startApplication() {
    try {
        console.log("Starting WB Tariffs Service...");

        // Выполняем миграции
        console.log("Running database migrations...");
        await migrate.latest();
        //await seed.run();
        console.log("Database migrations completed");

        // Запускаем планировщик
        const scheduler = new SchedulerService();
        scheduler.start();

        console.log("WB Tariffs Service started successfully");

        // Обработка сигналов для graceful shutdown
        process.on("SIGINT", () => {
            console.log("Received SIGINT, shutting down gracefully...");
            scheduler.stop();
            knex.destroy().then(() => {
                console.log("Database connection closed");
                process.exit(0);
            });
        });

        process.on("SIGTERM", () => {
            console.log("Received SIGTERM, shutting down gracefully...");
            scheduler.stop();
            knex.destroy().then(() => {
                console.log("Database connection closed");
                process.exit(0);
            });
        });
    } catch (error) {
        console.log("Failed to start application:", error);
        process.exit(1);
    }
}

startApplication();
