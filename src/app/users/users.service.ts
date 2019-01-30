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
            email: user.email,
            content: user.content,
            password: user.password,
            permission: user.permission,
            storeId: user.storeId,
            status: user.status
          };
        }),
        maxUsers: userData.maxUsers };
      })
      )
      .subscribe((transformUser) => {
        this.users = transformUser.users;  // Transform form { id, email, content } to { _id, email, content }
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
      email: string,
      content: string,
      password: string,
      permission: string,
      storeId: string,
      status: boolean
    }>(BACKEND_URL + id);
  }

// mongodb+srv://tsubasa:DBkesa_m007@jeerawuth007-5duea.mongodb.net/test?retryWrites=true
  addUser(email: string, content: string, password: string, permission: string,  storeId: string, status: boolean) {
    const userData = {
      email: email,
      content: content,
      password: password,
      permission: permission,
      storeId: storeId,
      status: status
    };

    this.http
      .post<{ message: string, user: User }>(
      BACKEND_URL,
      userData
      )
    .subscribe((responseData) => {
      this.router.navigate(['users']);
    });
  }

  updateUser(id: string, email: string, content: string, password: string, permission: string, storeId: string, status: boolean) {
    let userData: User | FormData;
    userData = {
      id: id,
      email: email,
      content: content,
      password: password,
      permission: permission,
      storeId: storeId,
      status: status
    };
    this.http
      .put(BACKEND_URL + id, userData)
      .subscribe((response) => {
          this.router.navigate(['users']);
      });
  }
  deleteUser(userId: string) {
    return this.http.delete(BACKEND_URL + userId);
  }
}
