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
  /** list of users */
  protected stores: Store[];
  protected users: User[];
  protected staffs: User[];
  protected managers: User[];
  protected transportors: User[];
  userId: string;

  @ViewChild('singleSelect') singleSelect: MatSelect;
  @ViewChild('staffSelect') staffSelect: MatSelect;
  @ViewChild('managerSelect') managerSelect: MatSelect;
  @ViewChild('transportorSelect') transportorSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  // -----
  /** list of banks filtered by search keyword */
  public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  public filteredStaffs: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  public filteredTransportors: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  public filteredManagers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);

  constructor(
      public transactionsService: TransactionsService,
      public route: ActivatedRoute,
      private authService: AuthService,
      private usersService: UsersService,
      private storesServeice: StoresService
    ) {}
  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.form = new FormGroup({
      // 'transactionId': new FormControl(null, [Validators.required]),
      'managerId': new FormControl(),
      'transportorId': new FormControl(),
      'staffId': new FormControl(),
      'dataTime': new FormControl(null, [Validators.required]),
      'departureStoreId': new FormControl(null, [Validators.required]),
      'destinationStoreId': new FormControl(null, [Validators.required]),
      'productLists': new FormControl(null, [Validators.required]),
      'transactionStatus': new FormControl(null, [Validators.required]),
      'remark': new FormControl(null),
      'staffFilterCtrl': new FormControl(),
      'transportorFilterCtrl': new FormControl(),
      'managerFilterCtrl': new FormControl()

    });
    this.storesServeice.getAllCurrentStoresOutside().subscribe(result => {
      this.stores = result.stores;
    });
    this.usersService.getAllStaffOutSide().subscribe(result => {
      const staffs = result.users.filter( item => {
        return item != null;
      });
      this.staffs = staffs;
      this.filteredStaffs.next(staffs);
    });
    this.usersService.getAllManagerOutSide().subscribe(result => {
      const managers = result.users.filter( item => {
        return item != null;
      });
      this.managers = managers;
      this.filteredManagers.next(managers);
    });
    this.usersService.getAllTransportorOutSide().subscribe(result => {
      const transportors = result.users.filter( item => {
        return item != null;
      });
      this.transportors = transportors;
      this.filteredTransportors.next(transportors);
    });
    this.usersService.getAllUsersOutSide().subscribe(result => {
      // set all user lists
      this.users = result.users;
      // set user initial selection
      this.filteredUsers.next(result.users);
    });


    // listen for search field value changes
    this.form.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {

        this.filterStaffs();
        this.filterUsers();
        this.filterManagers();
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
            // console.log(transactionData);
            this.transaction = {
              id: transactionData._id,
              managerId: this.userId,
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
    console.log(this.form.value);
    // if (this.form.invalid) {
    //   return;
    // }
    // this.isLoading = true;
    // if (this.mode === 'create') {
    //   this.transactionsService.addTransaction(
    //     this.userId,
    //     this.form.value.transportorId,
    //     this.form.value.dhStaffId,
    //     this.form.value.departureStoreId,
    //     this.form.value.destinationStoreId,
    //     this.form.value.productLists,
    //     this.form.value.transactionStatus,
    //     this.form.value.remark
    //   );
    // } else {
    //   this.transactionsService.updateTransaction(
    //     this.transactionId,
    //     this.userId,
    //     this.form.value.transportorId,
    //     this.form.value.dhStaffId,
    //     this.form.value.departureStoreId,
    //     this.form.value.destinationStoreId,
    //     this.form.value.productLists,
    //     this.form.value.transactionStatus,
    //     this.form.value.remark
    //   );
    // }
    // this.isLoading = false;
    // this.form.reset();
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
    this.filteredUsers
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredUsers are loaded initially
        // and after the mat-option elements are available
        this.singleSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });

    this.filteredStaffs
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.staffSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });
    this.filteredManagers
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.managerSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });
    this.filteredTransportors
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.transportorSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
      });

  }
  protected filterUsers() {
    if (!this.users) {
      return;
    }
    // get the search keyword
    let search = this.form.value.userFilterCtrl;
    if (!search) {
      this.filteredUsers.next(this.users.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the users
    this.filteredUsers.next(
      this.users.filter(user => user.content.toLowerCase().indexOf(search) > -1)
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


  protected filterManagers() {
    if (!this.managers) {
      return;
    }
    // get the search keyword
    let search = this.form.value.managerFilterCtrl;
    if (!search) {
      this.filteredManagers.next(this.managers.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the users
    this.filteredManagers.next(
      this.managers.filter(manager => manager.content.toLowerCase().indexOf(search) > -1)
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
