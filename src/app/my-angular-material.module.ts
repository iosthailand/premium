import { NgModule } from '@angular/core';
import {
  MatInputModule,
  MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatExpansionModule,
  MatPaginatorModule,
  MatDialogModule,
  MatFormFieldModule,
  MatSelectModule
} from '@angular/material';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  exports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule
  ]
})
export class MyAngularMaterialModule {}
