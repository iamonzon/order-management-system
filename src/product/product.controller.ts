import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ProductService } from "./product.service";
import { parsePaginationParams } from "../types/pagination";

export class ProductController {
  constructor(private productService: ProductService) { }

  async findProduct(req: Request, res: Response): Promise<void> {
    const product = await this.productService.findProduct(Number(req.params.id));
    res.status(StatusCodes.OK).json(product);
  }

  async listProducts(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query as { page?: string; limit?: string });
    const result = await this.productService.list(pagination);
    res.status(StatusCodes.OK).json(result);
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    const product = await this.productService.createProduct(req.body);
    res.status(StatusCodes.CREATED).json(product);
  }
}
