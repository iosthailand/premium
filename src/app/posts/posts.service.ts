import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/posts/';


@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCounts: number} >();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {  // map result only get post content not include message
        return { posts: postData.posts.map((post) => { // map _id from database to id same as in model
          return {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            creator: post.creator
          };
        }),
        maxPosts: postData.maxPosts };
      })
      )
      .subscribe((transformPost) => {
        this.posts = transformPost.posts;  // Transform form { id, title, content } to { _id, title, content }
        this.postsUpdated.next({
          posts: [...this.posts],
          postCounts: transformPost.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    // return {...this.posts.find(post => post.id === id)};
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addPost(title: string, content: string, image: File) {
    const postData = new FormData(); // แบบฟอร์มที่สามารถมีข้อความ และข้อมูลไฟล์ได้
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http
      .post<{ message: string, post: Post }>(
      BACKEND_URL,
      postData
      )
    .subscribe((responseData) => {
      this.router.navigate(['dummys']);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(BACKEND_URL + id, postData)
      .subscribe((response) => {
          this.router.navigate(['dummys']);
      });
  }
  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
