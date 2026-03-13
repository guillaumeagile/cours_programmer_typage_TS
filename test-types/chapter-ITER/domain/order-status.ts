// Abstraction: Define the contract
export interface OrderStatus {
  name: string;
  getDescription(): string;
}

// Implementations
export class PendingStatus implements OrderStatus {
  constructor(readonly name: string) {}

  getDescription(): string {
    return 'Awaiting payment';
  }
}

export class ShippedStatus implements OrderStatus {
  constructor(readonly name: string) {}

  getDescription(): string {
    return 'In transit';
  }
}

export class DeliveredStatus implements OrderStatus {
  constructor(readonly name: string) {}

  getDescription(): string {
    return 'Delivered';
  }
}
