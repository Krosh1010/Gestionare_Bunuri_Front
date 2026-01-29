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
  loginMessage = '';
  loginSuccess = false;
  showDemoInfo = true;

  constructor(private fb: FormBuilder, private authService: AuthenticationService, private authState: AuthStateService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginMessage = '';
      const { email, password } = this.loginForm.value;
      try {
        const loginData = { Email: email, Password: password };
        const response = await this.authService.login(loginData);
        console.log('Login response:', response);
        // Dacă răspunsul este un obiect Axios, token-ul e în response.data.token
        const token = response && response.data && response.data.token;
        console.log('Token extras:', token);
        if (token) {
          localStorage.setItem('authToken', JSON.stringify({ token }));
          this.authState.refresh();
          this.loginSuccess = true;
          this.loginMessage = 'Login successful! Redirecting to dashboard...';
          this.router.navigate(['/dashboard']);
        } else {
          this.loginSuccess = false;
          this.loginMessage = 'Invalid credentials. Please try again.';
        }
      } catch (error) {
        this.loginSuccess = false;
        this.loginMessage = 'A apărut o eroare la autentificare. Încearcă din nou!';
        console.error('Login error:', error);
      }
      this.isLoading = false;
    } else {
      this.loginMessage = 'Please fill in all required fields correctly.';
      this.loginSuccess = false;
    }
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    // Handle forgot password logic here
    alert('Forgot password functionality not implemented yet.');
  }
}
