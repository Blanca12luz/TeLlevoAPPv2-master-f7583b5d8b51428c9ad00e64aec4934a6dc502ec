import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private storage: Storage // Inyectar el servicio de Storage
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.initStorage(); // Inicializar el almacenamiento
  }

  async initStorage() {
    await this.storage.create();
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;

      try {
        // Registrar el usuario en Firebase Authentication
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);

        // Guardar información adicional del usuario en Firestore
        await this.firestore.collection('users').doc(userCredential.user?.uid).set({
          name,
          email,
          conductor: false,
          vehiculo: '',
          patente: '',
        });

              // Crear objeto de usuario
      const userData = {
        uid: userCredential.user?.uid,
        name,
        email,
      };

      // Guardar sesión en Ionic Storage
      await this.storage.set('user', userData);

            // Guardar sesión en localStorage
            localStorage.setItem('auth-user', JSON.stringify(userData));

        alert('¡Registro exitoso!');

        // Redirigir a una página de inicio o login
        this.navCtrl.navigateBack('/login');
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          alert('El correo electrónico ya está en uso.');
        } else if (error.code === 'auth/weak-password') {
          alert('La contraseña es demasiado débil.');
        } else {
          alert('Hubo un error al registrar. Por favor, intenta nuevamente.');
        }
        console.error('Error al registrar:', error);
      }
    }
  }
}
