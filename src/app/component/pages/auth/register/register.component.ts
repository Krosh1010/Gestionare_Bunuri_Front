import { Component,OnInit } from '@angular/core';
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
  accountType: 'personal' | 'company' = 'personal';

  constructor(private fb: FormBuilder, private authService: AuthenticationService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      companyName: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  selectAccountType(type: 'personal' | 'company'): void {
    this.accountType = type;
    
    if (type === 'company') {
      this.registerForm.get('companyName')?.setValidators(Validators.required);
    } else {
      this.registerForm.get('companyName')?.clearValidators();
    }
    
    this.registerForm.get('companyName')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      // Map form data to RegisterModel (for home use, only personal account)
      const registerData = {
        FullName: this.registerForm.value.fullName,
        Email: this.registerForm.value.email,
        Password: this.registerForm.value.password
      };
      try {
        await this.authService.register(registerData);
        alert('Cont creat cu succes!');
        this.registerForm.reset();
        this.accountType = 'personal';
        this.showPassword = false;
        this.router.navigate(['/login']);
      } catch (error: any) {
        alert('A apărut o eroare la înregistrare. Încearcă din nou!');
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
