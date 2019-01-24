import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  // loginForm: FormGroup;
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(public authService: AuthService, private router: Router) { }
  ngOnInit() {
    this.authStatusSub = this.authService
    .getAuthStatusListener()
    .subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }
  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
