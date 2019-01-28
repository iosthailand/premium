import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/products/';


@Injectable({providedIn: 'root'})
export class ProductsService {
  private products: Product[] = [];
  private productsUpdated = new Subject<{products: Product[], productCounts: number} >();

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
}
