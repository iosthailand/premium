import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  userIsAuthenticated = false;
  public userType: string;
  private authListenerSubs: Subscription;
  private userListenerSubs: Subscription;
  constructor(private authService: AuthService) {}
  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.searchForm = new FormGroup({
      'search': new FormControl(null)
    });
    this.authListenerSubs = this.authService
    .getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
    this.userListenerSubs = this.authService.getStatus()
    .subscribe(result => {
      this.userType = result;
    });
  }
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
  onLogout() {
    this.authService.logout();
  }
}
