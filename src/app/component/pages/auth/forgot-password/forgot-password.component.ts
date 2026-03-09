import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../../services/ApiServices/authentication.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { email } = this.forgotForm.value;
        await this.authService.forgotPassword(email);
        this.emailSent = true;
        this.successMessage = 'Un cod de resetare a fost trimis pe email-ul tău.';

        // Navigăm la pagina de reset cu email-ul pre-completat
        setTimeout(() => {
          this.router.navigate(['/reset-password'], {
            queryParams: { email }
          });
        }, 2000);
      } catch (error) {
        this.errorMessage = 'A apărut o eroare. Încearcă din nou!';
        console.error('Forgot password error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.forgotForm);
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
