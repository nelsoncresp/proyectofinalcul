import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { IllustrationController } from './illustration.controller';

type RegisterStatus = 'idle' | 'submitting' | 'success' | 'error' | 'server-error';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IllustrationController],
  selector: 'app-register',
  templateUrl: '../views/register.view.html',
  styleUrls: ['../styles/auth.style.css', '../styles/register.style.css']
})
export class RegisterController {
  form: FormGroup;
  status: RegisterStatus = 'idle';
  serverError = '';
  showPassword = false;

  readonly semestres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      nombre:   ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      semestre: [null as number | null, [Validators.required]],
      jornada:  [null as 'Diurno' | 'Nocturno' | null, [Validators.required]]
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || !c.invalid || (!c.touched && !c.dirty)) return '';
    if (c.hasError('required'))   return this.requiredMsg(name);
    if (c.hasError('email'))      return 'El formato del correo no es válido.';
    if (c.hasError('minlength')) {
      const min = c.errors?.['minlength']?.requiredLength;
      return name === 'nombre'
        ? `El nombre debe tener al menos ${min} caracteres.`
        : `La contraseña debe tener al menos ${min} caracteres.`;
    }
    return '';
  }

  private requiredMsg(name: string): string {
    const msgs: Record<string, string> = {
      nombre:   'Ingresa tu nombre completo.',
      email:    'Ingresa tu correo institucional.',
      password: 'Crea una contraseña.',
      semestre: 'Selecciona tu semestre actual.',
      jornada:  'Selecciona tu jornada.'
    };
    return msgs[name] ?? 'Este campo es obligatorio.';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstInvalid = Object.keys(this.form.controls).find(k => this.form.get(k)!.invalid);
      if (firstInvalid) document.getElementById(`reg-${firstInvalid}`)?.focus();
      return;
    }

    const { nombre, email, password, semestre, jornada } = this.form.getRawValue();
    this.status = 'submitting';
    this.serverError = '';

    // rol_id = 3 siempre para el registro público (Estudiante)
    this.api.register(nombre, email, password, 3, semestre, jornada).subscribe({
      next: () => {
        this.status = 'success';
        // Redirige al login luego de 1.8s para que el usuario vea la confirmación
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: err => {
        if (err?.status === 400) {
          this.status = 'error';
          this.serverError = 'Ya existe una cuenta con ese correo electrónico.';
        } else {
          this.status = 'server-error';
          this.serverError = 'No se pudo conectar con el servidor. Intenta de nuevo.';
        }
      }
    });
  }
}
