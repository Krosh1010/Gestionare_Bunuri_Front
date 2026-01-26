import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      assetId: ['', [Validators.required, Validators.pattern(/^A\d{3}-\d{3}-\d{3}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginMessage = '';
      
      // Simulate login process
      setTimeout(() => {
        const { assetId, password } = this.loginForm.value;
        if (assetId === 'A123-456-789' && password === 'password123') {
          this.loginSuccess = true;
          this.loginMessage = 'Login successful! Redirecting to dashboard...';
          // Here you would typically navigate to dashboard
        } else {
          this.loginSuccess = false;
          this.loginMessage = 'Invalid credentials. Please try again.';
        }
        this.isLoading = false;
      }, 2000);
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
