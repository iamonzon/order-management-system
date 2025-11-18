import { Router } from "express";
import { Container } from "../../core/container";

export function createCustomerRoutes(container: Container) {
  const controller = container.v1.customerController
  const router = Router()

  router.post("/", (req, res) => controller.createCustomer(req, res))

  return router;
}