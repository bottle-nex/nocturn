export enum EmailJobType {
  COLLABORATOR_INVITE = "COLLABORATOR_INVITE",
  COLLABORATOR_ADDED = "COLLABORATOR_ADDED",
}

export interface CollaboratorInviteEmailData {
  email: string;
  note?: string;
  invitationId: string;
  inviterName: string;
  quizTitle: string;
}

export interface CollaboratorAddedEmailData {
  email: string;
  note?: string;
  name: string;
  quizTitle: string;
  quizId: string;
  inviterName: string;
}

export type EmailJobData =
  | CollaboratorInviteEmailData
  | CollaboratorAddedEmailData;

export interface EmailJob {
  type: EmailJobType;
  data: EmailJobData;
}
