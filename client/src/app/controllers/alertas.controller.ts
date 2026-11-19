import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaService } from '../services/alerta.service';
import { Alerta } from '../models/alerta.model';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../views/alertas.view.html',
  styleUrls: ['../styles/alertas.style.css']
})
export class AlertasController {
  constructor(public alertas: AlertaService) {}

  trackById(_index: number, alerta: Alerta): number {
    return alerta.id;
  }
}
