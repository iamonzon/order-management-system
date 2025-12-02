import { Router } from "express";
import { Container } from "../../core/container";

export function createProductRoutes(container: Container) {
  const controller = container.v1.productController;
  const router = Router();

  router.get("/:id", (req, res) => controller.findProduct(req, res));
  router.post("/", (req, res) => controller.createProduct(req, res));

  return router;
}
