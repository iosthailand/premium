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
  private productsTransactionSub = new Subject<ProductItem[]>();
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
            productSupplier: product.productSupplier,
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


  getSearchProducts() {
    this.http
      .get<{message: string, products: any, maxProducts: number}>(BACKEND_URL)
      .pipe(map((productData) => {  // map result only get product content not include message
        return { products: productData.products.map((product) => { // map _id from database to id same as in model
          return {
            id: product._id,
            productSku: product.productSku,
            productName: product.productName,
            productDetails: product.productDetails,
            productCategory: product.productCategory,
            productSupplier: product.productSupplier,
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
  getProductsTransactionListener() {
    return this.productsTransactionSub.asObservable();
  }
  getTransactionMode() {
    return this.transactionMode;
  }
  setTransactionMode(mode: boolean) {
    this.transactionMode = mode;
  }

  clearProductTransaction() {
    this.productsTransaction = [];
    this.productsCounted.next(this.productsTransaction.length); // แสดงตัวเลขที่ตะกร้าสินค้า โดยการบังคับส่งค่าด้วย next() ใน Subject
    this.productsTransactionSub.next(this.productsTransaction);
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
      productSupplier: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addProduct(productSku: string, productName: string, productDetails: string,
    productCategory: string, productSupplier: string, image: File) {
    const productData = new FormData(); // แบบฟอร์มที่สามารถมีข้อความ และข้อมูลไฟล์ได้
    productData.append('productSku', productSku);
    productData.append('productName', productName);
    productData.append('productDetails', productDetails);
    productData.append('productCategory', productCategory);
    productData.append('productSupplier', productSupplier);
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
    id: string, productSku: string, productName: string, productDetails: string,
    productCategory: string, productSupplier: string, image: File | string
    ) {
    let productData: Product | FormData;
    if (typeof image === 'object') {
      productData = new FormData();
      productData.append('id', id);
      productData.append('productSku', productSku);
      productData.append('productName', productName);
      productData.append('productDetails', productDetails);
      productData.append('productCategory', productCategory);
      productData.append('productSupplier', productSupplier);
      productData.append('image', image, productSku);
    } else {
      productData = {
        id: id,
        productSku: productSku,
        productName: productName,
        productDetails: productDetails,
        productCategory: productCategory,
        productSupplier: productSupplier,
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
  addTransaction(productId: string, quantity: number, userId: string, product: Product) {
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
          userId: userId,
          editingMode: false,
          product: product
        };
        this.productsTransaction[index] = transaction;
        // this.productsTransaction.splice(index, 1);
      }
    } else {
      transaction = {
        productId: productId,
        quantity: +quantity,
        userId: userId,
        editingMode: false,
        product: product
      };
      this.productsTransaction.push(transaction);
    }
    console.log(this.productsTransaction);
    this.productsCounted.next(this.productsTransaction.length); // แสดงตัวเลขที่ตะกร้าสินค้า โดยการบังคับส่งค่าด้วย next() ใน Subject
    this.productsTransactionSub.next(this.productsTransaction); // นำเอารายการสินค้าและจำนวนที่อยู่ในตะกร้า Transaction ไปใช้งาน
  }
  delelteTransaction(productId: string) {
    const oldProductInTransaction = this.productsTransaction.filter(element => element.productId === productId);
    if (oldProductInTransaction.length === 1) {
      const index = this.productsTransaction.indexOf(oldProductInTransaction[0], 0);
      if (index > -1) {
        this.productsTransaction.splice(index, 1);
        this.productsCounted.next(this.productsTransaction.length); // แสดงตัวเลขที่ตะกร้าสินค้า โดยการบังคับส่งค่าด้วย next() ใน Subject
        this.productsTransactionSub.next(this.productsTransaction); // นำเอารายการสินค้าและจำนวนที่อยู่ในตะกร้า Transaction ไปใช้งาน
      }
    }
  }
  editTransaction(productId: string, quantity: number, product: Product) {
    const oldProductInTransaction = this.productsTransaction.filter(element => element.productId === productId);
    if (oldProductInTransaction.length === 1) {
      const index = this.productsTransaction.indexOf(oldProductInTransaction[0], 0);
      console.log(this.productsTransaction);
      if (index > -1) {
        const userId = this.productsTransaction[index].userId;
        this.productsTransaction[index] = {
          productId: productId,
          quantity: +quantity,
          userId: userId,
          editingMode: false,
          product: product
        };
        console.log(this.productsTransaction);
        this.productsCounted.next(this.productsTransaction.length); // แสดงตัวเลขที่ตะกร้าสินค้า โดยการบังคับส่งค่าด้วย next() ใน Subject
        this.productsTransactionSub.next(this.productsTransaction); // นำเอารายการสินค้าและจำนวนที่อยู่ในตะกร้า Transaction ไปใช้งาน
      }
    }
  }
}
