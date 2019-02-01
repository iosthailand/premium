import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';
// import { errorHandler } from '@angular/platform-browser/src/browser';

import { environment } from '../../environments/environment';
import { ProductsService } from '../products/products.service';
const BACKEND_URL = environment.apiUrl + '/auth';

@Injectable({ providedIn: 'root'})
export class AuthService {

  private token: string;
  private tokenTimer: any;
  private userId: string;
  private userPermission: string;
  private userStoreId: string;
  private userContent: string;
  private userStatus: string;
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();
  private userStatusListener = new Subject<string>();
  constructor(private http: HttpClient, private router: Router, private productsService: ProductsService) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getUserStoreId() {
    return this.userStoreId;
  }

  getUserStatus() {
    return this.userStatus;
  }

  getUserPermission() {
    return this.userPermission;
  }
  // get user type
  getStatusListener() {
    return this.userStatusListener.asObservable();
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password, permission: 'DH Staff', storeId: null, status: false };
    this.http.post(BACKEND_URL + '/signup', authData)
    .subscribe(response => {
      this.router.navigate(['/']);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password, permission: null, storeId: null, status: false };
    this.http
    .post<{token: string, expiresIn: number, userId: string, userPermission: string, userType: string, userStoreId: string}>(
      BACKEND_URL + '/login',
      authData
      )
    .subscribe(response => {
      // console.log(response);
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn * 1000;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.userStoreId = response.userStoreId;
        this.userPermission = response.userPermission;
        this.authStatusListener.next(true);
        this.userStatusListener.next(response.userType);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration);
        this.saveAuthData(token, expirationDate, this.userId, this.userPermission, this.userStoreId);
        this.router.navigate(['/']);
      }
    }, error => {
      this.authStatusListener.next(false);
      this.userStatusListener.next('');
    });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    // console.log(expiresIn);
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.setAuthTimer(expiresIn);
      this.userId = authInformation.userId;
      this.userPermission = authInformation.userPermission;
      this.userStoreId = authInformation.userStoreId;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userStatusListener.next('');
    this.userId = null;
    this.userStoreId = null;
    this.userStatus = null;
    this.userPermission = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.productsService.clearProductTransaction();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    // console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, userPermission: string, userStoreId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('userPermission', userPermission);
    localStorage.setItem('userStoreId', userStoreId);
  }
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPermission');
    localStorage.removeItem('userStoreId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const userPermission = localStorage.getItem('userPermission');
    const userStoreId = localStorage.getItem('userStoreId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      userPermission: userPermission,
      userStoreId: userStoreId
    };
  }
}
