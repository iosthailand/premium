import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductsService } from '../products.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Product } from '../product.model';
import { mineType } from './mine-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Supplier } from 'src/app/suppliers/supplier.model';
import { SuppliersService } from 'src/app/suppliers/suppliers.service';
import { Category } from 'src/app/categories/category.model';
import { CategoriesService } from 'src/app/categories/categories.service';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private productId: string;
  private authStatusSub: Subscription;
  public product: Product;
  public supplierLists: Supplier[] = [];
  public categoryLists: Category[] = [];
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  // spinning = 'giphy.gif';

  constructor(
      public productsService: ProductsService,
      public route: ActivatedRoute,
      private authService: AuthService,
      private suppliersService: SuppliersService,
      private categoriesService: CategoriesService
    ) {}
  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.categoriesService.getAllCategoriesOutside().subscribe(result => {
      this.categoryLists = result.categories;
    });
    this.suppliersService.getAllSuppliersOutside().subscribe((result) => {
      this.supplierLists = result.suppliers;
    });

    this.form = new FormGroup({
      'productSku': new FormControl(null, [ Validators.required, Validators.minLength(13)]),
      'productName': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'productDetails': new FormControl(null, [ Validators.required]),
      'productCategory': new FormControl(null, [Validators.required]),
      'productSupplier': new FormControl(null, [Validators.required]),
      'image': new FormControl(null, Validators.required, mineType)
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('productId')) {
        this.mode = 'edit';
        this.productId = paramMap.get('productId');
        this.isLoading = true;
        this.productsService.getProduct(this.productId)
          .subscribe(productData => {
            this.isLoading = false;
            // console.log(productData);
            this.product = {
              id: productData._id,
              productSku: productData.productSku,
              productName: productData.productName,
              productDetails: productData.productDetails,
              productCategory: productData.productCategory,
              productSupplier: productData.productSupplier,
              imagePath: productData.imagePath,
              creator: productData.creator
            };
            this.form.setValue({
              'productSku': this.product.productSku,
              'productName': this.product.productName,
              'productDetails': this.product.productDetails,
              'productCategory': this.product.productCategory,
              'productSupplier': this.product.productSupplier,
              'image': this.product.imagePath
            });
            this.imagePreview = productData.imagePath; // แสดงรูปตอนแก้ไข
          });
      } else {
        this.mode = 'create';
        this.productId = null;
      }
    });
  }

  onSaveProduct() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.productsService.addProduct(
        this.form.value.productSku,
        this.form.value.productName,
        this.form.value.productDetails,
        this.form.value.productCategory,
        this.form.value.productSupplier,
        this.form.value.image
      );
    } else {
      this.productsService.updateProduct(
        this.productId,
        this.form.value.productSku,
        this.form.value.productName,
        this.form.value.productDetails,
        this.form.value.productCategory,
        this.form.value.productSupplier,
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
