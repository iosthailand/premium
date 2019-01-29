import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Category } from '../category.model';
import { CategoriesService } from '../categories.service';
import 'hammerjs'; // use for mat-paginator
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit, OnDestroy {
  // categories = [
  //   { title: "First Category", content: "This is the first category's content" },
  //   { title: "Second Category", content: "This is the second category's content" },
  //   { title: "Third Category", content: "This is the third category's content" }
  // ];
  categories: Category[] = [];
  isLoading = false;
  totalCategories = 0;
  categoriesPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];
  userIsAuthenticated = false;
  userId: string;
  private categoriesSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public categoriesService: CategoriesService, private authService: AuthService) {}

  ngOnInit() {
    // this.categories = this.categoriesService.getCategories();
    this.isLoading = true;
    this.categoriesService.getCategories(this.categoriesPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.categoriesSub = this.categoriesService
      .getCategoryUpdateListener()
      .subscribe(( categoryData: { categories: Category[], categoryCounts: number }) => {
        this.isLoading = false;
        this.totalCategories = categoryData.categoryCounts;
        this.categories = categoryData.categories;
      });
    this.userIsAuthenticated = this.authService.getIsAuth(); // กรณีเข้ามาครั้งแรกจะต้องทราบสถานะว่าล็อกอินอยู่หรือไม่
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated; // การเปลี่ยนแปลงเมื่อผู้ใช้ล็อกอิน
        this.userId = this.authService.getUserId();
      });
  }

  onDelete(categoryId: string) {
    this.isLoading = true;
    this.categoriesService.deleteCategory(categoryId).subscribe(() => {
      this.categoriesService.getCategories(this.categoriesPerPage, this.currentPage);
    }, (err) => {
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
    this.categoriesSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.categoriesPerPage = pageData.pageSize;
    this.categoriesService.getCategories(this.categoriesPerPage, this.currentPage);
  }
}
