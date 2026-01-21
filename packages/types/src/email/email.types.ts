export enum EmailJobType {
  COLLABORATOR_INVITE = "COLLABORATOR_INVITE",
  COLLABORATOR_ADDED = "COLLABORATOR_ADDED",
}

export interface CollaboratorInviteEmailData {
  email: string;
  invitationId: string;
  inviterName: string;
  quizTitle: string;
}

export interface CollaboratorAddedEmailData {
  email: string;
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
