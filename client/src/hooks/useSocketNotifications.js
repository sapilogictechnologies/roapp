import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { baseApi } from "../services/baseApi";

// Derives the socket server URL from the same env var used by RTK Query
const SERVER_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://roapp.onrender.com/api"
).replace(/\/api\/?$/, "");

/**
 * Connects to the Socket.IO server using the stored JWT token.
 * On receiving notification:new or message:new events, it invalidates
 * the relevant RTK Query cache tags — triggering an immediate re-fetch
 * without waiting for the 10-second polling interval.
 *
 * The 10-second polling in NotificationBell remains active as a fallback
 * if the socket is disconnected or unavailable.
 */
export function useSocketNotifications() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("ro_token");
    if (!token) return;

    const socket = io(SERVER_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on("notification:new", () => {
      dispatch(baseApi.util.invalidateTags(["Notifications"]));
    });

    socket.on("message:new", () => {
      dispatch(baseApi.util.invalidateTags(["Messages", "Notifications"]));
    });

    // Silent failure — polling handles the fallback
    socket.on("connect_error", () => {});

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [dispatch]);
}
