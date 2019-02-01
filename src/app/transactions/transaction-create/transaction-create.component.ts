import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TransactionsService } from '../transactions.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Transaction } from '../transaction.model';
import { Subscription, Subject, ReplaySubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users/users.service';
import { StoresService } from 'src/app/stores/stores.service';
import { Store } from 'src/app/stores/store.model';
import { User } from 'src/app/users/user.model';
import { MatSelect } from '@angular/material';
import { take, takeUntil } from 'rxjs/operators';
import { ProductItem } from 'src/app/products/product-item.model';

@Component({
  selector: 'app-transaction-create',
  templateUrl: './transaction-create.component.html',
  styleUrls: ['./transaction-create.component.css']
})
export class TransactionCreateComponent implements OnInit, OnDestroy, AfterViewInit {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private transactionId: string;
  private authStatusSub: Subscription;
  public transaction: Transaction;
  isLoading = false;
  form: FormGroup;
  protected stores: Store[];
  protected staffs: User[];
  protected senders: User[];
  protected transportors: User[];
  userId: string;
  userStoreId: string;
  productItemLists: ProductItem[];
  // for show search dropdown
  @ViewChild('storeSelect') storeSelect: MatSelect;
  @ViewChild('staffSelect') staffSelect: MatSelect;
  @ViewChild('senderSelect') senderSelect: MatSelect;
  @ViewChild('transportorSelect') transportorSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  // -----
  /** list of banks filtered by search keyword */
  public filteredStores: ReplaySubject<Store[]> = new ReplaySubject<Store[]>(1);
  public filteredStaffs: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  public filteredTransportors: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  public filteredSenders: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);

  constructor(
      public transactionsService: TransactionsService,
      public route: ActivatedRoute,
      private authService: AuthService,
      private usersService: UsersService,
      private storesServeice: StoresService
    ) {}
  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.userStoreId = this.authService.getUserStoreId();
    this.form = new FormGroup({
      // 'transactionId': new FormControl(null, [Validators.required]),
      'senderId': new FormControl(this.userId, [Validators.required]),
      'transportorId': new FormControl(),
      'receiverId': new FormControl(),
      'dataTime': new FormControl(null),
      'departureStoreId': new FormControl(this.userStoreId, [Validators.required]),
      'destinationStoreId': new FormControl(null, [Validators.required]),
      'productLists': new FormControl(null),
      'transactionStatus': new FormControl(null),
      'remark': new FormControl(null),
      'storeFilterCtrl': new FormControl(null),
      'staffFilterCtrl': new FormControl(),
      'transportorFilterCtrl': new FormControl(),
      'senderFilterCtrl': new FormControl()

    });
    this.storesServeice.getAllCurrentStoresOutside().subscribe(result => {
      // ไม่แสดงรายชื่อสาขาที่ใช้ปัจจุบัน
      const stores = result.stores.filter( item => {
        return item.id !== this.userStoreId;
      });
      this.stores = stores;
      this.filteredStores.next(stores);
    });
    this.usersService.getAllStaffOutSide().subscribe(result => {
      // แสดงเฉพาะ DH Staff โดยตัดเอาอาร์เรย์ที่เป็น null ออกไป
      const staffs = result.users.filter( item => {
        return item != null;
      });
      this.staffs = staffs;
      this.filteredStaffs.next(staffs);
    });
    this.usersService.getAllTransportorOutSide().subscribe(result => {
      const transportors = result.users.filter( item => {
        return item != null;
      });
      this.transportors = transportors;
      this.filteredTransportors.next(transportors);
    });
    this.usersService.getAllUsersOutSide().subscribe(result => {
     //  set all user lists
      this.senders = result.users;
      // set user initial selection
      this.filteredSenders.next(result.users);
    });


    // listen for search field value changes
    this.form.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStaffs();
        this.filterStores();
        this.filterSenders();
        this.filterTransportors();
      });


    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('transactionId')) {
        this.mode = 'edit';
        this.transactionId = paramMap.get('transactionId');
        this.isLoading = true;
        this.transactionsService.getTransaction(this.transactionId)
          .subscribe(transactionData => {
            this.isLoading = false;
            console.log(transactionData);
            this.transaction = {
              id: transactionData._id,
              senderId: transactionData.senderId,
              transportorId: transactionData.transportorId,
              receiverId: transactionData.receiverId,
              dataTime: transactionData.dataTime,
              departureStoreId: transactionData.departureStoreId,
              destinationStoreId: transactionData.destinationStoreId,
              productLists: transactionData.productLists,
              transactionStatus: transactionData.transactionStatus,
              remark: transactionData.remark
            };

            console.log(this.transaction);
            this.form.setValue({
              'senderId': this.transaction.senderId,
              'transportorId': this.transaction.transportorId,
              'receiverId': this.transaction.receiverId,
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
        this.userId,
        this.form.value.transportorId,
        this.form.value.receiverId,
        this.form.value.departureStoreId,
        // dateTime
        this.form.value.destinationStoreId,
        this.productItemLists,
        this.form.value.transactionStatus,
        this.form.value.remark
      );
    } else {
      this.transactionsService.updateTransaction(
        this.transactionId,
        this.userId,
        this.form.value.transportorId,
        this.form.value.receiverId,
        this.form.value.departureStoreId,
        // DateTime
        this.form.value.destinationStoreId,
        this.productItemLists,
        this.form.value.transactionStatus,
        this.form.value.remark
      );
    }
    this.isLoading = false;
    this.form.reset();
  }
  ngAfterViewInit() {
    // this.setInitialValue();
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  protected setInitialValue() {
    this.filteredStores
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredUsers are loaded initially
        // and after the mat-option elements are available
        this.storeSelect.compareWith = (a: Store, b: Store) => a && b && a.id === b.id;
      });

    this.filteredStaffs
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.staffSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });
    this.filteredSenders
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.senderSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });
    this.filteredTransportors
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.transportorSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });

  }
  protected filterStores() {
    if (!this.stores) {
      return;
    }
    // get the search keyword
    let search = this.form.value.userFilterCtrl;
    if (!search) {
      this.filteredStores.next(this.stores.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the stores
    this.filteredStores.next(
      this.stores.filter(store => store.storeName.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterStaffs() {
    if (!this.staffs) {
      return;
    }
    // get the search keyword
    let search = this.form.value.staffFilterCtrl;
    if (!search) {
      this.filteredStaffs.next(this.staffs.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the users
    this.filteredStaffs.next(
      this.staffs.filter(staff => staff.content.toLowerCase().indexOf(search) > -1)
    );
  }


  protected filterSenders() {
    if (!this.senders) {
      return;
    }
    // get the search keyword
    let search = this.form.value.senderFilterCtrl;
    if (!search) {
      this.filteredSenders.next(this.senders.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the users
    this.filteredSenders.next(
      this.senders.filter(sender => sender.content.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterTransportors() {
    if (!this.transportors) {
      return;
    }
    let search = this.form.value.transportorFilterCtrl;
    if (!search) {
      this.filteredTransportors.next(this.transportors.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredTransportors.next(
      this.transportors.filter(transportor => transportor.content.toLowerCase().indexOf(search) > -1)
    );
  }

}
