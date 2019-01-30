import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../users.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { User } from '../user.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { StoresService } from 'src/app/stores/stores.service';
import { Store } from 'src/app/stores/store.model';
import { SuppliersService } from 'src/app/suppliers/suppliers.service';
import { Supplier } from 'src/app/suppliers/supplier.model';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  public emailEditable = false;
  private userId: string;
  private authStatusSub: Subscription;
  public user: User;
  public permissionLists = ['DH Staff', 'Chauffeur', 'Storage Manager', 'Manager', 'Admin'];
  public storeLists: Store[] = [];

  isLoading = false;
  form: FormGroup;
  // imagePreview: string;
  // spinning = 'giphy.gif';

  constructor(
      public usersService: UsersService,
      public route: ActivatedRoute,
      private authService: AuthService,
      private router: Router,
      private storesService: StoresService
    ) {}
  ngOnInit() {
    this.storesService.getAllCurrentStoresOutside().subscribe((result) => {
      this.storeLists = result.stores;
    });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      'email': new FormControl(null, [ Validators.required, Validators.email]),
      'password': new FormControl(null, [ Validators.required, Validators.minLength(3)]),
      'content': new FormControl(null),
      'permission': new FormControl(null, Validators.required),
      'storeId': new FormControl(null, Validators.required),
      'status': new FormControl(false)

    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('userId')) {
        this.mode = 'edit';
        this.emailEditable = false;
        this.userId = paramMap.get('userId');
        this.isLoading = true;
        this.usersService.getUser(this.userId)
          .subscribe(userData => {
            this.isLoading = false;
            // console.log(userData);
            this.user = {
              id: userData._id,
              email: userData.email,
              content: userData.content,
              password: userData.password,
              permission: userData.permission,
              storeId: userData.storeId,
              status: userData.status
            };
            this.form.setValue({
              'email': this.user.email,
              'content': this.user.content,
              'password': this.user.password,
              'permission': this.user.permission,
              'storeId': this.user.storeId,
              'status': this.user.status
            });
          }, error => {
            this.isLoading = false;
          });
      } else {
        this.mode = 'create';
        this.emailEditable = true;
        this.userId = null;
      }
    });
  }

  onSaveUser() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.usersService.addUser(
        this.form.value.email,
        this.form.value.content,
        this.form.value.password,
        this.form.value.permission,
        this.form.value.storeId,
        this.form.value.status
      );
    } else {
      this.usersService.updateUser(
        this.userId,
        this.form.value.email,
        this.form.value.content,
        this.form.value.password,
        this.form.value.permission,
        this.form.value.storeId,
        this.form.value.status
      );
    }
    this.form.reset();
    this.isLoading = false;
  }
  onCancel() {
    this.router.navigate(['/users']);
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
