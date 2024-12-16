import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { ActionSheetController } from '@ionic/angular';
@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.page.html',
  styleUrls: ['./viajes.page.scss'],
})
export class ViajesPage implements OnInit {
  public viajes: any[] = []; // Lista de viajes obtenidos desde Firebase
  user :any;
  constructor(private firestore: AngularFirestore, private _auth:AuthServiceService, private actionSheetCtrl: ActionSheetController) {}

  async ngOnInit() {
    this.user = await this._auth.getUser()
    await this.obtenerViajes(); // Llamamos al método para obtener los viajes al iniciar el componente
    
  }

  async obtenerViajes() {
    this.firestore
      .collection('viajes') // Nombre de la colección en Firebase
      .valueChanges({ idField: 'id' }) // Recuperar datos con ID agregado como campo
      .subscribe(
        (data: any[]) => {
          this.viajes = data.filter ((doc:any)=>doc.usuario == this.user.uid); // Asignamos los datos obtenidos a la lista de viajes
          console.log('Viajes obtenidos:', this.viajes); // Mostramos los datos obtenidos en consola
        },
        (error) => {
          console.error('Error al obtener viajes:', error); // Capturamos cualquier error al obtener los viajes
        }
      );
  }


  async estadoviaje(viaje: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Cambiar Estado del Viaje',
      mode: "ios",
      buttons: [
        {
          text: 'Viajando',
          handler: () => {
            this.actualizarEstadoViaje(viaje, 'Viajando');
          },
          role: 'selected',
        },
        {
          text: 'Cancelado',
          handler: () => {
            this.actualizarEstadoViaje(viaje, 'Cancelado');
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
  
    await actionSheet.present();
  }
  
async actualizarEstadoViaje(viaje: any, nuevoEstado: string) {
  try {
    await this.firestore.collection('viajes').doc(viaje.id).update({
      estadoviaje: nuevoEstado, 
    });
    this.obtenerViajes();
  } catch (error) {
    console.error('Error al actualizar el estado del viaje:', error);
    alert('Hubo un error al actualizar el estado del viaje.');
  }
}


  BorrarViaje(viajes: any) {
    
    if (confirm(`¿Estás seguro de cancelar el viaje a ${viajes.id}`)) {
      this.firestore
        .collection('viajes')
        .doc(viajes.id)
        .delete()
        .then(() => {
          console.log('Viaje eliminado.');
          alert('Viaje eliminado exitosamente.');
        })
        .catch((error) => {
          console.error('Error al eliminar el viaje:', error);
        });
    }
  }
}
