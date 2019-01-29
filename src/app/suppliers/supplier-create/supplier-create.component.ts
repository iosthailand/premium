import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SuppliersService } from '../suppliers.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Supplier } from '../supplier.model';
import { mineType } from './mine-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-supplier-create',
  templateUrl: './supplier-create.component.html',
  styleUrls: ['./supplier-create.component.css']
})
export class SupplierCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private supplierId: string;
  private authStatusSub: Subscription;
  public supplier: Supplier;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  // spinning = 'giphy.gif';

  constructor(
      public suppliersService: SuppliersService,
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
      'supplierName': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'supplierDetails': new FormControl(null, [ Validators.required]),
      'image': new FormControl(null, Validators.required, mineType)
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('supplierId')) {
        this.mode = 'edit';
        this.supplierId = paramMap.get('supplierId');
        this.isLoading = true;
        this.suppliersService.getSupplier(this.supplierId)
          .subscribe(supplierData => {
            this.isLoading = false;
            // console.log(supplierData);
            this.supplier = {
              id: supplierData._id,
              supplierName: supplierData.supplierName,
              supplierDetails: supplierData.supplierDetails,
              imagePath: supplierData.imagePath,
              creator: supplierData.creator
            };
            this.form.setValue({
              'supplierName': this.supplier.supplierName,
              'supplierDetails': this.supplier.supplierDetails,
              'image': this.supplier.imagePath
            });
            this.imagePreview = supplierData.imagePath; // แสดงรูปตอนแก้ไข
          });
      } else {
        this.mode = 'create';
        this.supplierId = null;
      }
    });
  }

  onSaveSupplier() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.suppliersService.addSupplier(
        this.form.value.supplierName,
        this.form.value.supplierDetails,
        this.form.value.image
      );
    } else {
      this.suppliersService.updateSupplier(
        this.supplierId,
        this.form.value.supplierName,
        this.form.value.supplierDetails,
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
