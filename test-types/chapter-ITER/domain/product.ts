// Abstraction: Define the contract
export interface Product {
  id: string;
  name: string;
  getPrice(): number;
}

export interface ForbiddenProduct extends Product {
  readonly  __brand: 'forbidden';
}

export interface AllowedProduct extends Product {
  readonly  __brand: 'allowed';
}

// Implementations
export class PhysicalProduct implements AllowedProduct {
  constructor(readonly id: string, readonly name: string, readonly price: number) {}

  __brand : "allowed" = "allowed";

   private TRANSPORT_FEES_RATE = 0.1;

  getPrice(): number {
    return this.price + this.price * this.TRANSPORT_FEES_RATE;
  }
}

export class DigitalProduct implements AllowedProduct {
  constructor(readonly id: string, readonly name: string, readonly price: number) {}

  __brand: "allowed" = "allowed";

  getPrice(): number {
    return this.price;
  }
}

export class DangerousProduct implements ForbiddenProduct {
  constructor(readonly id: string, readonly name: string, readonly price: number) {}

  __brand: "forbidden" = "forbidden";

  getPrice(): number {
    return this.price;
  }
}


export class EAN13 {
    constructor(readonly code: string) {
      if (!/^[0-9]{13}$/.test(code)) {
        throw new Error('Invalid EAN13 code');
      }
    }
}


