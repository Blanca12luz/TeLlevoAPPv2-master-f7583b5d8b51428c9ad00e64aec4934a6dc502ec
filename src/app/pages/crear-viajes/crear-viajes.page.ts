import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment'; // Ruta según tu configuración
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { NgForm } from '@angular/forms';



@Component({
  selector: 'app-crear-viajes',
  templateUrl: './crear-viajes.page.html',
  styleUrls: ['./crear-viajes.page.scss'],
})
export class CrearViajesPage implements OnInit, AfterViewInit {
  public nombre: string = '';
  public fecha: string = '';
  public espacioDisponible: number = 1;
  public precio: number | null = null;
  public searchQuery: string = ''; // Para el campo de búsqueda
  public map!: mapboxgl.Map;
  public marker!: mapboxgl.Marker;
  public currentLocation: [number, number] | null = null; // Coordenadas actuales [lng, lat]
  loading: boolean = true;
  user: any;

  constructor(private firestore: AngularFirestore, private _auth: AuthServiceService) {}

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
  

  async ngOnInit() {
    this.loading = true;
    this.fecha = new Date().toISOString();
    this.user = await this._auth.getUser();
    console.log('User:', this.user);
    this.loading = false;
  }

  ngAfterViewInit() {
    // Configurar el token de acceso para Mapbox
    (mapboxgl as any).default.accessToken = environment.mapboxAccessToken;

    // Inicializar el mapa
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.006, 40.7128], // Coordenadas iniciales (por ejemplo, Nueva York)
      zoom: 12,
    });

    // Añadir un marcador inicial
    this.marker = new mapboxgl.Marker().setLngLat([-74.006, 40.7128]).addTo(this.map);
  }

  usarGPS() {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada en tu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Guardar ubicación actual
        this.currentLocation = [longitude, latitude];

        // Centrar el mapa y mover el marcador a la ubicación actual
        this.map.flyTo({ center: this.currentLocation, zoom: 14 });
        this.marker.setLngLat(this.currentLocation);

        console.log('Ubicación actual:', this.currentLocation);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener la ubicación.');
      }
    );
  }

  searchLocation() {
    if (!this.searchQuery.trim()) return;

    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      this.searchQuery
    )}.json?access_token=${(mapboxgl as any).default.accessToken}`;

    fetch(geocodingUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;

          // Actualizar el mapa y el marcador
          this.map.flyTo({ center: [lng, lat], zoom: 14 });
          this.marker.setLngLat([lng, lat]);

          console.log('Destino encontrado:', [lng, lat]);
        } else {
          alert('No se encontraron resultados para esa ubicación.');
        }
      })
      .catch((error) => {
        console.error('Error al buscar ubicación:', error);
      });
  }

  trazarRuta() {
    if (!this.currentLocation) {
      alert('Por favor, activa el GPS primero.');
      return;
    }

    const destino = this.marker.getLngLat(); // Obtener las coordenadas del marcador de destino
    console.log (this.marker) 
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.currentLocation[0]},${this.currentLocation[1]};${destino.lng},${destino.lat}?geometries=geojson&access_token=${(mapboxgl as any).default.accessToken}`;

    fetch(directionsUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry;

          // Dibujar la ruta en el mapa
          if (this.map.getSource('route')) {
            this.map.removeLayer('route');
            this.map.removeSource('route');
          }

          this.map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route,
            },
          });

          this.map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#1db7dd',
              'line-width': 5,
            },
          });

          console.log('Ruta trazada con éxito.');
        } else {
          alert('No se pudo calcular la ruta.');
        }
      })
      .catch((error) => {
        console.error('Error al trazar la ruta:', error);
      });
  }
  
  async viajecreado(viajeForm: NgForm) {
    if (viajeForm.invalid) {
      console.log('El formulario contiene errores.');
      return;
    }
  
    const destino = this.marker.getLngLat();
    const viaje = {
      nombre: this.nombre,
      fecha: this.fecha,
      espacioDisponible: this.espacioDisponible,
      precio: this.precio,
      destino: {
        nombre: this.searchQuery,
        lng: destino.lng,
        lat: destino.lat,
      },
      usuario: this.user.uid,
      patente: this.user.patente,
      vehiculo: this.user.vehiculo,
      estado: 'Pendiente'
    };
  
    try {
      const docRef = await this.firestore.collection('viajes').add(viaje); // Genera automáticamente un ID
      await this.firestore.collection('viajes').doc(docRef.id).update({ id: docRef.id }); // Guarda el ID en el documento
      console.log('Viaje guardado en Firebase con ID:', docRef.id);
      alert('Viaje creado con éxito y guardado en Firebase.');
    } catch (error) {
      console.error('Error al guardar el viaje:', error);
      alert('Hubo un error al guardar el viaje.');
    }
  }
  
  


}
  