import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GoogleSignInService {
  private googleInitialized = false;

  constructor() {}

  async initializeGoogleSignIn(): Promise<void> {
    if (this.googleInitialized) return;

    return new Promise((resolve) => {
      if (typeof window.google !== 'undefined') {
        window.google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => {},
        });
        this.googleInitialized = true;
        resolve();
      } else {
        setTimeout(() => {
          this.initializeGoogleSignIn().then(resolve);
        }, 100);
      }
    });
  }

  async signInWithPopup(): Promise<any> {
    await this.initializeGoogleSignIn();

    return new Promise((resolve, reject) => {
      if (typeof window.google !== 'undefined') {
        setTimeout(() => {
          const mockUser = {
            credential: 'mock_google_token_' + Date.now(),
            user: {
              id: 'google_user_123',
              email: 'user@gmail.com',
              name: 'Google User',
              picture: 'https://via.placeholder.com/100',
              given_name: 'Google',
              family_name: 'User',
            },
          };
          resolve(mockUser);
        }, 1000);
      } else {
        reject(new Error('Google Sign-In não está disponível'));
      }
    });
  }

  renderButton(element: HTMLElement, callback: (response: any) => void): void {
    this.initializeGoogleSignIn().then(() => {
      if (typeof window.google !== 'undefined') {
        window.google.accounts.id.renderButton(element, {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
        });

        window.google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: callback,
        });
      }
    });
  }
}
