//Shape
// Parent contract
class Shape {
    getArea(): number {
        return 0;
    }
}

// Valid subtype - fulfills contract
class Circle extends Shape {
    constructor(readonly radius: number) {
        super();
    }

    getArea(): number {
        return Math.PI * this.radius * this.radius;
    }
}

// Valid subtype - fulfills contract
class Rectangle extends Shape {
    constructor(readonly width: number, readonly height: number) {
        super();
    }

    getArea(): number {
        return this.width * this.height;
    }
}

class Line extends Shape {
    constructor(readonly width: number) {
        super();
    }

    getArea(): number {
        throw new Error("Line has no area")
    }
}


describe('Chapter A Section 02: Liskov Substitution Principle (LSP)', () => {

    it('should respect the Liskov Principle', () => {

        const shapes: Shape[] = [
            new Circle(5),
            new Rectangle(10, 20)
        ]

        let allAreas = shapes.map(x => x.getArea())
        let sumOfAreas = allAreas.reduce((a, b) => a + b, 0)

        expect(allAreas.pop()).toBe(200)
        expect(allAreas.pop()).toBeCloseTo(78.5, 1e-1)
        expect(sumOfAreas).toBeCloseTo(278.5, 1e-1)
    })


    it('breaks  the Liskov', () => {

        const shapes: Shape[] = [
            new Circle(5),
            new Rectangle(10, 20),
            new Line(5)
        ]

        let allAreas = shapes.map(x => x.getArea())

        expect(allAreas.pop()).not.toBe(0) // run and see 🤔

    })

    // so, what's the solution ?
    // remember the SOLID principles
    // S = Single Responsibility
    // O = Open/Closed
    // L = Liskov Substitution
    // I = Interface Segregation
    // D = Dependency Inversion

    // after L comes I => Interface Segregation Principle
    // let's create a contract for each compatible shape

    interface IShape {
        getLength(): number
    }

    interface Shape2D extends IShape {
        getArea(): number
    }

    interface Shape3D extends Shape2D {
        getVolume(): number
    }

    it('should check that the LSP is respected with 2D shapes', () => {
        class Shape2DImpl implements Shape2D {
            getLength(): number {
                return 0;
            }

            getArea(): number {
                return 0;
            }
        }

        class Circle2D implements Shape2D {
            constructor(readonly radius: number) {
            }

            getLength(): number {
                return 2 * Math.PI * this.radius;
            }

            getArea(): number {
                return Math.PI * this.radius * this.radius;
            }
        }

        class Rectangle2D implements Shape2D {
            constructor(readonly width: number, readonly height: number) {
            }

            getLength(): number {
                return 2 * (this.width + this.height);
            }

            getArea(): number {
                return this.width * this.height;
            }
        }

        class Line1D implements IShape {
            constructor(readonly width: number) {
            }

            getLength(): number {
                return this.width;
            }
        }

        const shapes2D: Shape2D[] = [
            new Circle2D(5),
            new Rectangle2D(10, 20)
        ];

        const shapes1D: IShape[] = [
            new Circle2D(5),
            new Rectangle2D(10, 20),
            new Line1D(5)
        ];

        const allAreas = shapes2D.map(x => x.getArea());
        const allLengths = shapes2D.map(x => x.getLength());
        const sumOfAreas = allAreas.reduce((a, b) => a + b, 0);

        expect(allAreas[0]).toBeCloseTo(78.5, 1e-1);
        expect(allAreas[1]).toBe(200);
        expect(allLengths[0]).toBeCloseTo(31.4, 1e-1);
        expect(allLengths[1]).toBe(60);
        expect(sumOfAreas).toBeCloseTo(278.5, 1e-1);

        // Line is only IShape, not Shape2D - LSP is respected
        const line: IShape = new Line1D(5);
        expect(line.getLength()).toBe(5);


        class Cube implements Shape3D {
            constructor(readonly edge: number) {            }
            getLength(): number {return this.edge;}
            getArea(): number {return this.edge * this.edge;}
            getVolume(): number {return this.edge * this.edge * this.edge;}
        }

        // volume is not defined for 1D shapes
        // expect(() => line.getVolume()).toThrow();

        // volume is not defined for 2D shapes
        //expect(() => shapes2D[0].getVolume()).toThrow();

        // volume is defined only for 3D shapes
        const cube = new Cube(3)
        expect(  cube.getVolume()).toBe(27)
    });


})
