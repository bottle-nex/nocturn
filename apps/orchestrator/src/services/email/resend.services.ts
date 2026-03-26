import {
    CollaboratorAddedEmailData,
    CollaboratorInviteEmailData,
    OtpEmailData,
    WinnerNotificationEmailData,
} from '@nocturn/types';
import QRCode from 'qrcode';
import { Resend } from 'resend';
import { Env } from '../../configs/env';
import EmailTemplate from './templates/email.templates';

const resend = new Resend(Env.ORCH_RESEND_KEY);

export default class ResendService {
    static async send_collaborator_added_email(data: CollaboratorAddedEmailData) {
        const html = EmailTemplate.generate_collaborator_added_email({
            userName: data.name,
            inviterName: data.inviterName,
            quizTitle: data.quizTitle,
            quizUrl: `${process.env.WEB_URL || 'http://localhost:3000'}/new/${data.quizId}`,
        });

        await resend.emails.send({
            from: 'Nocturn <noreply@nocturn.app>',
            to: data.email,
            subject: `You've been added as a collaborator on "${data.quizTitle}"`,
            html,
        });
    }

    static async send_collaborator_invited_email(data: CollaboratorInviteEmailData) {
        const html = EmailTemplate.generate_collaborator_invite_email({
            inviterName: data.inviterName,
            quizTitle: data.quizTitle,
            inviteUrl: `${process.env.WEB_URL || 'http://localhost:3000'}/invite/${data.invitationId}`,
        });

        await resend.emails.send({
            from: 'Nocturn <noreply@nocturn.app>',
            to: data.email,
            subject: `${data.inviterName} invited you to collaborate on "${data.quizTitle}"`,
            html,
        });
    }

    static async send_otp_email(data: OtpEmailData) {
        const html = EmailTemplate.generate_otp_email(data.otp);

        await resend.emails.send({
            from: 'Nocturn <noreply@nocturn.app>',
            to: data.email,
            subject: 'Your Nocturn sign-in code',
            html,
        });
    }

    static async send_winner_notification_email(data: WinnerNotificationEmailData) {
        const qrCodeDataUrl = await QRCode.toDataURL(data.claimUrl, {
            width: 200,
            margin: 2,
            color: { dark: '#E84545', light: '#2B2E4A' },
        });

        const html = EmailTemplate.generate_winner_notification_email({
            participantName: data.participantName,
            quizTitle: data.quizTitle,
            rank: data.rank,
            prizeAmount: data.prizeAmount,
            claimUrl: data.claimUrl,
            expiresAt: data.expiresAt,
            qrCodeDataUrl,
        });

        const rankLabel =
            data.rank === 1
                ? '1st'
                : data.rank === 2
                  ? '2nd'
                  : data.rank === 3
                    ? '3rd'
                    : `${data.rank}th`;

        await resend.emails.send({
            from: 'Nocturn <noreply@nocturn.app>',
            to: data.email,
            subject: `🏆 You placed ${rankLabel} in "${data.quizTitle}" — Claim your prize!`,
            html,
        });
    }
}
