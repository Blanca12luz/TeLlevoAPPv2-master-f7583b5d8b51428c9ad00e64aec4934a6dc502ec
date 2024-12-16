import { ConnectivityStateListener } from './../../../node_modules/@grpc/grpc-js/build/src/subchannel-interface.d';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { firstValueFrom } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private USER_KEY = 'auth-user'; // Clave para el almacenamiento local
  _onDataChange: EventEmitter<any> = new EventEmitter()


  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: Storage
  ) {
    this.storage.create(); // Inicializa Ionic Storage
  }

  async getUser() {
    const ConnectionStatu = await Network.getStatus()
    if (ConnectionStatu.connected) {
      // Intenta recuperar el usuario de Firebase
      const _user = await firstValueFrom(this.auth.authState);

      if (!_user) {
        // Verifica si hay un usuario almacenado localmente
        const localUser = localStorage.getItem(this.USER_KEY);
        return localUser ? JSON.parse(localUser) : null;
      }

      // Recupera los datos adicionales del usuario en Firestore
      const __user = await firstValueFrom(this.firestore.collection('users').doc(_user.uid).get());
      const ___user: any = __user.data();
      const user = {
        uid: _user.uid,
        email: ___user.email,
        name: ___user.name,
        conductor: ___user.conductor || false,
        vehiculo: ___user.vehiculo,
        patente: ___user.patente,
      };

      // Guarda los datos en localStorage para que estén disponibles sin conexión
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));

      return user; // Devuelve el usuario autenticado
    }
    else {
      const user = localStorage.getItem(this.USER_KEY);
      if (user){
        return user
      }
    }
    return false
  }

  async updateUser(user: any) {
    console.log('User:', user);
    const data = await this.firestore.collection('users').doc(user.uid).set(user, { merge: true });
    this._onDataChange.emit(data)
    return data;
  }

  async logout() {
    // Limpia ambos sistemas de almacenamiento
    localStorage.removeItem('auth-user');
    await this.storage.remove('user');
    return this.auth.signOut();
  }

  async isLoggedIn(): Promise<boolean> {
    const user = localStorage.getItem(this.USER_KEY);
    return !!user;
  }


}
