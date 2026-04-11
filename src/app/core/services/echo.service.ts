import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
(window as any).Pusher = Pusher;
@Injectable({
  providedIn: 'root'
})


export class EchoService {
  public echo: Echo<any>;

  constructor() {
    this.echo = new Echo({
      broadcaster: 'reverb',
      key: 'local-key',
      wsHost: '127.0.0.1',
       cluster: 'mt1', 
      wsPort: 8080,
      forceTLS: false,
      disableStats: true,
    });
  }
}