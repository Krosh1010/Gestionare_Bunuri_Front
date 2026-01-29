import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,NgIf,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  isLoggedIn = true; // Schimbă în funcție de autentificare
  isMobileMenuOpen = false;
  isUserDropdownOpen = false;
  private sub: Subscription;

  constructor(private authState: AuthStateService, private router: Router) {
    this.sub = this.authState.loggedIn$.subscribe(val => {
      this.isLoggedIn = val;
    });
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
    
    // Închide meniul mobil dacă se face click pe overlay
    if (target.classList.contains('mobile-menu-overlay')) {
      this.toggleMobileMenu();
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
