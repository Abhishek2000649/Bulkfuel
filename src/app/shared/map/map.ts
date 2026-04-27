import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { Location } from '../../core/services/location/location';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit {

  @ViewChild(GoogleMap) map!: GoogleMap;
  @ViewChild('searchBox') searchBox!: ElementRef;
  

  constructor(private location: Location) {}

  // 👉 Default center
  center: google.maps.LatLngLiteral = {
    lat: 28.6139,
    lng: 77.2090
  };

  zoom = 12;

  marker!: google.maps.Marker;


  locationData: any = null;

  ngAfterViewInit() {

  const autocomplete = new google.maps.places.Autocomplete(
    this.searchBox.nativeElement
  );

  autocomplete.addListener('place_changed', () => {

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    const mapInstance = this.map?.googleMap;
if (!mapInstance) return;

    // 👉 Move map
    mapInstance.panTo({ lat, lng });
    setTimeout(() => {
  mapInstance.setZoom(17);
}, 300);

    // 👉 Remove old marker
    if (this.marker) {
      this.marker.setMap(null);
    }

    // 👉 Add new marker
    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    // 👉 Get address
    this.getAddress(lat, lng);
  });
}


 getCurrentLocation() {

  // 👉 old data clear
  this.locationData = null;

  if (this.marker) {
    this.marker.setMap(null);
  }

  navigator.geolocation.getCurrentPosition((position) => {

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const mapInstance = this.map?.googleMap;
if (!mapInstance) return;

    // 👉 smooth move (map scroll जैसा effect)
    mapInstance.panTo({ lat, lng });

    // 👉 zoom animation
    setTimeout(() => {
  mapInstance.setZoom(17);
}, 300);

    // 👉 marker set
    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    // 👉 address
    this.getAddress(lat, lng);

  });
}
  onMapClick(event: google.maps.MapMouseEvent) {

  if (!event.latLng) return;

  const lat = event.latLng.lat();
  const lng = event.latLng.lng();

  const mapInstance = this.map?.googleMap;
if (!mapInstance) return;

  mapInstance.panTo({ lat, lng });
  setTimeout(() => {
  mapInstance.setZoom(17);
}, 300);

  if (this.marker) {
    this.marker.setMap(null);
  }

  this.marker = new google.maps.Marker({
    position: { lat, lng },
    map: mapInstance,
    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
  });

  this.getAddress(lat, lng);
}
  setMarkerAndAddress(lat: number, lng: number) {

    // 👉 Clear old data (IMPORTANT)
    this.locationData = null;

    this.center = { lat, lng };
    this.zoom = 16;

    const mapInstance = this.map.googleMap!;

    // 👉 Remove old marker
    if (this.marker) {
      this.marker.setMap(null);
    }

    // 👉 Create new marker
    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      title: 'Selected Location',
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    // 👉 Get address
    this.getAddress(lat, lng);
  }
  mapOptions: google.maps.MapOptions = {
  mapTypeControl: false,   
  fullscreenControl: false,
  streetViewControl: false,
   zoomControl: false,
};

  // =========================
  // 👉 ADDRESS FUNCTION
  // =========================
  getAddress(lat: number, lng: number) {

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {

      if (status === 'OK' && results && results.length > 0) {

        const components = results[0].address_components;

        let city = '';
        let state = '';
        let country = '';
        let pincode = '';
        let district = '';

        components.forEach((comp: any) => {

          if (comp.types.includes('locality')) {
            city = comp.long_name;
          }

          if (comp.types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          }

          if (comp.types.includes('country')) {
            country = comp.long_name;
          }

          if (comp.types.includes('postal_code')) {
            pincode = comp.long_name;
          }

          if (comp.types.includes('administrative_area_level_2')) {
            district = comp.long_name;
          }
        });
        this.locationData = {
          lat,
          lng,
          full_address: results[0].formatted_address,
          city,
          district,
          state,
          country,
          pincode
        };

        this.location.setLocation(this.locationData);

        console.log('📍 Final Location:', this.locationData);
      }
    });
  }
}