import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { HeaderService } from './hearder.service';
import { ProductsService } from '../products/products.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  userIsAuthenticated = false;
  public userType: string;
  public productsCounter: number;
  private authListenerSubs: Subscription;
  private userListenerSubs: Subscription;
  private productsCountListenerSubs: Subscription;
  constructor(private authService: AuthService, private headerService: HeaderService, private productsService: ProductsService) {}
  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.searchForm = new FormGroup({
      'search': new FormControl(null)
    });
    this.authListenerSubs = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
    this.userListenerSubs = this.authService.getStatusListener()
    .subscribe(result => {
      this.userType = result;
      this.headerService.setUserType(result);
    });
    // แสดงจำนวนสินค้าในตะกร้า
    this.productsCountListenerSubs = this.productsService.getProductCountListener()
    .subscribe( (result) => {
      this.productsCounter = result;
      console.log('------');
      console.log('จำนวนสินค้าในตะกร้า : ' + result);
    });
  }
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.userListenerSubs.unsubscribe();
  }
  onLogout() {
    this.productsService.clearProductTransaction();  // clear product in cart when logout
    this.authService.logout();
  }
}
