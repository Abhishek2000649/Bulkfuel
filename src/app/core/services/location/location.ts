import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Location {
  private locationSource = new BehaviorSubject<any>(null);

  location$ = this.locationSource.asObservable();
  currentAddress$ = new BehaviorSubject<any>(null);
  

  
  setLocation(data: any) {
    this.locationSource.next(data);
  }

  getLocation() {
    return this.locationSource.value;
  }
  
}
