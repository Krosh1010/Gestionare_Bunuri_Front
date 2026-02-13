import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/ApiServices/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnChanges {
  @Input() visible = false;
  @Input() user: any = null;
  @Output() closed = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<{ fullName: string; email: string }>();

  activeTab: 'data' | 'password' = 'data';

  // Edit profile fields
  fullName = '';
  email = '';
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Password fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  savingPassword = false;
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }
  }

  resetForm() {
    this.activeTab = 'data';
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
    this.fullName = this.user?.fullName || '';
    this.email = this.user?.email || '';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  switchTab(tab: 'data' | 'password') {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
  }

  close() {
    this.closed.emit();
  }

  async saveProfile() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.fullName.trim()) {
      this.errorMessage = 'Numele complet este obligatoriu.';
      return;
    }
    if (!this.email.trim()) {
      this.errorMessage = 'Email-ul este obligatoriu.';
      return;
    }

    try {
      this.saving = true;
      await this.userService.updateUser({
        fullName: this.fullName.trim(),
        email: this.email.trim()
      });
      this.successMessage = 'Datele au fost actualizate cu succes!';
      this.userUpdated.emit({
        fullName: this.fullName.trim(),
        email: this.email.trim()
      });
    } catch (err) {
      console.error('Eroare la salvare:', err);
      this.errorMessage = 'Nu am putut salva modificările. Încearcă din nou.';
    } finally {
      this.saving = false;
    }
  }

  async changePassword() {
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    if (!this.currentPassword) {
      this.passwordErrorMessage = 'Introdu parola curentă.';
      return;
    }
    if (!this.newPassword) {
      this.passwordErrorMessage = 'Introdu noua parolă.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordErrorMessage = 'Noua parolă trebuie să aibă cel puțin 8 caractere.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMessage = 'Parolele nu coincid.';
      return;
    }

    try {
      this.savingPassword = true;
      await this.userService.changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      });
      this.passwordSuccessMessage = 'Parola a fost schimbată cu succes!';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (err: any) {
      console.error('Eroare la schimbarea parolei:', err);
      const backendMsg = err?.response?.data?.message || err?.response?.data;
      this.passwordErrorMessage = typeof backendMsg === 'string' && backendMsg
        ? backendMsg
        : 'Nu am putut schimba parola. Verifică parola curentă.';
    } finally {
      this.savingPassword = false;
    }
  }
}
