export enum EmailJobType {
  COLLABORATOR_INVITE = "COLLABORATOR_INVITE",
  COLLABORATOR_ADDED = "COLLABORATOR_ADDED",
  OTP_EMAIL = "OTP_EMAIL",
  WINNER_NOTIFICATION = "WINNER_NOTIFICATION",
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

export interface OtpEmailData {
  email: string;
  otp: string;
}

export interface WinnerNotificationEmailData {
  email: string;
  participantName: string;
  quizTitle: string;
  rank: number;
  prizeAmount: number;
  claimUrl: string;
  expiresAt: string;
}

export type EmailJobData =
  | CollaboratorInviteEmailData
  | CollaboratorAddedEmailData
  | OtpEmailData
  | WinnerNotificationEmailData;

export interface EmailJob {
  type: EmailJobType;
  data: EmailJobData;
}
