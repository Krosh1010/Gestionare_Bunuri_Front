import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/ApiServices/authentication.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showSuccessNotification = false;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private authService: AuthenticationService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZăâîșțĂÂÎȘȚ\s\-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      acceptTerms: [false, Validators.requiredTrue]
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
        this.showSuccessNotification = true;
        this.registerForm.reset();
        this.showPassword = false;
        
        setTimeout(() => {
          this.showSuccessNotification = false;
          this.router.navigate(['/login']);
        }, 3000);
      } catch (error: any) {
        this.isSubmitting = false;
        console.error('Register error:', error);
      }
    } else {
      this.markFormGroupTouched(this.registerForm);
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
