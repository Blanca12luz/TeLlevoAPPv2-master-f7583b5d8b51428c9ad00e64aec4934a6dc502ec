import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;
  passwordVisible: boolean = false; // Estado para controlar la visibilidad de la contraseña
  passwordFieldType: string = 'password'; // Tipo de campo de la contraseña

  constructor(
    private fb: FormBuilder,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore, // Para obtener datos adicionales del usuario
    private navCtrl: NavController,
    private storage: Storage // Inyectar Ionic Storage
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.initStorage(); // Inicializar el almacenamiento
  }

  async initStorage() {
    await this.storage.create();
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      try {
        // Autenticar al usuario con Firebase Authentication
        const userCredential = await this.auth.signInWithEmailAndPassword(email, password);

        // Obtener datos adicionales del usuario desde Firestore
        const userDoc = await this.firestore
          .collection('users')
          .doc(userCredential.user?.uid)
          .get()
          .toPromise();

          if (userDoc?.exists) {
            const userData = {
              uid: userCredential.user?.uid,
              email,
              
            };

        // Guardar sesión en localStorage
        localStorage.setItem('auth-user', JSON.stringify(userData));

          // Redirigir al usuario a la página principal
          this.navCtrl.navigateForward('/home');
        } else {
          alert('No se encontraron datos adicionales del usuario.');
        }
      } catch (error: any) {
        // Manejo de errores
        switch (error.code) {
          case 'auth/user-not-found':
            alert('No existe un usuario con ese correo.');
            break;
          case 'auth/wrong-password':
            alert('Contraseña incorrecta.');
            break;
          case 'auth/invalid-email':
            alert('El formato del correo es inválido.');
            break;
          default:
            alert('Ocurrió un error. Intenta nuevamente.');
            console.log(error);
        }
      }
    }
  }

  // Función para alternar la visibilidad de la contraseña
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    this.passwordFieldType = this.passwordVisible ? 'text' : 'password';
  }
}
