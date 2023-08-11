export function isMessage<T>(data: unknown): data is Message<T> {
  const d = data as Message<T>;
  return (
    d.data !== undefined && d.eventName !== undefined && d.room !== undefined
  );
}
