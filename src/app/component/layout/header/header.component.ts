import { Component, HostBinding, HostListener, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { UserService } from '../../../services/ApiServices/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  isLoggedIn = false;
  @HostBinding('class.mobile-menu-open') isMobileMenuOpen = false;
  isUserDropdownOpen = false;
  userName = '';
  userEmail = '';
  userInitials = '';
  private sub: Subscription;

  constructor(
    private authState: AuthStateService,
    private router: Router,
    private userService: UserService
  ) {
    this.sub = this.authState.loggedIn$.subscribe(val => {
      this.isLoggedIn = val;
      if (val) {
        this.loadUserInfo();
      } else {
        this.userName = '';
        this.userEmail = '';
        this.userInitials = '';
      }
    });
  }

  private async loadUserInfo(): Promise<void> {
    try {
      const user = await this.userService.getInfoUser();
      this.userName = user.fullName || user.name || '';
      this.userEmail = user.email || '';
      this.userInitials = this.getInitials(this.userName);
    } catch (error) {
      console.error('Eroare la încărcarea datelor utilizatorului:', error);
    }
  }

  private getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  // Comută meniul mobil
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Închide dropdown-ul userului dacă este deschis
    if (this.isUserDropdownOpen) {
      this.isUserDropdownOpen = false;
    }
    
    // Blochează scrolling-ul când meniul mobil este deschis
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Comută dropdown-ul userului
  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  // Închide toate dropdown-urile
  closeAllDropdowns(): void {
    this.isUserDropdownOpen = false;
  }
  logout() {
    localStorage.removeItem('authToken');
    this.authState.setLoggedIn(false);
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

   // Închide meniul mobil la click în afara
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Închide dropdown-ul userului dacă se face click în afara
    if (!target.closest('.user-menu-container')) {
      this.isUserDropdownOpen = false;
    }
  }

  // Închide meniul mobil la resize dacă ecranul devine mai mare
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = window.innerWidth;
    if (width > 992 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  }

  // Gestionează keydown events pentru accesibilitate
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.isMobileMenuOpen) {
        this.toggleMobileMenu();
      }
      if (this.isUserDropdownOpen) {
        this.isUserDropdownOpen = false;
      }
    }
  }

}
