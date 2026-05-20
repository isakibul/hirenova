"use client";

import { io } from "socket.io-client";
import { getBrowserRealtimeUrl } from "./env";

let realtimeSocket;
let subscriberCount = 0;
let disconnectTimer;

export function acquireRealtimeSocket(accessToken = "") {
  if (disconnectTimer) {
    window.clearTimeout(disconnectTimer);
    disconnectTimer = undefined;
  }

  if (!realtimeSocket) {
    realtimeSocket = io(getBrowserRealtimeUrl(), {
      auth: accessToken ? { token: accessToken } : undefined,
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ["websocket", "polling"],
    });
  }

  subscriberCount += 1;

  return {
    socket: realtimeSocket,
    release() {
      subscriberCount = Math.max(0, subscriberCount - 1);

      if (subscriberCount === 0) {
        disconnectTimer = window.setTimeout(() => {
          if (subscriberCount === 0 && realtimeSocket) {
            realtimeSocket.disconnect();
            realtimeSocket = undefined;
          }
        }, 1000);
      }
    },
  };
}
