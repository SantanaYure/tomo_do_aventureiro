import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { CharacterCreationComponent } from './components/character-creation/character-creation.component';
import { CharacterViewComponent } from './components/character-view/character-view.component';
import { MyCharactersComponent } from './components/my-characters/my-characters.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'create-character', component: CharacterCreationComponent, canActivate: [AuthGuard] },
  { path: 'create-character/:id', component: CharacterCreationComponent, canActivate: [AuthGuard] },
  { path: 'view-character/:id', component: CharacterViewComponent, canActivate: [AuthGuard] },
  { path: 'my-characters', component: MyCharactersComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }, // Wildcard route para páginas não encontradas
];
