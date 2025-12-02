import { Product } from "./product";
import { CreateProductDTO } from "./product.dto";
import { ProductRepository } from "./product.repository";

export class ProductService {
  constructor(private repository: ProductRepository) { }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    return this.repository.insertProduct({
      name: data.name,
      price: data.price,
      stock_quantity: data.stock_quantity,
    });
  }

  async findProduct(id: number): Promise<Product> {
    return this.repository.findById(id);
  }
}
