import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from '../user.model';
import { UsersService } from '../users.service';
import 'hammerjs'; // use for mat-paginator
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  // users = [
  //   { email: "First User", content: "This is the first user's content" },
  //   { email: "Second User", content: "This is the second user's content" },
  //   { email: "Third User", content: "This is the third user's content" }
  // ];
  users: User[] = [];
  isLoading = false;
  totalUsers = 0;
  usersPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];
  userIsAuthenticated = false;
  userId: string;
  private usersSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public usersService: UsersService, private authService: AuthService) {}

  ngOnInit() {
    // this.users = this.usersService.getUsers();
    this.isLoading = true;
    this.usersService.getUsers(this.usersPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.usersSub = this.usersService
      .getUserUpdateListener()
      .subscribe(( userData: { users: User[], userCounts: number }) => {
        this.isLoading = false;
        this.totalUsers = userData.userCounts;
        this.users = userData.users;
      });
    this.userIsAuthenticated = this.authService.getIsAuth(); // กรณีเข้ามาครั้งแรกจะต้องทราบสถานะว่าล็อกอินอยู่หรือไม่
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated; // การเปลี่ยนแปลงเมื่อผู้ใช้ล็อกอิน
        this.userId = this.authService.getUserId();
      });
  }

  onDelete(userId: string) {
    this.isLoading = true;
    this.usersService.deleteUser(userId).subscribe(() => {
      this.usersService.getUsers(this.usersPerPage, this.currentPage);
    }, (err) => {
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
    this.usersSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.usersPerPage = pageData.pageSize;
    this.usersService.getUsers(this.usersPerPage, this.currentPage);
  }
}
