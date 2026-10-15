import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, DemoAccount } from '../services/auth.service';
import { IllustrationController } from './illustration.controller';

type LoginStatus = 'idle' | 'submitting' | 'error' | 'server-error';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IllustrationController],
  selector: 'app-login',
  templateUrl: '../views/login.view.html',
  styleUrls: ['../styles/auth.style.css']
})
export class LoginController implements OnInit {
  form: FormGroup;
  status: LoginStatus = 'idle';
  serverError = '';
  showPassword = false;
  demoAccounts: DemoAccount[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.demoAccounts = this.auth.getDemoAccounts();
    // Sesión ya activa: no se muestra el login.
    if (this.auth.isLoggedIn()) this.redirectByRole();

  }

  isInvalid(name: 'email' | 'password'): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  // Mensaje de validación para un campo (vacío si es válido).
  fieldError(name: 'email' | 'password'): string {
    const control = this.form.get(name);
    if (!control || !control.invalid || (!control.touched && !control.dirty)) return '';
    return this.validationMessage(control, name);
  }

  private validationMessage(control: AbstractControl, name: 'email' | 'password'): string {
    if (control.hasError('required')) {
      return name === 'email' ? 'Ingresa tu correo institucional.' : 'Ingresa tu contraseña.';
    }
    if (control.hasError('email')) return 'El formato del correo no es válido.';
    return '';
  }

  // Validación sólo al enviar (regla de a11y): marca los controles y
  // enfoca el primer campo inválido.
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstInvalid = Object.keys(this.form.controls)
        .find(key => this.form.get(key)!.invalid);
      if (firstInvalid) {
        const el = document.getElementById(firstInvalid);
        el?.focus();
      }
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.status = 'submitting';
    this.serverError = '';

    this.auth.login(email, password).subscribe({
      next: result => {
        if (result.ok) {
          this.redirectByRole();
        } else if (result.error === 'server-error') {
          this.status = 'server-error';
          this.serverError = 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.';
        } else {
          this.status = 'error';
          this.serverError = 'Correo o contraseña incorrectos.';
        }
      },
      error: () => {
        this.status = 'server-error';
        this.serverError = 'Error inesperado. Intenta de nuevo.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Rellena el formulario con una cuenta de demostración y deja el foco
  // listo para pulsar "Ingresar".
  useAccount(account: DemoAccount): void {
    this.form.setValue({ email: account.email, password: account.password });
    this.status = 'idle';
    this.serverError = '';
    document.getElementById('login-submit')?.focus();
  }

  private redirectByRole(): void {
    const role = this.auth.getRole();
    this.router.navigate([role === 'Administrador' ? '/dashboard-admin' : '/dashboard-estudiante']);
  }
}
