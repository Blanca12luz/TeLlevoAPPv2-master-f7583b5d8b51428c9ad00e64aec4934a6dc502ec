import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthServiceService, private router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise<boolean>(async( resolve, reject) => {
      const user = await this.auth.getUser()
      if (user){
        resolve (true)
      }else {
        this.router.navigate(['/login']);
        resolve(false);
      }
      
    });
  }
}
