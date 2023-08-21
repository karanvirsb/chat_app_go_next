import eventEmitter from "@/lib/eventEmitter";
import { Message } from "@/types/messages/messageTypes";

export function emitEvents(message: Message) {
  switch (message.eventName) {
    case "connected_users":
      emitEventToMembers(message);
      break;
    case "user_disconnected":
      emitEventToChat(message);
      emitEventToMembers(message);
      break;
    case "user_connected":
      emitEventToMembers(message);
      break;
    case "send_message_to_room":
      emitEventToChat(message);
      break;
    case "user_online":
      emitEventToChat(message);
      break;
    case "join_room":
      break;
    default:
      break;
  }
}

function emitEventToMembers(message: Message) {
  eventEmitter.emit("members", message);
}
function emitEventToChat(message: Message) {
  eventEmitter.emit("chat", message);
}
