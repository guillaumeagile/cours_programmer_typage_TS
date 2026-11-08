/**
 * Chapter B — Section B2: Liskov Substitution Principle (the "L" of SOLID)   (~10 min)
 * Theory: ./README.md#b2-liskov-substitution-principle
 *
 * Goals
 *   - see a subclass that compiles but breaks its parent's contract
 *   - fix the design with smaller interfaces (Interface Segregation, the "I" of SOLID)
 *   - let the compiler refuse the wrong substitution
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('B2. Liskov Substitution Principle', () => {
  describe('1. A hierarchy that breaks the contract', () => {
    // Contract: "every Shape has an area"
    abstract class Shape {
      abstract getArea(): number;
    }

    class Circle extends Shape {
      constructor(readonly radius: number) {
        super();
      }
      getArea(): number {
        return Math.PI * this.radius ** 2;
      }
    }

    class Rectangle extends Shape {
      constructor(
        readonly width: number,
        readonly height: number,
      ) {
        super();
      }
      getArea(): number {
        return this.width * this.height;
      }
    }

    // A line is a shape… but it has no area.
    class Line extends Shape {
      constructor(readonly length: number) {
        super();
      }
      getArea(): number {
        throw new Error('A line has no area');
      }
    }

    const totalArea = (shapes: Shape[]) => shapes.reduce((sum, s) => sum + s.getArea(), 0);

    it('works as long as every subclass honours the contract', () => {
      expect(totalArea([new Circle(1), new Rectangle(10, 20)])).toBeCloseTo(203.14, 2);
    });

    it('😱 compiles, then crashes when a Line is substituted', () => {
      const shapes: Shape[] = [new Circle(1), new Rectangle(10, 20), new Line(5)]; // ✓ for the compiler

      expect(() => totalArea(shapes)).toThrow('A line has no area');
    });
  });

  describe('2. The fix: split the contract (Interface Segregation)', () => {
    interface Shape1D {
      getLength(): number;
    }

    interface Shape2D extends Shape1D {
      getArea(): number;
    }

    class Circle implements Shape2D {
      constructor(readonly radius: number) {}
      getLength(): number {
        return 2 * Math.PI * this.radius;
      }
      getArea(): number {
        return Math.PI * this.radius ** 2;
      }
    }

    class Rectangle implements Shape2D {
      constructor(
        readonly width: number,
        readonly height: number,
      ) {}
      getLength(): number {
        return 2 * (this.width + this.height);
      }
      getArea(): number {
        return this.width * this.height;
      }
    }

    class Line implements Shape1D {
      constructor(readonly length: number) {}
      getLength(): number {
        return this.length;
      }
    }

    const totalArea = (shapes: Shape2D[]) => shapes.reduce((sum, s) => sum + s.getArea(), 0);
    const totalLength = (shapes: Shape1D[]) => shapes.reduce((sum, s) => sum + s.getLength(), 0);

    it('the compiler now refuses a Line among 2D shapes', () => {
      // @ts-expect-error — Line has no getArea(): it is not a Shape2D
      const shapes: Shape2D[] = [new Circle(1), new Line(5)];

      expect(shapes).toHaveLength(2);
    });

    it('every shape can still be used where only a length is needed', () => {
      const all: Shape1D[] = [new Circle(1), new Rectangle(10, 20), new Line(5)];

      expect(totalLength(all)).toBeCloseTo(6.28 + 60 + 5, 1);
      expect(totalArea([new Circle(1), new Rectangle(10, 20)])).toBeCloseTo(203.14, 2);
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 B2.1 add a `Shape3D` interface with getVolume(), and a `Cube` class; which lists accept a Cube?');
    it.todo('🫵 B2.2 classic: is a `Square extends Rectangle` with setWidth()/setHeight() a Liskov violation? Prove it with a test');
  });
});
