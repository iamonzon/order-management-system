import { Customer } from "./customer";
import { CreateCustomerDTO } from "./customer.dto";
import { CustomerRepository } from "./customer.repository";

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) { }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.find(email);
  }

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    const newCustomer = this.customerRepository.insert({
      email: data.email,
      name: data.name,
    });
    return newCustomer;
  }
}