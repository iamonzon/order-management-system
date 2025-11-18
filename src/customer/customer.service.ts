import { Customer } from "./customer";
import { CreateCustomerDTO } from "./customer.dto";
import { CustomerRepository } from "./customer.repository";

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) { }

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    const newCustomer = this.customerRepository.insert({
      email: data.email,
      name: data.name,
    });
    return newCustomer;
  }
}