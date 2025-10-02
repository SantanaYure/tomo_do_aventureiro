import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // Adicione mais rotas conforme necessário
  // { path: 'register', component: RegisterComponent },
  // { path: 'dashboard', component: DashboardComponent },
];
