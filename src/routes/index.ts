import { Router } from "express";
import { Container } from "../core/container";
import { createV1Routes } from "./v1";
import { createHealthRoutes } from "./health";

export function createRoutes(container: Container) {
  const router = Router()

  // Default
  router.use('/health', createHealthRoutes(container))

  router.use('/v1', createV1Routes(container))

  return router;
}