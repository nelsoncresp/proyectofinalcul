import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AlertaTipo = 'exito' | 'error' | 'info';

export interface Alerta {
  id: number;
  tipo: AlertaTipo;
  titulo: string;
  detalle?: string;
}

/**
 * Sistema único de alertas de la app (toasts). Los modales quedan
 * reservados para confirmaciones destructivas; todo lo demás fluye
 * por aquí.
 */
@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly subject = new BehaviorSubject<Alerta[]>([]);
  private seq = 1;

  get alertas$(): Observable<Alerta[]> {
    return this.subject.asObservable();
  }

  exito(titulo: string, detalle?: string): void {
    this.mostrar('exito', titulo, detalle);
  }

  error(titulo: string, detalle?: string): void {
    this.mostrar('error', titulo, detalle);
  }

  info(titulo: string, detalle?: string): void {
    this.mostrar('info', titulo, detalle);
  }

  cerrar(id: number): void {
    this.subject.next(this.subject.value.filter(a => a.id !== id));
  }

  private mostrar(tipo: AlertaTipo, titulo: string, detalle?: string): void {
    const alerta: Alerta = { id: this.seq++, tipo, titulo, detalle };
    this.subject.next([...this.subject.value, alerta]);
    window.setTimeout(() => this.cerrar(alerta.id), 5000);
  }
}
