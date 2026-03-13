// Abstraction: Define the contract
export interface PaymentProcessor {
  process(amount: number): boolean;
  getProviderName(): string;
}

// Implementations
export class CreditCardProcessor implements PaymentProcessor {
  process(amount: number): boolean {
    return amount > 0 && amount < 10000;
  }

  getProviderName(): string {
    return 'Credit Card';
  }
}

export class PayPalProcessor implements PaymentProcessor {
  process(amount: number): boolean {
    return amount > 0;
  }

  getProviderName(): string {
    return 'PayPal';
  }
}
