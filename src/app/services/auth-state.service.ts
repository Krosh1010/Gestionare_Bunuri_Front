import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  private hasToken(): boolean {
    try {
      const tokenString = localStorage.getItem('authToken');
      if (tokenString) {
        const parsed = JSON.parse(tokenString);
        return !!(parsed && parsed.token && typeof parsed.token === 'string' && parsed.token.trim() !== '');
      }
    } catch {}
    return false;
  }

  setLoggedIn(loggedIn: boolean) {
    this.loggedInSubject.next(loggedIn);
  }

  refresh() {
    this.loggedInSubject.next(this.hasToken());
  }
}
