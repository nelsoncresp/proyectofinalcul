import { Component, Input } from '@angular/core';

export type IllustrationVariant = 'hero' | 'auth';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-illustration',
  templateUrl: '../views/illustration.view.html',
  styleUrls: ['../styles/illustration.style.css']
})
export class IllustrationController {
  @Input() variant: IllustrationVariant = 'hero';
}
