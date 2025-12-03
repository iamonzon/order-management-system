import { Router } from "express";
import { Container } from "../../core/container";

export function createCustomerRoutes(container: Container) {
  const controller = container.v1.customerController;
  const router = Router();

  router.get("/", (req, res) => controller.listCustomers(req, res));
  router.get("/:id", (req, res) => controller.findCustomer(req, res));
  router.post("/", (req, res) => controller.createCustomer(req, res));

  return router;
}