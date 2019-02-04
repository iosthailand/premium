import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoresService } from '../stores.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Store } from '../store.model';
import { mineType } from './mine-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-store-create',
  templateUrl: './store-create.component.html',
  styleUrls: ['./store-create.component.css']
})
export class StoreCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private storeId: string;
  private authStatusSub: Subscription;
  public store: Store;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  // spinning = 'giphy.gif';

  constructor(
      public storesService: StoresService,
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
      'storeName': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'storeCode': new FormControl(null, [ Validators.required, Validators.minLength(4)]),
      'storeDetails': new FormControl(null, [ Validators.required]),
      'image': new FormControl(null, Validators.required, mineType)
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('storeId')) {
        this.mode = 'edit';
        this.storeId = paramMap.get('storeId');
        this.isLoading = true;
        this.storesService.getStore(this.storeId)
          .subscribe(storeData => {
            this.isLoading = false;
            // console.log(storeData);
            this.store = {
              id: storeData._id,
              storeName: storeData.storeName,
              storeCode: storeData.storeCode,
              storeDetails: storeData.storeDetails,
              imagePath: storeData.imagePath,
              creator: storeData.creator
            };
            this.form.setValue({
              'storeName': this.store.storeName,
              'storeCode': this.store.storeCode,
              'storeDetails': this.store.storeDetails,
              'image': this.store.imagePath
            });
            this.imagePreview = storeData.imagePath; // แสดงรูปตอนแก้ไข
          });
      } else {
        this.mode = 'create';
        this.storeId = null;
      }
    });
  }

  onSaveStore() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.storesService.addStore(
        this.form.value.storeName,
        this.form.value.storeCode,
        this.form.value.storeDetails,
        this.form.value.image
      );
    } else {
      this.storesService.updateStore(
        this.storeId,
        this.form.value.storeName,
        this.form.value.storeCode,
        this.form.value.storeDetails,
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
