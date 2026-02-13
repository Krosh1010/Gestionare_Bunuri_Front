import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/ApiServices/user.service';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SettingsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error = false;
  showSettings = false;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.user = await this.userService.getInfoUser();
    } catch (err) {
      console.error('Eroare la încărcarea profilului:', err);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  getInitials(): string {
    if (!this.user?.fullName) return '?';
    const parts = this.user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  onUserUpdated(data: { fullName: string; email: string }) {
    this.user.fullName = data.fullName;
    this.user.email = data.email;
  }
}
