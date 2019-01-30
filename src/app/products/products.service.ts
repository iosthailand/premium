import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { ProductItem } from './product-item.model';
const BACKEND_URL = environment.apiUrl + '/products/';


@Injectable({providedIn: 'root'})
export class ProductsService {
  private transactionMode = false;
  private products: Product[] = [];
  private productsTransaction: ProductItem[] = [];
  private productsUpdated = new Subject<{products: Product[], productCounts: number} >();
  private productsCounted = new Subject<number>();
  constructor(private http: HttpClient, private router: Router) {}

  getProducts(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{message: string, products: any, maxProducts: number}>(BACKEND_URL + queryParams)
      .pipe(map((productData) => {  // map result only get product content not include message
        return { products: productData.products.map((product) => { // map _id from database to id same as in model
          return {
            id: product._id,
            productSku: product.productSku,
            productName: product.productName,
            productDetails: product.productDetails,
            productCategory: product.productCategory,
            imagePath: product.imagePath,
            creator: product.creator
          };
        }),
        maxProducts: productData.maxProducts };
      })
      )
      .subscribe((transformProduct) => {
        this.products = transformProduct.products;  // Transform form { id, title, content } to { _id, title, content }
        this.productsUpdated.next({
          products: [...this.products],
          productCounts: transformProduct.maxProducts
        });
      });
  }

  getProductUpdateListener() {
    return this.productsUpdated.asObservable();
  }

  getProductCountListener() {
    return this.productsCounted.asObservable();
  }
  getTransactionMode() {
    return this.transactionMode;
  }
  setTransactionMode(mode: boolean) {
    this.transactionMode = mode;
  }

  clearProductTransaction() {
    this.productsTransaction = [];
  }
  getProductsTransaction() {
    return this.productsTransaction;
  }
  getProduct(id: string) {
    // return {...this.products.find(product => product.id === id)};
    return this.http.get<{
      _id: string,
      productSku: string,
      productName: string,
      productDetails: string,
      productCategory: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addProduct(productSku: string, productName: string, productDetails: string, productCategory: string, image: File) {
    const productData = new FormData(); // แบบฟอร์มที่สามารถมีข้อความ และข้อมูลไฟล์ได้
    productData.append('productSku', productSku);
    productData.append('productName', productName);
    productData.append('productDetails', productDetails);
    productData.append('productCategory', productCategory);
    productData.append('image', image, productSku);

    this.http
      .post<{ message: string, product: Product }>(
      BACKEND_URL,
      productData
      )
    .subscribe((responseData) => {
      this.router.navigate(['/products']);
    });
  }

  updateProduct(
    id: string, productSku: string, productName: string, productDetails: string, productCategory: string, image: File | string
    ) {
    let productData: Product | FormData;
    if (typeof image === 'object') {
      productData = new FormData();
      productData.append('id', id);
      productData.append('productSku', productSku);
      productData.append('productName', productName);
      productData.append('productDetails', productDetails);
      productData.append('productCategory', productCategory);
      productData.append('image', image, productSku);
    } else {
      productData = {
        id: id,
        productSku: productSku,
        productName: productName,
        productDetails: productDetails,
        productCategory: productCategory,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(BACKEND_URL + id, productData)
      .subscribe((response) => {
          this.router.navigate(['/products']);
      });
  }
  deleteProduct(productId: string) {
    return this.http.delete(BACKEND_URL + productId);
  }
  addTransaction(productId: string, quantity: number, userId: string) {
    let transaction: ProductItem;
    const oldProductInTransaction = this.productsTransaction.filter(element => element.productId === productId);

    // check array length for find old item exiting
    if (oldProductInTransaction.length === 1) {
      const qty = +oldProductInTransaction[0].quantity;
      const index = this.productsTransaction.indexOf(oldProductInTransaction[0], 0);
      if (index > -1) {
        transaction = {
          productId: productId,
          quantity: +quantity + qty,
          userId: userId
        };
        this.productsTransaction[index] = transaction;
        // this.productsTransaction.splice(index, 1);
      }
    } else {
      transaction = {
        productId: productId,
        quantity: +quantity,
        userId: userId
      };
      this.productsTransaction.push(transaction);
    }
    console.log(this.productsTransaction);
    this.productsCounted.next(this.productsTransaction.length);
  }
}
