import { Message } from "./messageTypes";

export type UserSentMessage = {
  text: string;
  username: string;
  time: number;
};

export function isUserMessage(data: unknown): data is Message {
  const typedData = data as Message;
  return (
    typedData !== undefined &&
    typedData.eventName === "send_message_to_room" &&
    typedData.data.text !== undefined &&
    typedData.data.username !== undefined &&
    typedData.data.time !== undefined
  );
}
