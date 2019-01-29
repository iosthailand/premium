import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Store } from '../store.model';
import { StoresService } from '../stores.service';
import 'hammerjs'; // use for mat-paginator
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreListComponent implements OnInit, OnDestroy {
  // stores = [
  //   { title: "First Store", content: "This is the first store's content" },
  //   { title: "Second Store", content: "This is the second store's content" },
  //   { title: "Third Store", content: "This is the third store's content" }
  // ];
  stores: Store[] = [];
  isLoading = false;
  totalStores = 0;
  storesPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];
  userIsAuthenticated = false;
  userId: string;
  private storesSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public storesService: StoresService, private authService: AuthService) {}

  ngOnInit() {
    // this.stores = this.storesService.getStores();
    this.isLoading = true;
    this.storesService.getStores(this.storesPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.storesSub = this.storesService
      .getStoreUpdateListener()
      .subscribe(( storeData: { stores: Store[], storeCounts: number }) => {
        this.isLoading = false;
        this.totalStores = storeData.storeCounts;
        this.stores = storeData.stores;
      });
    this.userIsAuthenticated = this.authService.getIsAuth(); // กรณีเข้ามาครั้งแรกจะต้องทราบสถานะว่าล็อกอินอยู่หรือไม่
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated; // การเปลี่ยนแปลงเมื่อผู้ใช้ล็อกอิน
        this.userId = this.authService.getUserId();
      });
  }

  onDelete(storeId: string) {
    this.isLoading = true;
    this.storesService.deleteStore(storeId).subscribe(() => {
      this.storesService.getStores(this.storesPerPage, this.currentPage);
    }, (err) => {
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
    this.storesSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.storesPerPage = pageData.pageSize;
    this.storesService.getStores(this.storesPerPage, this.currentPage);
  }
}
