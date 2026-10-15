import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-access-denied',
  templateUrl: '../views/access-denied.view.html',
  styleUrls: ['../styles/access-denied.style.css']
})
export class AccessDeniedController {}
