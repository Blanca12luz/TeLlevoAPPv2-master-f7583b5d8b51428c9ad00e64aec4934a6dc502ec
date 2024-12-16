import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
})
export class RutasPage implements OnInit {
  public rutas: any[] = []; // Lista de rutas seleccionadas

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.obtenerRutas();
  }

  obtenerRutas() {
    this.firestore
      .collection('rutas')
      .valueChanges({ idField: 'id' })
      .subscribe(
        (data: any[]) => {
          this.rutas = data;
          console.log('Rutas obtenidas:', this.rutas);
        },
        (error) => {
          console.error('Error al obtener rutas:', error);
        }
      );
  }

  cancelarViaje(ruta: any) {
    if (confirm(`¿Estás seguro de cancelar el viaje a ${ruta.destino.lat}, ${ruta.destino.lng}?`)) {

      
      this.firestore
        .collection('rutas')
        .doc(ruta.id)
        .delete()
        .then(() => {
          console.log('Viaje cancelado.');
          alert('Viaje cancelado exitosamente.');
        })
        .catch((error) => {
          console.error('Error al cancelar el viaje:', error);
        });
    }
  }
}
