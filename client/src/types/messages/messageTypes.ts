export const messageEvents = {
  SEND_MESSAGE_TO_ROOM_EVENT: "send_message_to_room",
  USER_ONLINE_EVENT: "user_online",
  USER_DISCONNECTED_EVENT: "user_disconnected",
  CONNECTED_USERS_EVENT: "connected_users",
};

export const messageActions = {
  JOIN_ROOM: "join_room",
};

export type Users = Array<{ username: string; id: string }>;

export interface Message<T> {
  data?: T;
  room?: string;
  eventName?: string;
}
