import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = 'tomo_do_aventureiro';
  private readonly AUTH_VERIFICATION_DELAY = 2000;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    this.firebaseService.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const storedUser = localStorage.getItem('currentUser');
          const storedToken = localStorage.getItem('authToken');

          if (!storedUser) {
            const userData = {
              uid: user.uid,
              email: user.email || '',
              nome: user.displayName?.split(' ')[0] || 'Usuário',
              sobrenome: user.displayName?.split(' ').slice(1).join(' ') || '',
              nickname: user.displayName || 'User',
              photoURL: user.photoURL || undefined,
            };

            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          } else if (storedToken !== token) {
            localStorage.setItem('authToken', token);
          }
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
        }
      } else {
        const hasToken = localStorage.getItem('authToken');

        if (hasToken) {
          setTimeout(() => {
            const userAfterWait = this.firebaseService.getCurrentUser();

            if (!userAfterWait) {
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');

              const currentUrl = this.router.url;
              if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
                this.router.navigate(['/login']);
              }
            }
          }, this.AUTH_VERIFICATION_DELAY);
        }
      }
    });
  }
}
