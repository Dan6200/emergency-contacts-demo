export const isError = (_object: unknown): _object is Error =>
  typeof _object === "object" &&
  typeof _object !== null &&
  _object instanceof Error;
