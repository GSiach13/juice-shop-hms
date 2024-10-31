<<<<<<< HEAD
=======
/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

>>>>>>> ed4aa7cf05ff722551bf39862732cdba3269d7a2
import { environment } from 'src/environments/environment'
import { Injectable, NgZone } from '@angular/core'
import { io, type Socket } from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  private _socket: Socket

  constructor (private readonly ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      const options = {
        path: (window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/') + 'socket.io',
        query: {
          EIO: '4'
        },
        withCredentials: true // Add this line to enable cookies
      }

      if (environment.hostServer === '.') {
        this._socket = io(window.location.origin, options)
      } else {
        this._socket = io(environment.hostServer, options)
      }
    })
  }

  socket () {
    return this._socket
  }
}