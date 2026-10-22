import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export default function useSSE(url, onMessage) {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) return;

    const controller = new AbortController();

    fetchEventSource(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
      onmessage(event) {
        try {
          onMessage(JSON.parse(event.data));
        } catch (error) {
          console.error("Failed to parse SSE message:", error);
        }
      },
      onerror(error) {
        console.error("SSE connection error:", error);
        throw error;
      },
    }).catch((error) => {
      if (error.name !== "AbortError") {
        console.error("SSE connection failed:", error);
      }
    });

    return () => controller.abort();
  }, [url, user, token, onMessage]);
}