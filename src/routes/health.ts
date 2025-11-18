import { Router } from "express";
import { Container } from "../core/container";
import { StatusCodes } from "http-status-codes";
import { getErrorMessage } from "../utils/errors";

export function createHealthRoutes(container: Container) {
  const router = Router()

  router.get("/live", (req, res) => {
    res.json({
      status: 'alive',
    })
  })

  router.get("/ready", async (req, res) => {
    try {
      await container.db.query("SELECT 1");

      res.json({
        status: "ready",
        checks: {
          database: 'connected',
        },
      });
    } catch (error) {
      console.error('Database health check failed:', error);

      res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        status: "not ready",
        checks: {
          database: 'disconnected'
        },
        error: getErrorMessage(error),
      });
    }
  });

  return router;
}