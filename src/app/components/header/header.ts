import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth';
import { Router ,RouterLink} from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;

  constructor(private authService: AuthService,private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated;
    this.currentUser$ = this.authService.currentUser;
    
  }

  onLogout() {
    this.authService.logout();
  }
}