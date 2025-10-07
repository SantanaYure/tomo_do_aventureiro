import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(
    // Verificar localStorage, caso contrário iniciar como FALSE (aberta)
    localStorage.getItem('sidebarCollapsed') === 'true' ? true : false
  );

  public collapsed$: Observable<boolean> = this.collapsedSubject.asObservable();

  constructor() {
    // Se não há valor no localStorage, definir como false (aberta) por padrão
    if (localStorage.getItem('sidebarCollapsed') === null) {
      localStorage.setItem('sidebarCollapsed', 'false');
    }
  }

  get isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsedSubject.next(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }

  toggle(): void {
    this.setCollapsed(!this.isCollapsed);
  }
}
