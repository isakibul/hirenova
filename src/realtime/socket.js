const { Server } = require("socket.io");

const tokenService = require("../lib/token");
const userService = require("../lib/user");
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");
const { getAllowedOrigins } = require("../config/env");

let io;

const getAllowedOrigin = () => {
  const origins = getAllowedOrigins();
  return origins.length === 1 ? origins[0] : origins;
};

const getUserRoom = (userId) => `user:${userId}`;

const initRealtime = (server) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigin(),
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

      if (!token || (await isTokenBlacklisted(token))) {
        return next(new Error("Authentication required"));
      }

      const decoded = tokenService.verifyToken({ token });
      const user = decoded.id
        ? await userService.findUserById(decoded.id)
        : await userService.findUserByEmail(decoded.email);

      if (!user || user.status !== "active") {
        return next(new Error("Authentication required"));
      }

      socket.user = { ...user._doc, id: user.id };
      socket.join(getUserRoom(user.id));
      userService.touchLastSeen(user.id).catch(() => undefined);
      return next();
    } catch {
      return next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", {
      userId: socket.user.id,
    });
  });

  return io;
};

const emitToUser = (userId, eventName, payload) => {
  if (!io || !userId) {
    return;
  }

  io.to(getUserRoom(userId.toString())).emit(eventName, payload);
};

module.exports = {
  initRealtime,
  emitToUser,
};
