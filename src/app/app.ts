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

  // Constantes de configuração
  private readonly AUTH_VERIFICATION_DELAY = 2000; // ms

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupAuthListener();
  }

  private setupAuthListener() {
    // 🔥 CRÍTICO: Escutar mudanças no estado de autenticação do Firebase
    this.firebaseService.onAuthStateChanged(async (user) => {
      console.log('🔐 [APP] Estado de autenticação mudou:', user ? `User: ${user.uid}` : 'NULL');

      if (user) {
        // Usuário está autenticado no Firebase
        try {
          const token = await user.getIdToken();

          // Verificar se já tem dados no localStorage
          const storedUser = localStorage.getItem('currentUser');
          const storedToken = localStorage.getItem('authToken');

          if (!storedUser) {
            // Se não tem, criar dados básicos do usuário
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

            console.log('✅ [APP] Sessão restaurada do Firebase');
            console.log('📦 [APP] Dados salvos:', { uid: user.uid, email: user.email });
          } else if (storedToken !== token) {
            // Atualizar token se mudou
            localStorage.setItem('authToken', token);
            console.log('✅ [APP] Token atualizado');
          } else {
            console.log('✅ [APP] Sessão já existe no localStorage');
          }
        } catch (error) {
          console.error('❌ [APP] Erro ao obter token:', error);
        }
      } else {
        // Usuário NÃO está autenticado
        const hasToken = localStorage.getItem('authToken');

        if (hasToken) {
          // Tem token mas Firebase não reconhece = sessão expirada
          console.log('⚠️ [APP] Firebase retornou NULL mas tem token no localStorage');
          console.log('⚠️ [APP] Aguardando 2 segundos antes de limpar (pode ser temporário)...');

          // Aguardar um pouco antes de limpar (Firebase pode estar restaurando)
          setTimeout(() => {
            const userAfterWait = this.firebaseService.getCurrentUser();

            if (!userAfterWait) {
              console.log('❌ [APP] Sessão confirmada como expirada, limpando localStorage');
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');

              // Redirecionar para login apenas se não estiver já lá
              const currentUrl = this.router.url;
              if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
                console.log('🔄 [APP] Redirecionando para login');
                this.router.navigate(['/login']);
              }
            } else {
              console.log('✅ [APP] Firebase restaurou a sessão, mantendo login');
            }
          }, this.AUTH_VERIFICATION_DELAY);
        } else {
          console.log('ℹ️ [APP] Usuário não autenticado (esperado na página de login)');
        }
      }
    });
  }
}
