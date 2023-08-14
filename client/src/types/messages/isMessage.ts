import { Message } from "./messageTypes";

export function isMessage(data: unknown): data is Message {
  const d = data as Message;
  return (
    d.data !== undefined &&
    d.eventName !== undefined &&
    (d.eventName === "connected_users" ||
      d.eventName === "join_room" ||
      d.eventName === "send_message_to_room" ||
      d.eventName === "user_disconnected" ||
      d.eventName === "user_online" ||
      d.eventName === "user_connected")
  );
}
