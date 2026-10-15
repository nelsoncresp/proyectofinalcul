import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { IllustrationController } from './illustration.controller';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IllustrationController],
  selector: 'app-landing',
  templateUrl: '../views/landing.view.html',
  styleUrls: ['../styles/landing.style.css']
})
export class LandingController implements OnInit {
  contactSent = false;
  contactData = {
    nombre: '',
    email: '',
    mensaje: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Si el usuario ya tiene sesión activa, mandarlo directo a su panel.
    if (this.auth.isLoggedIn()) {
      const destino = this.auth.getRole() === 'Administrador'
        ? '/dashboard-admin'
        : '/dashboard-estudiante';
      this.router.navigate([destino], { replaceUrl: true });
    }
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get panelLink(): string {
    return this.auth.getRole() === 'Administrador' ? '/dashboard-admin' : '/dashboard-estudiante';
  }

  sendContact(): void {
    if (this.contactData.nombre && this.contactData.email && this.contactData.mensaje) {
      this.contactSent = true;
      this.contactData = { nombre: '', email: '', mensaje: '' };
      setTimeout(() => (this.contactSent = false), 5000);
    }
  }
}
