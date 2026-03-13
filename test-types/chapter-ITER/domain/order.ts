// @ts-ignore
import { OrderStatus } from './order-status';

// @ts-ignore
import { PaymentProcessor } from './payment-processor';

export class Order {
  private status: OrderStatus;

  constructor(readonly orderId: string, initialStatus: OrderStatus) {
    this.status = initialStatus;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  updateStatus(newStatus: OrderStatus): void {
    this.status = newStatus;
  }

  chargePayment(processor: PaymentProcessor, amount: number): boolean {
    return processor.process(amount);
  }
}
