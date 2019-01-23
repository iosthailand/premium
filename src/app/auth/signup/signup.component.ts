import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  // loginForm: FormGroup;
  isLoading = false;
  constructor(public authService: AuthService) { }

  ngOnInit() {
    // this.loginForm = new FormGroup({
    //   'email': new FormControl(null, [Validators.required, Validators.email]),
    //   'password': new FormControl(null, [Validators.required, Validators.minLength(8)])
    // });
  }
  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.createUser(form.value.email, form.value.password);
  }
}
