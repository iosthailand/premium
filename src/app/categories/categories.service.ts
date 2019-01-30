import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from './category.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/categories/';


@Injectable({providedIn: 'root'})
export class CategoriesService {
  private categories: Category[] = [];
  private categoriesUpdated = new Subject<{categories: Category[], categoryCounts: number} >();

  constructor(private http: HttpClient, private router: Router) {}

  getCategories(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{message: string, categories: any, maxCategories: number}>(BACKEND_URL + queryParams)
      .pipe(map((categoryData) => {  // map result only get category content not include message
        return { categories: categoryData.categories.map((category) => { // map _id from database to id same as in model
          return {
            id: category._id,
            categoryName: category.categoryName,
            categoryDetails: category.categoryDetails,
            imagePath: category.imagePath,
            creator: category.creator
          };
        }),
        maxCategories: categoryData.maxCategories };
      })
      )
      .subscribe((transformCategory) => {
        this.categories = transformCategory.categories;  // Transform form { id, title, content } to { _id, title, content }
        this.categoriesUpdated.next({
          categories: [...this.categories],
          categoryCounts: transformCategory.maxCategories
        });
      });
  }

  getCategoryUpdateListener() {
    return this.categoriesUpdated.asObservable();
  }

  getCategory(id: string) {
    // return {...this.categories.find(category => category.id === id)};
    return this.http.get<{
      _id: string,
      categoryName: string,
      categoryDetails: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addCategory( categoryName: string, categoryDetails: string,  image: File) {
    const categoryData = new FormData(); // แบบฟอร์มที่สามารถมีข้อความ และข้อมูลไฟล์ได้
    categoryData.append('categoryName', categoryName);
    categoryData.append('categoryDetails', categoryDetails);
    categoryData.append('image', image, categoryName);

    this.http
      .post<{ message: string, category: Category }>(
      BACKEND_URL,
      categoryData
      )
    .subscribe((responseData) => {
      this.router.navigate(['/categories']);
    });
  }

  updateCategory(
    id: string, categoryName: string, categoryDetails: string, image: File | string
    ) {
    let categoryData: Category | FormData;
    if (typeof image === 'object') {
      categoryData = new FormData();
      categoryData.append('id', id);
      categoryData.append('categoryName', categoryName);
      categoryData.append('categoryDetails', categoryDetails);
      categoryData.append('image', image, categoryName);
    } else {
      categoryData = {
        id: id,
        categoryName: categoryName,
        categoryDetails: categoryDetails,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(BACKEND_URL + id, categoryData)
      .subscribe((response) => {
          this.router.navigate(['/categories']);
      });
  }
  deleteCategory(categoryId: string) {
    return this.http.delete(BACKEND_URL + categoryId);
  }

  getAllCategoriesOutside() {
    return this.http
      .get<{message: string, categories: any, maxCategories: number}>(BACKEND_URL)
      .pipe(map((categoryData) => {  // map result only get category content not include message
        return { categories: categoryData.categories.map((category) => { // map _id from database to id same as in model
          return {
            id: category._id,
            categoryName: category.categoryName,
            categoryDetails: category.categoryDetails,
            imagePath: category.imagePath,
            creator: category.creator
          };
      })};
    }));
  }
}
