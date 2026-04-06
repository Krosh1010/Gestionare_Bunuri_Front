import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/ApiServices/authentication.service';
import { AuthStateService } from '../../../../services/auth-state.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnDestroy {
  registerForm: FormGroup;
  verifyForm: FormGroup;
  showPassword = false;
  showEmailExistsError = false;
  isSubmitting = false;
  isVerifying = false;
  isResending = false;
  step = 1;
  pendingEmail = '';
  verificationError = '';
  resendCooldown = 0;
  private resendInterval: any;
  private pendingRegisterData: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private authState: AuthStateService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZăâîșțĂÂÎȘȚ\s\-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      acceptTerms: [false, Validators.requiredTrue]
    });

    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      const registerData = {
        FullName: this.registerForm.value.fullName,
        Email: this.registerForm.value.email,
        Password: this.registerForm.value.password
      };
      try {
        await this.authService.register(registerData);
        this.isSubmitting = false;
        this.pendingEmail = this.registerForm.value.email;
        this.pendingRegisterData = registerData;
        this.step = 2;
        this.startResendCooldown();
      } catch (error: any) {
        this.isSubmitting = false;
        if (error?.response?.status === 409) {
          this.showEmailExistsError = true;
          setTimeout(() => { this.showEmailExistsError = false; }, 2500);
        }
        console.error('Register error:', error);
      }
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  async onVerify(): Promise<void> {
    if (this.verifyForm.valid) {
      this.isVerifying = true;
      this.verificationError = '';
      try {
        await this.authService.verifyEmail(this.pendingEmail, this.verifyForm.value.code);
        this.isVerifying = false;
        this.authState.refresh();
        this.router.navigate(['/dashboard']);
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
    if (this.resendCooldown > 0 || !this.pendingRegisterData) return;
    this.isResending = true;
    try {
      await this.authService.register(this.pendingRegisterData);
    } catch {
      // 409 means account exists unverified — backend resends code anyway
    } finally {
      this.isResending = false;
      this.startResendCooldown();
    }
  }

  goBackToRegister(): void {
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
