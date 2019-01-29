import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Supplier } from '../supplier.model';
import { SuppliersService } from '../suppliers.service';
import 'hammerjs'; // use for mat-paginator
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit, OnDestroy {
  // suppliers = [
  //   { title: "First Supplier", content: "This is the first supplier's content" },
  //   { title: "Second Supplier", content: "This is the second supplier's content" },
  //   { title: "Third Supplier", content: "This is the third supplier's content" }
  // ];
  suppliers: Supplier[] = [];
  isLoading = false;
  totalSuppliers = 0;
  suppliersPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];
  userIsAuthenticated = false;
  userId: string;
  private suppliersSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public suppliersService: SuppliersService, private authService: AuthService) {}

  ngOnInit() {
    // this.suppliers = this.suppliersService.getSuppliers();
    this.isLoading = true;
    this.suppliersService.getSuppliers(this.suppliersPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.suppliersSub = this.suppliersService
      .getSupplierUpdateListener()
      .subscribe(( supplierData: { suppliers: Supplier[], supplierCounts: number }) => {
        this.isLoading = false;
        this.totalSuppliers = supplierData.supplierCounts;
        this.suppliers = supplierData.suppliers;
      });
    this.userIsAuthenticated = this.authService.getIsAuth(); // กรณีเข้ามาครั้งแรกจะต้องทราบสถานะว่าล็อกอินอยู่หรือไม่
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated; // การเปลี่ยนแปลงเมื่อผู้ใช้ล็อกอิน
        this.userId = this.authService.getUserId();
      });
  }

  onDelete(supplierId: string) {
    this.isLoading = true;
    this.suppliersService.deleteSupplier(supplierId).subscribe(() => {
      this.suppliersService.getSuppliers(this.suppliersPerPage, this.currentPage);
    }, (err) => {
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
    this.suppliersSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.suppliersPerPage = pageData.pageSize;
    this.suppliersService.getSuppliers(this.suppliersPerPage, this.currentPage);
  }
}
