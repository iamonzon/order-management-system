import { Router } from "express";
import { Container } from "../core/container";
import { createV1Routes } from "./v1";
import { createHealthRoutes } from "./health";
import { createGraphQLRoutes } from "../graphql/schema";

export function createRoutes(container: Container) {
  const router = Router();

  router.use("/health", createHealthRoutes(container));
  router.use("/v1", createV1Routes(container));
  router.use("/graphql", createGraphQLRoutes(container));

  return router;
}