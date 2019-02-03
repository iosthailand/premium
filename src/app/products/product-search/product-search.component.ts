import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Product } from '../product.model';
import { ProductsService } from '../products.service';
import 'hammerjs'; // use for mat-paginator
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';
import { HeaderService } from 'src/app/header/hearder.service';
import { NgForm, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  // products = [
  //   { title: "First Product", content: "This is the first product's content" },
  //   { title: "Second Product", content: "This is the second product's content" },
  //   { title: "Third Product", content: "This is the third product's content" }
  // ];
  // form: FormGroup;
  productSearchTxt: string;
  products: Product[] = [];
  isLoading = false;
  isTransactionMode = this.productsService.getTransactionMode();
  totalProducts = 0;
  productsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];
  userIsAuthenticated = false;
  userId: string;
  userType: string;
  private productsSub: Subscription;
  private authStatusSub: Subscription;


  constructor(public productsService: ProductsService, private authService: AuthService, private headerService: HeaderService) {}

  ngOnInit() {
    // this.form = new FormGroup({
    //   // 'transactionId': new FormControl(null, [Validators.required]),
    //   'productSearchTxt': new FormControl(null),
    // });
    // this.products = this.productsService.getProducts();
    this.isLoading = true;
    this.productsService.getProducts(this.productsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.productsSub = this.productsService
      .getProductUpdateListener()
      .subscribe(( productData: { products: Product[], productCounts: number }) => {
        this.isLoading = false;
        this.totalProducts = productData.productCounts;
        this.products = productData.products;
      });
    this.userIsAuthenticated = this.authService.getIsAuth(); // กรณีเข้ามาครั้งแรกจะต้องทราบสถานะว่าล็อกอินอยู่หรือไม่
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated; // การเปลี่ยนแปลงเมื่อผู้ใช้ล็อกอิน
        this.userId = this.authService.getUserId();
      });
    this.userType = this.headerService.getUserType();
    console.log(this.userType );
  }

  ngOnDestroy() {
    this.productsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onAddToTransaction(id: string, qty: number, product: Product) {
    this.productsService.addTransaction(id, qty, this.userId, product);
    // console.log(this.productsService.getProductsTransaction);
  }

  onUpdateSearch(searchText: string) {
    console.log(searchText);

  }
}
