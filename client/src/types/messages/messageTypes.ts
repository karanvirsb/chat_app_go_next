import { UserSentMessage } from "./isUserMessage";

export type messageEvents = {
  SEND_MESSAGE_TO_ROOM_EVENT: "send_message_to_room";
  USER_ONLINE_EVENT: "user_online";
  USER_DISCONNECTED_EVENT: "user_disconnected";
  CONNECTED_USERS_EVENT: "connected_users";
};

export type messageActions = {
  JOIN_ROOM: "join_room";
};

export type Users = Array<{ username: string; id: string }>;

export type UserStatus = { username: string; id: string };

export type JoinRoom = {
  username: string;
  rooms: string[];
};

export type Message =
  | {
      eventName: messageEvents["SEND_MESSAGE_TO_ROOM_EVENT"];
      data: UserSentMessage;
      room: string;
    }
  | { eventName: messageEvents["CONNECTED_USERS_EVENT"]; data: Users }
  | { eventName: messageEvents["USER_DISCONNECTED_EVENT"]; data: UserStatus }
  | { eventName: messageEvents["USER_ONLINE_EVENT"]; data: UserStatus }
  | { eventName: messageActions["JOIN_ROOM"]; data: JoinRoom };
