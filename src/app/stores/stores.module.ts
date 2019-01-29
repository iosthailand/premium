import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreCreateComponent } from './store-create/store-create.component';
import { StoreListComponent } from './store-list/store-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MyAngularMaterialModule } from '../my-angular-material.module';

@NgModule({
  declarations: [
    StoreCreateComponent,
    StoreListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MyAngularMaterialModule,
    RouterModule
  ]
})
export class StoresModule {}
