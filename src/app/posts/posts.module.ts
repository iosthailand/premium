import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostCreateComponent } from './post-create/post-create.component';
import { PostListComponent } from './post-list/post-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MyAngularMaterialModule } from '../my-angular-material.module';

@NgModule({
  declarations: [
    PostCreateComponent,
    PostListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MyAngularMaterialModule,
    RouterModule
  ]
})
export class PostsModule {}
