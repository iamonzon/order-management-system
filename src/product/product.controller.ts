import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ProductService } from "./product.service";

export class ProductController {
  constructor(private productService: ProductService) { }

  async findProduct(req: Request, res: Response): Promise<void> {
    const product = await this.productService.findProduct(Number(req.params.id));
    res.status(StatusCodes.OK).json(product);
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    const product = await this.productService.createProduct(req.body);
    res.status(StatusCodes.CREATED).json(product);
  }
}
