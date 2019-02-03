import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MyAngularMaterialModule } from '../my-angular-material.module';
import { ProductSearchComponent } from './product-search/product-search.component';
import { ProductSearchPipe } from './product-search/product-search.pipe';

@NgModule({
  declarations: [
    ProductCreateComponent,
    ProductListComponent,
    ProductSearchComponent,
    ProductSearchPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MyAngularMaterialModule,
    RouterModule
  ]
})
export class ProductsModule {}
