import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';


import { Product } from 'src/app/products/product.model';

// import 'hammerjs'; // use for mat-paginator

import { AuthService } from 'src/app/auth/auth.service';
import { HeaderService } from 'src/app/header/hearder.service';

import { ProductsService } from 'src/app/products/products.service';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  searchText: string;
  products: Product[] = [];
  isLoading = false;
  isTransactionMode = this.productsService.getTransactionMode();
  totalProducts = 0;
  userIsAuthenticated = false;
  userId: string;
  userType: string;
  private productsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public productsService: ProductsService, private authService: AuthService, private headerService: HeaderService) {}

  ngOnInit() {
    this.isLoading = true;
    this.productsService.getSearchProducts();  // ไม่ระบุจำนวนสินค้าต่อหนึ่งหน้า
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
    // console.log(this.userType );
  }

  ngOnDestroy() {
    this.productsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onAddToTransaction(id: string, qty: number, product: Product) {
    this.productsService.addTransaction(id, qty, this.userId, product);
    // console.log(this.productsService.getProductsTransaction);
  }

  onUpdateSearch(e) {
    // เมธอดนี้ไม่ได้ทำอะไร แต่ใช้เพื่อทริกให้เกิด keyup เพื่อตรวจสอบค่าที่อยู่ในช่องค้นหา
  }
}
