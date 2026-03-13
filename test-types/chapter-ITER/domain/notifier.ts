// Abstraction: Define the contract
export interface Notifier {
  notify(message: string): void;
}

// Implementations
export class EmailNotifier implements Notifier {
  notify(message: string): void {
    // In real code: send email
  }
}

export class SMSNotifier implements Notifier {
  notify(message: string): void {
    // In real code: send SMS
  }
}
