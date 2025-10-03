import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CharacterCreationComponent } from './components/character-creation/character-creation.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'character-creation',
    component: CharacterCreationComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/login' }, // Wildcard route para páginas não encontradas
];
