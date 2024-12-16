import { AfterContentInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterContentInit {

  user: any;
  loading: boolean = true;

  vinculos = [
    { ruta: '/solicitar-viaje', titulo: 'Solicitar viaje', icono: 'add' },
    { ruta: '/rutas', titulo: 'Rutas', icono: 'calendar' },
  ];

  vinculoConductor = [
    { rutaconductor: '/crear-viajes', tituloconductor: 'Crear viaje', iconoconductor: 'car' },
    { rutaconductor: '/viajes', tituloconductor: 'Viajes', iconoconductor: 'globe' },
    
  ];
  data: any;

  constructor(private router: Router, private auth: AuthServiceService) {}

  async ngAfterContentInit() {
    console.log("hola after")
      
  }

  async ngOnInit() {
    this.loading = true;
    console.log("hola")

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['login']);
      return;
    }

    this.user = await this.auth.getUser();
    this.loading = false;
    this.auth._onDataChange.subscribe(async (data) => {
      this.loading=true
      this.user = await this.auth.getUser();
      this.loading =false
    } )
  }
  loadData() {
    this.data = 'Datos actualizados'; // Simula cargar datos actualizados
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['login']);
  }
}
