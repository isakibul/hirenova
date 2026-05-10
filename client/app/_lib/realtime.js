"use client";

import { io } from "socket.io-client";

let realtimeSocket;
let realtimeToken = "";
let subscriberCount = 0;
let disconnectTimer;

function getRealtimeUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_REALTIME_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim();

  if (backendApiUrl) {
    try {
      const url = new URL(backendApiUrl);
      url.pathname = url.pathname.replace(/\/api\/v1\/?$/, "") || "/";
      url.search = "";
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    } catch {
      return "http://localhost:4000";
    }
  }

  return "http://localhost:4000";
}

export function acquireRealtimeSocket(accessToken) {
  if (!accessToken) {
    return null;
  }

  if (disconnectTimer) {
    window.clearTimeout(disconnectTimer);
    disconnectTimer = undefined;
  }

  if (realtimeSocket && realtimeToken !== accessToken) {
    realtimeSocket.disconnect();
    realtimeSocket = undefined;
    subscriberCount = 0;
  }

  if (!realtimeSocket) {
    realtimeToken = accessToken;
    realtimeSocket = io(getRealtimeUrl(), {
      auth: {
        token: accessToken,
      },
      autoConnect: true,
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
            realtimeToken = "";
          }
        }, 1000);
      }
    },
  };
}
