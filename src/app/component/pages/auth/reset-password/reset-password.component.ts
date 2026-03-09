import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthenticationService } from '../../../../services/ApiServices/authentication.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  showSuccessNotification = false;
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.resetForm.valid && this.email) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { code, newPassword } = this.resetForm.value;
        await this.authService.resetPassword(this.email, code, newPassword);
        this.showSuccessNotification = true;

        setTimeout(() => {
          this.showSuccessNotification = false;
          this.router.navigate(['/login']);
        }, 2500);
      } catch (error: any) {
        if (error?.response?.data?.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Codul de resetare este invalid sau a expirat. Încearcă din nou.';
        }
        console.error('Reset password error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      if (!this.email) {
        this.errorMessage = 'Email-ul lipsește. Te rugăm să revii la pagina de "Am uitat parola".';
      }
      this.markFormGroupTouched(this.resetForm);
    }
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
