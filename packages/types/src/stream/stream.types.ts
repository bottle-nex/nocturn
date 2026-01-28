export interface stream {
  type: STREAM;
  data: unknown;
}

// export type streamType =
// | {
//     type
// }

export enum STREAM {
  MESSAGE,
  MESSAGES,
  TITLE,
  QUIZ,
  ID,
}
