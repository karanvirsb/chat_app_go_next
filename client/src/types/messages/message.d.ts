interface Message<T> {
  data?: T;
  room?: string;
  eventName?: string;
}
