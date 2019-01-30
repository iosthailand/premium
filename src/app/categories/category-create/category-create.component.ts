import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoriesService } from '../categories.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Category } from '../category.model';
import { mineType } from './mine-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css']
})
export class CategoryCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private categoryId: string;
  private authStatusSub: Subscription;
  public category: Category;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  // spinning = 'giphy.gif';

  constructor(
      public categoriesService: CategoriesService,
      public route: ActivatedRoute,
      private authService: AuthService
    ) {}
  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      'categoryName': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'categoryDetails': new FormControl(null, [ Validators.required]),
      'image': new FormControl(null, Validators.required, mineType)
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('categoryId')) {
        this.mode = 'edit';
        this.categoryId = paramMap.get('categoryId');
        this.isLoading = true;
        this.categoriesService.getCategory(this.categoryId)
          .subscribe(categoryData => {
            this.isLoading = false;
            // console.log(categoryData);
            this.category = {
              id: categoryData._id,
              categoryName: categoryData.categoryName,
              categoryDetails: categoryData.categoryDetails,
              imagePath: categoryData.imagePath,
              creator: categoryData.creator
            };
            this.form.setValue({
              'categoryName': this.category.categoryName,
              'categoryDetails': this.category.categoryDetails,
              'image': this.category.imagePath
            });
            this.imagePreview = categoryData.imagePath; // แสดงรูปตอนแก้ไข
          });
      } else {
        this.mode = 'create';
        this.categoryId = null;
      }
    });
  }

  onSaveCategory() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.categoriesService.addCategory(
        this.form.value.categoryName,
        this.form.value.categoryDetails,
        this.form.value.image
      );
    } else {
      this.categoriesService.updateCategory(
        this.categoryId,
        this.form.value.categoryName,
        this.form.value.categoryDetails,
        this.form.value.image
      );
    }
    this.isLoading = false;
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file !== null) { // ตรวจสอบว่า มีการยกเลิกตอนเลือกไฟล์หรือไม่
      this.form.patchValue({image: file}); // กำหนดค่าให้กับ formControl
      this.form.get('image').updateValueAndValidity(); // อัพเดทค่าให้กับ fromControl
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}