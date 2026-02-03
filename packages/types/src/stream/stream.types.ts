export interface stream {
  type: STREAM;
  data: unknown;
}

export enum STREAM {
  MESSAGE = "MESSAGE",
  MESSAGES = "MESSAGES",
  TITLE = "TITLE",
  QUIZ = "QUIZ",
  ID = "ID",
  END = "END",
}
