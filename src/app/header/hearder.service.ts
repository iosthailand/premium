import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProductsService } from '../products/products.service';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class HeaderService {
  private userType: string;
  constructor(private authService: AuthService, private productsService: ProductsService) {}
  getUserType() {
    return this.userType;
  }
  setUserType(userType: string) {
    this.userType = userType;
  }
}
