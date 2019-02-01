import { Product } from './product.model';

export class ProductItem {

    productId: string;
    quantity: number;
    editingMode: boolean;
    userId: string;
    product: Product;

}
