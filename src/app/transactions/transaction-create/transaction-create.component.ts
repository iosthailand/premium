import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TransactionsService } from '../transactions.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Transaction } from '../transaction.model';
import { mineType } from './mine-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-transaction-create',
  templateUrl: './transaction-create.component.html',
  styleUrls: ['./transaction-create.component.css']
})
export class TransactionCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private transactionId: string;
  private authStatusSub: Subscription;
  public transaction: Transaction;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  // spinning = 'giphy.gif';

  constructor(
      public transactionsService: TransactionsService,
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
      'transactionName': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'transactionDetails': new FormControl(null, [ Validators.required]),
      'image': new FormControl(null, Validators.required, mineType)
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('transactionId')) {
        this.mode = 'edit';
        this.transactionId = paramMap.get('transactionId');
        this.isLoading = true;
        this.transactionsService.getTransaction(this.transactionId)
          .subscribe(transactionData => {
            this.isLoading = false;
            // console.log(transactionData);
            this.transaction = {
              id: transactionData._id,
              managerId: transactionData.managerId,
              transportorId: transactionData.transportorId,
              dhStaffId: transactionData.dhStaffId,
              dataTime: new Date(),
              destinationStoreId: transactionData.destinationStoreId,
              productLists: transactionData.productLists,
              transactionStatus: transactionData.transactionStatus,
              remark: transactionData.remark
            };
            this.form.setValue({
              'managerId': this.transaction.managerId,
              'transportorId': this.transaction.transportorId,
              'dhStaffId': this.transaction.dhStaffId,
              'dataTime': this.transaction.dataTime,
              'destinationStoreId': this.transaction.destinationStoreId,
              'productLists': this.transaction.productLists,
              'transactionStatus': this.transaction.transactionStatus,
              'remark': this.transaction.remark
            });
          });
      } else {
        this.mode = 'create';
        this.transactionId = null;
      }
    });
  }

  onSaveTransaction() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.transactionsService.addTransaction(
        this.form.value.managerId,
        this.form.value.transportorId,
        this.form.value.dhStaffId,
        this.form.value.destinationStoreId,
        this.form.value.productLists,
        this.form.value.transactionStatus,
        this.form.value.remark
      );
    } else {
      this.transactionsService.updateTransaction(
        this.transactionId,
        this.form.value.managerId,
        this.form.value.transportorId,
        this.form.value.dhStaffId,
        this.form.value.destinationStoreId,
        this.form.value.productLists,
        this.form.value.transactionStatus,
        this.form.value.remark
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
