import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../../services/ApiServices/authentication.service';
import { AuthStateService } from '../../../../services/auth-state.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  loginErrorMessage = '';
  showSuccessNotification = false;

  constructor(private fb: FormBuilder, private authService: AuthenticationService, private authState: AuthStateService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginErrorMessage = '';
      const { email, password } = this.loginForm.value;
      try {
        const loginData = { Email: email, Password: password };
        const response = await this.authService.login(loginData);
        const token = response && response.data && response.data.token;
        if (token) {
          localStorage.setItem('authToken', JSON.stringify({ token }));
          this.authState.refresh();
          this.isLoading = false;
          this.showSuccessNotification = true;

          setTimeout(() => {
            this.showSuccessNotification = false;
            this.router.navigate(['/dashboard']);
          }, 2000);
        } else {
          this.isLoading = false;
          this.loginErrorMessage = 'Email sau parolă incorectă. Încearcă din nou.';
        }
      } catch (error) {
        this.isLoading = false;
        this.loginErrorMessage = 'A apărut o eroare la autentificare. Încearcă din nou!';
        console.error('Login error:', error);
      }
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
