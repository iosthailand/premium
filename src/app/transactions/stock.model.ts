import { ProductItem } from './../products/product-item.model';

export interface Stock {
    id: string;
    productId: string;
    storeId: string;
    dateTime: Date;
    code: string;
    stockIn: number;
    stockOut: number;
    currentStock: number;
    transactionId: string;
}
