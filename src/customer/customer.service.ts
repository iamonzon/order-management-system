import { Customer } from "./customer";
import { CreateCustomerDTO } from "./customer.dto";
import { CustomerRepository } from "./customer.repository";
import { PaginatedResult, PaginationParams } from "../types/pagination";

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) { }

  async findById(id: number): Promise<Customer> {
    return this.customerRepository.findById(id);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.find(email);
  }

  async list(params: PaginationParams): Promise<PaginatedResult<Customer>> {
    return this.customerRepository.findAll(params.page, params.limit);
  }

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    const newCustomer = this.customerRepository.insert({
      email: data.email,
      name: data.name,
    });
    return newCustomer;
  }
}