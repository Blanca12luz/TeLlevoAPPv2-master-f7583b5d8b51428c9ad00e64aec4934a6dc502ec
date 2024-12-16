import { OnInit } from '@angular/core';
// profile.page.ts
import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  profile = {
    nombre: '',
    email: '',
    conductor: false,
    vehiculo: '',
    patente: '',
    uid: ''
  };
  loading = true;

  constructor(private alertController: AlertController, private authService: AuthServiceService) {}

  async ngOnInit() {
    const user: any = await this.authService.getUser();
    console.log('User:', user);
    
    if (user) {
      this.profile.nombre = user.name;
      this.profile.email = user.email;
      this.profile.conductor = user.conductor;
      this.profile.uid = user.uid;
      this.profile.vehiculo = user.vehiculo;
      this.profile.patente = user.patente;
      this.loading = false;
    }
  }

  async dejarDeSerConductor() {
    const alert = await this.alertController.create({
      header: 'Dejar de ser Conductor',
      message: '¿Estás seguro de que deseas dejar de ser conductor?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async() => {
            this.loading = true;
            this.profile.conductor = false;
            this.profile.vehiculo = '';
            this.profile.patente = '';
            try {
              await this.authService.updateUser(this.profile);
              console.log('Usuario actualizado correctamente');
            } catch (error) {
              console.error('Error al actualizar el usuario:', error);
            } finally {
              this.loading = false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async convertirEnConductor() {
    const alert = await this.alertController.create({
      header: 'Convertirse en Conductor',
      message: '¿Estás seguro de que deseas convertirte en conductor?',
      mode: 'ios',
      inputs: [
        {
          type: "text",
          label: "Ingresa el modelo de vehículo",
          name: "vehiculo",
          placeholder: "Modelo de vehículo",
        },
        {
          type: "text",
          label: "Ingresa tu patente",
          name: "patente",
          placeholder: "Patente",
          min: 6,
          max: 6,
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async(e) => {
            if (!e.vehiculo || !e.patente) {
              console.log('Faltan datos');
              return;
            }
            this.loading = true;
            this.profile.conductor = true;
            this.profile.vehiculo = e.vehiculo;
            this.profile.patente = e.patente;
            console.log('Conductor Info:', this.profile);
            const _ = await this.authService.updateUser(this.profile);
            console.log('El usuario ahora es conductor');
            console.log(_)
            this.loading = false;
          },
        },
      ],
    });

    await alert.present();
  }
}
