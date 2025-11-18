import { Router } from "express";
import { createOrderRoutes } from "./orders";
import { Container } from "../../core/container";
import { createCustomerRoutes } from "./customer";

export function createV1Routes(container: Container) {
  const router = Router()

  router.use('/orders', createOrderRoutes(container))
  router.use('/customers', createCustomerRoutes(container))

  return router;
}