import { Component, OnDestroy } from '@angular/core';
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
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  verifyForm: FormGroup;
  showPassword = false;
  isLoading = false;
  isVerifying = false;
  isResending = false;
  loginErrorMessage = '';
  verificationError = '';
  showSuccessNotification = false;
  step = 1;
  pendingEmail = '';
  resendCooldown = 0;
  private resendInterval: any;
  private pendingLoginData: any = null;

  constructor(private fb: FormBuilder, private authService: AuthenticationService, private authState: AuthStateService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
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
      } catch (error: any) {
        this.isLoading = false;
        if (error?.response?.status === 403) {
          this.pendingEmail = this.loginForm.value.email;
          this.pendingLoginData = { Email: this.loginForm.value.email, Password: this.loginForm.value.password };
          this.step = 2;
          this.startResendCooldown();
        } else if (error?.response?.status === 401) {
          this.loginErrorMessage = 'Credențiale invalide. Verifică email-ul și parola.';
        } else {
          this.loginErrorMessage = 'A apărut o eroare la autentificare. Încearcă din nou!';
        }
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

  async onVerify(): Promise<void> {
    if (this.verifyForm.valid) {
      this.isVerifying = true;
      this.verificationError = '';
      try {
        await this.authService.verifyEmail(this.pendingEmail, this.verifyForm.value.code);
        this.isVerifying = false;
        this.authState.refresh();
        this.showSuccessNotification = true;
        setTimeout(() => {
          this.showSuccessNotification = false;
          this.router.navigate(['/dashboard']);
        }, 2000);
      } catch (error: any) {
        this.isVerifying = false;
        this.verificationError = error?.response?.data?.message || 'Codul de verificare este invalid sau a expirat.';
        console.error('Verify error:', error);
      }
    } else {
      this.verifyForm.get('code')?.markAsTouched();
    }
  }

  startResendCooldown(): void {
    this.resendCooldown = 120;
    clearInterval(this.resendInterval);
    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendInterval);
        this.resendCooldown = 0;
      }
    }, 1000);
  }

  async onResendCode(): Promise<void> {
    if (this.resendCooldown > 0 || !this.pendingLoginData) return;
    this.isResending = true;
    try {
      await this.authService.login(this.pendingLoginData);
    } catch {
      // 403 means account unverified — backend resends code anyway
    } finally {
      this.isResending = false;
      this.startResendCooldown();
    }
  }

  goBackToLogin(): void {
    this.step = 1;
    this.verifyForm.reset();
    this.verificationError = '';
    clearInterval(this.resendInterval);
    this.resendCooldown = 0;
  }

  ngOnDestroy(): void {
    clearInterval(this.resendInterval);
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
