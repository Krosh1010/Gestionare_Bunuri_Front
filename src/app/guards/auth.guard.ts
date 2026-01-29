import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const tokenString = localStorage.getItem('authToken');
    let token: string | null = null;
    try {
      if (tokenString) {
        const parsed = JSON.parse(tokenString);
        token = parsed && parsed.token ? parsed.token : null;
      }
    } catch (e) {
      token = null;
    }
    if (token && typeof token === 'string' && token.trim() !== '') {
      return true;
    } else {
      this.router.navigate(['/login']); 
      return false;
    }
  }
}
