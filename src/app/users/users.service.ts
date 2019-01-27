import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './user.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/users/';


@Injectable({providedIn: 'root'})
export class UsersService {
  private users: User[] = [];
  private usersUpdated = new Subject<{users: User[], userCounts: number} >();

  constructor(private http: HttpClient, private router: Router) {}

  getUsers(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{message: string, users: any, maxUsers: number}>(BACKEND_URL + queryParams)
      .pipe(map((userData) => {  // map result only get user content not include message
        return { users: userData.users.map((user) => { // map _id from database to id same as in model
          return {
            id: user._id,
            title: user.title,
            content: user.content,
            imagePath: user.imagePath,
            creator: user.creator
          };
        }),
        maxUsers: userData.maxUsers };
      })
      )
      .subscribe((transformUser) => {
        this.users = transformUser.users;  // Transform form { id, title, content } to { _id, title, content }
        this.usersUpdated.next({
          users: [...this.users],
          userCounts: transformUser.maxUsers
        });
      });
  }

  getUserUpdateListener() {
    return this.usersUpdated.asObservable();
  }

  getUser(id: string) {
    // return {...this.users.find(user => user.id === id)};
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addUser(title: string, content: string, image: File) {
    const userData = new FormData(); // แบบฟอร์มที่สามารถมีข้อความ และข้อมูลไฟล์ได้
    userData.append('title', title);
    userData.append('content', content);
    userData.append('image', image, title);

    this.http
      .post<{ message: string, user: User }>(
      BACKEND_URL,
      userData
      )
    .subscribe((responseData) => {
      this.router.navigate(['/']);
    });
  }

  updateUser(id: string, title: string, content: string, image: File | string) {
    let userData: User | FormData;
    if (typeof image === 'object') {
      userData = new FormData();
      userData.append('id', id);
      userData.append('title', title);
      userData.append('content', content);
      userData.append('image', image, title);
    } else {
      userData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put(BACKEND_URL + id, userData)
      .subscribe((response) => {
          this.router.navigate(['/']);
      });
  }
  deleteUser(userId: string) {
    return this.http.delete(BACKEND_URL + userId);
  }
}
