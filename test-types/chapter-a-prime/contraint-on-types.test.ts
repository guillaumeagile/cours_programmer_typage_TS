import {
    AllowedProduct,
    DangerousProduct,
    DigitalProduct,
    EAN13,
    ForbiddenProduct,
    PhysicalProduct
} from "./domain/product";


describe('Contraint on types', () => {
    it('should ', () => {


        let authorizedProducts: Array<AllowedProduct | ForbiddenProduct> = [];
        let forbiddenProducts: ForbiddenProduct[] = [];

        authorizedProducts.push(new PhysicalProduct('1', 'Product 1', 10));
        authorizedProducts.push(new DigitalProduct('2', 'Product 2', 20));
       authorizedProducts.push(new DangerousProduct('3', 'Product 3', 30));

        let catalogue : Map<EAN13, AllowedProduct > = new Map();

        catalogue.set(new EAN13('1234567890123'), new PhysicalProduct('1', 'Product 1', 10));
       // catalogue.set(new EAN13('1234567890124'), new DangerousProduct('2', 'Product 2', 20));
    });
});