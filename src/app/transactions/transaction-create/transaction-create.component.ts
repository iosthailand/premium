import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TransactionsService } from '../transactions.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Transaction } from '../transaction.model';
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
      'managerId': new FormControl(null, Validators.required),
      'transportorId': new FormControl(null, [Validators.required]),
      'dhStaffId': new FormControl(null, Validators.required),
      'dataTime': new FormControl(null, [Validators.required]),
      'departureStoreId': new FormControl(null, [Validators.required]),
      'destinationStoreId': new FormControl(null, [Validators.required]),
      'productLists': new FormControl(null, [Validators.required]),
      'transactionStatus': new FormControl(null, [Validators.required]),
      'remark': new FormControl(null)
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
              departureStoreId: transactionData.departureStoreId,
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
              'departureStoreId': this.transaction.departureStoreId,
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
        this.form.value.departureStoreId,
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
        this.form.value.departureStoreId,
        this.form.value.destinationStoreId,
        this.form.value.productLists,
        this.form.value.transactionStatus,
        this.form.value.remark
      );
    }
    this.isLoading = false;
    this.form.reset();
  }


  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
