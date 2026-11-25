import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService, LANGS } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly langs = LANGS;
  private readonly router = inject(Router);

  signOut(): void {
    this.authService.logout();
    this.router.navigateByUrl('/airports');
  }
}
