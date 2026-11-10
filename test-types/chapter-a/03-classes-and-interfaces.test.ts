/**
 * Chapitre A — Section A3 : POO en TypeScript : classes et interfaces   (~25 min)
 * Théorie : ./README.md#a3-oop-in-typescript-classes-and-interfaces
 *
 * Objectifs
 *   - écrire des classes à la manière TypeScript (propriétés de paramètres, readonly, modificateurs d'accès)
 *   - utiliser les interfaces comme contrats : `implements`, `extends`, plusieurs à la fois
 *   - construire une hiérarchie avec `extends`, `abstract`, `override`, et utiliser le polymorphisme
 *   - connaître ce qui est DIFFÉRENT de Java / C# :
 *       les interfaces disparaissent à l'exécution, les classes sont comparées structurellement,
 *       `private` n'existe qu'à la compilation, `this` peut se perdre
 *
 * Marqueurs : `@ts-expect-error` = erreur de typage volontaire (supprime-le pour voir le message),
 *             😱 = piège, 🫵 = exercice.
 */

describe('A3. OOP in TypeScript: classes and interfaces', () => {
  describe('1. A class is a type AND a runtime value', () => {
    class Product {
      // propriétés de paramètres : déclarées et assignées dans la signature du constructeur
      constructor(
        readonly id: string,
        readonly name: string,
        private price: number,
      ) {}

      label(): string {
        return `${this.name} (${this.price} €)`;
      }

      applyDiscount(rate: number): void {
        this.price = this.price * (1 - rate);
      }
    }

    it('groups data and behaviour', () => {
      const laptop = new Product('PROD-1', 'Laptop', 1000);
      laptop.applyDiscount(0.1);

      expect(laptop.label()).toBe('Laptop (900 €)');
      expect(laptop).toBeInstanceOf(Product); // une classe existe à l'exécution
    });

    it('😱 a class is a runtime value: its methods live on one shared prototype', () => {
      // « prototype » vient du grec : prôtos (premier) + typos (moule).
      // Un type est un moule de compilation, effacé à la runtime;
      // le prototype est un moule à l'exécution, un objet au sens Javascript du terme.
      class Item {
        constructor(readonly id: string) {}
        label(): string {
          return `Item ${this.id}`;
        }
      }
      const a = new Item('A');
      const b = new Item('B');

      expect(typeof Item).toBe('function'); // la classe est une valeur, une fonction à l'exécution. En JavaScript, la classe est la fonction constructeur !
      expect(Item.prototype.hasOwnProperty('label')).toBe(true); // la méthode est sur le prototype
      expect(Object.prototype.hasOwnProperty.call(a, 'label')).toBe(false); // la méthode n'est pas copiée dans chaque objet…
      expect(Object.getPrototypeOf(a)).toBe(Item.prototype);
      expect(Object.getPrototypeOf(b)).toBe(Item.prototype); // …elle est déléguée au prototype partagé
      expect(a.label).toBe(b.label);
      /*
      En TypeScript, le runtime (V8) est celui de JavaScript : les valeurs sont exactement les mêmes.
      TypeScript ajoute une couche de types, qui n'existe qu'à la compilation et disparaît ensuite à la runtime.

Donc :
- À l'exécution : mêmes valeurs qu'en JS (primitives, objets, fonctions). Une classe reste une fonction constructeur.
- Au niveau des types : tout a un type, mais tout n'est pas une fonction. string, number, { name: string },
'pending' | 'shipped', never, unknown sont des types qui ne décrivent pas des fonctions.
Les types de fonction ((x: number) => boolean) sont une catégorie parmi d'autres.
       */
    });

    it('readonly and private are checked by the compiler', () => {
      const laptop = new Product('PROD-1', 'Laptop', 1000);

      // @ts-expect-error — `id` est readonly
      laptop.id = 'PROD-2';

      // @ts-expect-error — `price` est private
      laptop.price = 0;

      expect(laptop.label()).toBe('Laptop (0 €)'); // 😱 …mais seulement pour le compilateur : l'affectation a bien été exécutée
    });

    it('😱 `private` is erased at runtime; `#field` (JavaScript private) is not', () => {
      class Account {
        private pin = '1234'; // private de TypeScript : une convention à la compilation
        #secret = 'abcd'; // private de JavaScript : imposé par le runtime

        hasSecret(): boolean {
          return this.#secret.length > 0;
        }
      }
      const account = new Account();

      expect(JSON.stringify(account)).toBe('{"pin":"1234"}'); // le « private » pin fuit
      expect((account as any)['pin']).toBe('1234');
      expect(account.hasSecret()).toBe(true); // #secret est vraiment caché
    });
  });

  describe('2. Interfaces: contracts that vanish at runtime', () => {
    interface Notifier {
      send(to: string, message: string): boolean;
    }

    interface Auditable {
      readonly history: string[];
    }

    // une interface peut étendre une ou plusieurs autres interfaces
    interface AuditedNotifier extends Notifier, Auditable {}

    // une classe peut implémenter plusieurs interfaces
    class EmailNotifier implements Notifier, Auditable {
      readonly history: string[] = [];
      send(to: string, message: string): boolean {
        this.history.push(`${to}: ${message}`);
        return true;
      }
    }

    it('`implements` makes the compiler check the class against the contract', () => {
      const notifier: AuditedNotifier = new EmailNotifier();
      notifier.send('alice@example.com', 'Your order has shipped');

      expect(notifier.history).toEqual(['alice@example.com: Your order has shipped']);
    });

    it('refuses a class that does not fulfil the contract', () => {
      // @ts-expect-error — `send` est manquant
      class BrokenNotifier implements Notifier {}

      expect(new BrokenNotifier()).toBeDefined();
    });

    it('😱 no class is needed: any object of the right shape is a Notifier (structural, see A2)', () => {
      const silent: Notifier = { send: () => true };

      expect(silent.send('bob@example.com', 'hi')).toBe(true);
    });

    it('😱 an interface does not exist at runtime: no `instanceof Notifier`', () => {
      const notifier: unknown = new EmailNotifier();

      // @ts-expect-error — 'Notifier' ne désigne qu'un type, il n'a aucune valeur à l'exécution
      expect(() => notifier instanceof Notifier).toThrow(ReferenceError);

      // pour vérifier à l'exécution, on regarde la forme (plus de détails en A4 avec les prédicats de type)
      expect(typeof notifier === 'object' && notifier !== null && 'send' in notifier).toBe(true);
    });
  });

  describe('3. Inheritance and polymorphism: extends, abstract, override', () => {
    abstract class PaymentMethod {
      abstract fees(amount: number): number; // sans corps : chaque sous-classe décide

      total(amount: number): number {
        return amount + this.fees(amount); // comportement commun, écrit une seule fois
      }
    }

    class CreditCard extends PaymentMethod {
      fees(amount: number): number {
        return amount * 0.02;
      }
    }

    class BankTransfer extends PaymentMethod {
      fees(): number {
        return 1;
      }
    }

    class InternationalTransfer extends BankTransfer {
      constructor(readonly country: string) {
        super();
      }
      override fees(): number {
        return super.fees() + 4; // `override` + `super` : on réutilise la version du parent
      }
    }

    it('an abstract class cannot be instantiated', () => {
      // @ts-expect-error — PaymentMethod est abstraite
      expect(() => new PaymentMethod()).not.toThrow(); // 😱 à l'exécution, rien ne l'en empêche
    });

    it('polymorphism: one piece of code, the right method picked at runtime', () => {
      const methods: PaymentMethod[] = [new CreditCard(), new BankTransfer(), new InternationalTransfer('CA')];

      expect(methods.map((m) => m.total(100))).toEqual([102, 101, 105]);
    });

    it('a subclass is usable where the parent is expected, not the other way around', () => {
      const payment: BankTransfer = new InternationalTransfer('CA'); // ✓

      // @ts-expect-error — un BankTransfer n'a pas de `country` : ce n'est pas une InternationalTransfer
      const international: InternationalTransfer = new BankTransfer();

      expect(payment.total(100)).toBe(105);
      expect(international.country).toBeUndefined();
    });
  });

  describe('4. Interface or abstract class?', () => {
    // interface : un contrat pur, sans code ; une classe peut en implémenter plusieurs
    // classe abstraite : une implémentation partielle à partager ; héritage simple uniquement
    interface Shippable {
      weightKg(): number;
    }

    class Book implements Shippable {
      constructor(private readonly pages: number) {}
      weightKg(): number {
        return this.pages * 0.002;
      }
    }

    it('prefer an interface by default; use an abstract class when there is code to share', () => {
      const parcel: Shippable[] = [new Book(500), { weightKg: () => 2 }];

      expect(parcel.reduce((sum, item) => sum + item.weightKg(), 0)).toBe(3);
    });
  });

  describe('5. 😱 Differences that surprise Java / C# developers', () => {
    it('two unrelated classes with the same shape are interchangeable', () => {
      class Euro {
        constructor(readonly amount: number) {}
      }
      class Dollar {
        constructor(readonly amount: number) {}
      }

      const price: Euro = new Dollar(10); // ✓ typage structurel, même pour les classes

      expect(price).toBeInstanceOf(Dollar);
    });

    it('…unless they have a private member: then the class behaves nominally', () => {
      class Euro {
        private readonly currency = 'EUR';
        constructor(readonly amount: number) {}
      }
      class Dollar {
        private readonly currency = 'USD';
        constructor(readonly amount: number) {}
      }

      // @ts-expect-error — deux déclarations séparées d'une propriété private
      const price: Euro = new Dollar(10);

      expect(price.amount).toBe(10);
    });

    it('a method loses its `this` when passed as a callback', () => {
      class Cart {
        items: string[] = [];
        add(item: string): void {
          this.items.push(item);
        }
        addArrow = (item: string): void => {
          this.items.push(item); // une fonction fléchée capture `this` une fois pour toutes
        };
      }
      const cart = new Cart();

      expect(() => ['pen', 'book'].forEach(cart.add)).toThrow(TypeError); // `this` vaut undefined
      ['pen', 'book'].forEach(cart.addArrow); // ✓

      expect(cart.items).toEqual(['pen', 'book']);
    });

    it('no method overloading: one implementation, several signatures', () => {
      class PriceFormatter {
        format(amount: number): string;
        format(amount: number, currency: string): string;
        format(amount: number, currency = '€'): string {
          // l'unique implémentation doit gérer toutes les signatures
          return `${amount.toFixed(2)} ${currency}`;
        }
      }
      const formatter = new PriceFormatter();

      expect(formatter.format(5)).toBe('5.00 €');
      expect(formatter.format(5, '$')).toBe('5.00 $');
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A3.1 add a `PayPal` payment method (fees: 0.5 € + 3 %) and test `total(100)`');
    it.todo('🫵 A3.2 write an `SmsNotifier` that implements `Notifier` and refuses messages over 160 characters');
  });
});
