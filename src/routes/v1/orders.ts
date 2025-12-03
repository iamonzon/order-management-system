import { Router } from "express";
import { validate } from "../../middleware/validate-body";
import { CreateOrderSchema } from "../../order/order.dto";
import { Container } from "../../core/container";

export function createOrderRoutes(container: Container) {
  const controller = container.v1.orderController;
  const router = Router();

  router.get('/', (req, res) => controller.listOrders(req, res));
  router.get('/:id', (req, res) => controller.findOrder(req, res));
  router.post('/', validate(CreateOrderSchema), (req, res) => controller.createOrder(req, res));

  return router;
}