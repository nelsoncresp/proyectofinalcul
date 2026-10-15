import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';
import { suppressTransitionsOnce } from '../utils/suppress-transitions';
import { Subscription } from 'rxjs';

interface NavLink {
  path: string;
  label: string;
}

const NAV_BY_ROLE: Record<UserRole, NavLink[]> = {
  Estudiante: [{ path: '/dashboard-estudiante', label: 'Mis rutas' }],
  Administrador: [
    { path: '/dashboard-admin', label: 'Panel de curaduría' },
    { path: '/node-editor', label: 'Editor de nodos' }
  ]
};

/**
 * Píxeles que hay que SUBIR el scroll para que una barra escondida vuelva a
 * aparecer (~varias muescas de rueda o un deslize deliberado del trackpad).
 * Sin este umbral, un roce mínimo bastaba para que parpadeara y el auto-hide
 * no servía de nada. También reaparece al llegar al tope de la página.
 */
const UMBRAL_REAPARICION = 250;

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-navbar',
  templateUrl: '../views/navbar.view.html',
  styleUrls: ['../styles/navbar.style.css']
})
export class NavbarController implements OnInit, OnDestroy {
  /** Auto-hide en el aula: al bajar el scroll la barra se esconde. */
  @HostBinding('class.is-hidden') isHidden = false;

  /**
   * Tema activo sobre el host. El botón ofrece SIEMPRE el modo al que se va a
   * cambiar (no el actual): en claro se ve la luna → pasa a oscuro, y en
   * oscuro se ve el sol → pasa a claro.
   */
  @HostBinding('class.is-dark') get isDark(): boolean {
    return this.isDarkMode;
  }

  user = this.auth.getCurrentUser();

  private lastScrollY = 0;
  /** Punto más bajo alcanzado mientras la barra estaba escondida. */
  private yOculto = 0;
  private routerSub?: Subscription;

  constructor(private auth: AuthService, private router: Router) {
    // Mantener el usuario sincronizado tras login/logout (el guard navega
    // antes de que este componente se cree, pero por si cambia en caliente).
    this.auth.currentUser$.subscribe(u => (this.user = u));
    // Restaurar preferencia de tema guardada en localStorage.
    this.applyStoredTheme();
    // Al salir del aula la barra siempre vuelve (aunque se haya escondido).
    this.routerSub = this.router.events.subscribe(evento => {
      if (evento instanceof NavigationEnd && !evento.urlAfterRedirects.startsWith('/aula/')) {
        this.setOculto(false);
      }
    });
  }

  ngOnInit(): void {
    this.lastScrollY = window.scrollY;
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    this.routerSub?.unsubscribe();
    this.setOculto(false);
  }

  /**
   * Auto-hide del navbar (solo dentro de /aula): bajar el scroll esconde la
   * barra de inmediato, pero para volver a verla hay que subir un tramo
   * deliberado (UMBRAL_REAPARICION px acumulados desde el punto más bajo) o
   * llegar al tope de la página. Así los micro-movimientos, el rebote del
   * trackpad o un roce accidental no la hacen reaparecer.
   */
  private readonly onScroll = (): void => {
    const y = window.scrollY;
    const enAula = this.router.url.startsWith('/aula/');
    if (!enAula || y <= 8) {
      this.setOculto(false);
    } else if (this.isHidden) {
      // Sigue bajando: registra el punto más bajo desde el que hay que subir.
      if (y > this.yOculto) this.yOculto = y;
      if (this.yOculto - y >= UMBRAL_REAPARICION) this.setOculto(false);
    } else if (y > this.lastScrollY + 2) {
      this.setOculto(true);
      this.yOculto = y;
    }
    this.lastScrollY = y;
  };

  private setOculto(oculto: boolean): void {
    if (this.isHidden === oculto) return;
    this.isHidden = oculto;
    // .aula-top (sticky en top:60px) sube al borde del viewport mientras la
    // barra está oculta, para que no quede un hueco de 60px arriba.
    document.documentElement.classList.toggle('nav-oculto', oculto);
  }

  private applyStoredTheme(): void {
    const saved = localStorage.getItem('cul_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  get links(): NavLink[] {
    return this.user ? NAV_BY_ROLE[this.user.rol] : [];
  }

  get initials(): string {
    if (!this.user) return '';
    return this.user.nombre
      .split(/\s+/)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    suppressTransitionsOnce();
    const isDark = document.documentElement.classList.toggle('dark-mode');
    // Persistir preferencia para que sobreviva recarga de página.
    localStorage.setItem('cul_theme', isDark ? 'dark' : 'light');
  }

  /** true cuando el modo oscuro está activo (el botón muestra el ícono opuesto). */
  get isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark-mode');
  }

  /** Etiqueta accesible: anuncia el modo al que SE VA a cambiar. */
  get themeLabel(): string {
    return this.isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  }

  get isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }

  get isRegisterPage(): boolean {
    return this.router.url.includes('/register');
  }
}
