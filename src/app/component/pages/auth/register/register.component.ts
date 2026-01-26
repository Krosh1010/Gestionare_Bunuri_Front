import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent  {
  registerForm: FormGroup;
  showPassword = false;
  accountType: 'personal' | 'company' = 'personal';

  constructor(private fb: FormBuilder) {
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

  onSubmit(): void {
    if (this.registerForm.valid) {
      // Prepare form data
      const formData = {
        ...this.registerForm.value,
        accountType: this.accountType
      };
      
      console.log('Form submitted:', formData);
      
      // Show success message
      alert('Cont creat cu succes! Vei fi redirecționat către dashboard.');
      
      // Reset form
      this.registerForm.reset();
      this.accountType = 'personal';
      this.showPassword = false;
    } else {
      // Mark all fields as touched to show errors
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
