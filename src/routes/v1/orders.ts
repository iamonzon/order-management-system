import { Router } from "express";
import { validate } from "../../middleware/validate-body";
import { CreateOrderSchema } from "../../order/order.dto";
import { Container } from "../../core/container";

export function createOrderRoutes(container: Container) {
  const controller = container.v1.orderController;
  const router = Router()

  router.get('/:id', controller.findOrder)
  router.post('/', validate(CreateOrderSchema), controller.createOrder)

  return router;
}