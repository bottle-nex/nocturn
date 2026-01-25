export interface stream {
    type: STREAM;
    data: unknown;
}

export enum STREAM {
    MESSAGE,
    TITLE,
    QUIZ,
}
