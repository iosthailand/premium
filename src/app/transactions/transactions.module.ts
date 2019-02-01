import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransactionCreateComponent } from './transaction-create/transaction-create.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MyAngularMaterialModule } from '../my-angular-material.module';
import { ProductItemComponent } from './product-item/product-item.component';

@NgModule({
  declarations: [
    TransactionCreateComponent,
    TransactionListComponent,
    ProductItemComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MyAngularMaterialModule,
    RouterModule
  ]
})
export class TransactionsModule {}
