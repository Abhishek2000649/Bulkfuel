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

  wsHost: 'reverb-server-production-a67c.up.railway.app',
  wsPort: 443,
  wssPort: 443,

  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
});
  }
}