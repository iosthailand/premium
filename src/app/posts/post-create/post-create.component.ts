import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mineType } from './mine-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private postId: string;
  public post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  spinning = 'giphy.gif';

  constructor(public postsService: PostsService, public route: ActivatedRoute) {}
  ngOnInit() {
    this.form = new FormGroup({
      'title': new FormControl(null, [ Validators.required, Validators.minLength(3)]),
      'content': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'image': new FormControl(null, Validators.required, mineType)
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId)
          .subscribe(postData => {
            this.isLoading = false;
            // console.log(postData);
            this.post = {
              id: postData._id,
              title: postData.title,
              content: postData.content,
              imagePath: postData.imagePath,
              creator: postData.creator
            };
            this.form.setValue({
              'title': this.post.title,
              'content': this.post.content,
              'image': this.post.imagePath
            });
            this.imagePreview = postData.imagePath; // แสดงรูปตอนแก้ไข
          });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }
  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file !== null) { // ตรวจสอบว่า มีการยกเลิกตอนเลือกไฟล์หรือไม่
      this.form.patchValue({image: file}); // กำหนดค่าให้กับ formControl
      this.form.get('image').updateValueAndValidity(); // อัพเดทค่าให้กับ fromControl
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }

  }

}
