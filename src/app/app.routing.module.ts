import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { AuthGuard } from './auth/auth.guard';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { CategoryListComponent } from './categories/category-list/category-list.component';
import { CategoryCreateComponent } from './categories/category-create/category-create.component';
import { SupplierListComponent } from './suppliers/supplier-list/supplier-list.component';
import { SupplierCreateComponent } from './suppliers/supplier-create/supplier-create.component';
import { StoreListComponent } from './stores/store-list/store-list.component';
import { StoreCreateComponent } from './stores/store-create/store-create.component';
import { TransactionListComponent } from './transactions/transaction-list/transaction-list.component';
import { TransactionCreateComponent } from './transactions/transaction-create/transaction-create.component';

const routes: Routes = [
  { path: 'dummys', component: PostListComponent },
  { path: 'dummys/create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'dummys/edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: './auth/auth.module#AuthModule'},
  { path: 'users', component: UserListComponent },
  { path: 'users/create', component: UserCreateComponent },
  { path: 'users/edit/:userId', component: UserCreateComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductListComponent },
  { path: 'products/create', component: ProductCreateComponent },
  { path: 'products/edit/:productId', component: ProductCreateComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoryListComponent },
  { path: 'categories/create', component: CategoryCreateComponent },
  { path: 'categories/edit/:categoryId', component: CategoryCreateComponent, canActivate: [AuthGuard] },
  { path: 'suppliers', component: SupplierListComponent },
  { path: 'suppliers/create', component: SupplierCreateComponent },
  { path: 'suppliers/edit/:supplierId', component: SupplierCreateComponent, canActivate: [AuthGuard] },
  { path: 'stores', component: StoreListComponent },
  { path: 'stores/create', component: StoreCreateComponent },
  { path: 'stores/edit/:storeId', component: StoreCreateComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'transactions/create', component: TransactionCreateComponent },
  { path: 'transactions/edit/:transactionId', component: TransactionCreateComponent, canActivate: [AuthGuard] },
  { path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  }
  // { path: '**', component: PageNotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {

}
