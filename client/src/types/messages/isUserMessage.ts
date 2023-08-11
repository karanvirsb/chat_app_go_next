import { Message } from "./messageTypes";

export type UserSentMessage = {
  text: string;
  username: string;
  time: number;
};

export function isUserMessage(data: unknown): data is Message<UserSentMessage> {
  const typedData = data as Message<UserSentMessage>;
  return (
    typedData.data !== undefined &&
    typedData.data.text !== undefined &&
    typedData.data.username !== undefined &&
    typedData.data.time !== undefined
  );
}
