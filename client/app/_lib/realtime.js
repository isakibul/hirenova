"use client";

import { io } from "socket.io-client";
import { getBrowserRealtimeUrl } from "./env";

let realtimeSocket;
let subscriberCount = 0;
let disconnectTimer;
let currentAccessToken = "";

function getSocketAuth(accessToken) {
  return accessToken ? { token: accessToken } : undefined;
}

function refreshSocketAuth(socket, accessToken) {
  if (accessToken === currentAccessToken) {
    return;
  }

  currentAccessToken = accessToken;
  socket.auth = getSocketAuth(accessToken);

  if (socket.connected) {
    socket.disconnect().connect();
  }
}

export function acquireRealtimeSocket(accessToken = "") {
  const normalizedAccessToken = accessToken || "";

  if (disconnectTimer) {
    window.clearTimeout(disconnectTimer);
    disconnectTimer = undefined;
  }

  if (!realtimeSocket) {
    currentAccessToken = normalizedAccessToken;
    realtimeSocket = io(getBrowserRealtimeUrl(), {
      auth: getSocketAuth(normalizedAccessToken),
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ["websocket", "polling"],
    });
  } else {
    refreshSocketAuth(realtimeSocket, normalizedAccessToken);
  }

  subscriberCount += 1;
  let released = false;

  return {
    socket: realtimeSocket,
    release() {
      if (released) {
        return;
      }

      released = true;
      subscriberCount = Math.max(0, subscriberCount - 1);

      if (subscriberCount === 0) {
        disconnectTimer = window.setTimeout(() => {
          if (subscriberCount === 0 && realtimeSocket) {
            realtimeSocket.disconnect();
            realtimeSocket = undefined;
            currentAccessToken = "";
          }
        }, 1000);
      }
    },
  };
}
