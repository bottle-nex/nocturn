interface CollaboratorInviteTemplateData {
    inviterName: string;
    quizTitle: string;
    inviteUrl: string;
}

interface CollaboratorAddedTemplateData {
    userName: string;
    inviterName: string;
    quizTitle: string;
    quizUrl: string;
}

interface WinnerNotificationTemplateData {
    participantName: string;
    quizTitle: string;
    rank: number;
    prizeAmount: number;
    claimUrl: string;
    expiresAt: string;
    qrCodeDataUrl: string;
}

export default class EmailTemplate {
    static generate_collaborator_invite_email(data: CollaboratorInviteTemplateData): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Collaboration Invite</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 48px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border: 2px solid #4f46e5; border-radius: 8px; box-shadow: 4px 4px 0px #4f46e5;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 32px 24px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 4px 4px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Collaboration Invite
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <p style="margin: 0 0 24px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                                <strong style="color: #4f46e5; font-weight: 600;">${data.inviterName}</strong> has invited you to collaborate on the following quiz:
                            </p>
                            <div style="background-color: #0f172a; border: 2px solid #334155; padding: 20px 24px; margin: 24px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #f1f5f9; font-size: 18px; font-weight: 600; line-height: 1.4;">
                                    ${data.quizTitle}
                                </p>
                            </div>
                            <p style="margin: 0 0 32px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                                Accept this invitation to gain collaborative access and start contributing on Nocturn.
                            </p>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 32px 40px;" align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                                <tr>
                                    <td>
                                        <a href="${data.inviteUrl}" style="display: inline-block; padding: 14px 36px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600; border: 2px solid #6366f1; box-shadow: 3px 3px 0px #6366f1; letter-spacing: -0.2px; transition: all 0.2s;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #0f172a; border-top: 2px solid #334155; border-radius: 0 0 4px 4px;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px; text-align: center;">
                                Sent by ${data.inviterName} via <strong style="color: #4f46e5;">Nocturn</strong>
                            </p>
                            <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                                If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
    }

    static generate_collaborator_added_email(data: CollaboratorAddedTemplateData): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Added as Collaborator</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 48px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border: 2px solid #4f46e5; border-radius: 8px; box-shadow: 4px 4px 0px #4f46e5;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 32px 24px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 4px 4px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Collaborator Access Granted
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <p style="margin: 0 0 24px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                                Hello ${data.userName},
                            </p>
                            <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                                <strong style="color: #4f46e5; font-weight: 600;">${data.inviterName}</strong> has added you as a collaborator on:
                            </p>
                            <div style="background-color: #0f172a; border: 2px solid #334155; padding: 20px 24px; margin: 24px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #f1f5f9; font-size: 18px; font-weight: 600; line-height: 1.4;">
                                    ${data.quizTitle}
                                </p>
                            </div>
                            <p style="margin: 0 0 32px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                                You now have full collaborative access. Click below to view and start contributing to this quiz.
                            </p>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 32px 40px;" align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                                <tr>
                                    <td>
                                        <a href="${data.quizUrl}" style="display: inline-block; padding: 14px 36px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600; border: 2px solid #6366f1; box-shadow: 3px 3px 0px #6366f1; letter-spacing: -0.2px; transition: all 0.2s;">
                                            Open Quiz
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #0f172a; border-top: 2px solid #334155; border-radius: 0 0 4px 4px;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px; text-align: center;">
                                Added by ${data.inviterName} on <strong style="color: #4f46e5;">Nocturn</strong>
                            </p>
                            <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} Nocturn. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
    }

    static generate_otp_email(otp: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Nocturn Sign-In Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 48px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border: 2px solid #4f46e5; border-radius: 8px; box-shadow: 4px 4px 0px #4f46e5;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 32px 24px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 4px 4px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Your Sign-In Code
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px 24px; text-align: center;">
                            <p style="margin: 0 0 32px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                                Use the code below to sign in to your Nocturn account. It expires in <strong style="color: #e2e8f0;">10 minutes</strong>.
                            </p>
                            <div style="background-color: #0f172a; border: 2px solid #334155; padding: 28px 24px; margin: 0 auto; border-radius: 4px; display: inline-block;">
                                <p style="margin: 0; color: #ffffff; font-size: 40px; font-weight: 700; letter-spacing: 16px; font-family: 'Courier New', Courier, monospace;">
                                    ${otp}
                                </p>
                            </div>
                            <p style="margin: 32px 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                                If you didn't request this code, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #0f172a; border-top: 2px solid #334155; border-radius: 0 0 4px 4px;">
                            <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} <strong style="color: #4f46e5;">Nocturn</strong>. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
    }

    static generate_winner_notification_email(data: WinnerNotificationTemplateData): string {
        const rankColors: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
        const rankColor = rankColors[data.rank] || '#4f46e5';
        const rankLabel =
            data.rank === 1
                ? '1st'
                : data.rank === 2
                  ? '2nd'
                  : data.rank === 3
                    ? '3rd'
                    : `${data.rank}th`;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You Won a Prize!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 48px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border: 2px solid ${rankColor}; border-radius: 8px; box-shadow: 4px 4px 0px ${rankColor};">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 32px 24px; text-align: center; background: linear-gradient(135deg, #2B2E4A 0%, #53354A 100%); border-radius: 4px 4px 0 0;">
                            <p style="margin: 0 0 8px; font-size: 48px;">&#127942;</p>
                            <h1 style="margin: 0; color: ${rankColor}; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                You Won!
                            </h1>
                            <p style="margin: 8px 0 0; color: #F3ECE7; font-size: 16px; font-weight: 400;">
                                Congratulations, ${data.participantName}!
                            </p>
                        </td>
                    </tr>

                    <!-- Prize Details -->
                    <tr>
                        <td style="padding: 32px;">
                            <div style="background-color: #0f172a; border: 2px solid #334155; padding: 24px; margin: 0 0 24px; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 4px; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Quiz</p>
                                <p style="margin: 0 0 20px; color: #f1f5f9; font-size: 18px; font-weight: 600;">${data.quizTitle}</p>

                                <div style="display: inline-block; background-color: ${rankColor}20; border: 1px solid ${rankColor}; border-radius: 24px; padding: 6px 20px; margin: 0 0 16px;">
                                    <span style="color: ${rankColor}; font-size: 16px; font-weight: 700;">${rankLabel} Place</span>
                                </div>

                                <p style="margin: 16px 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Prize Amount</p>
                                <p style="margin: 4px 0 0; color: #ffffff; font-size: 36px; font-weight: 700; font-family: 'Courier New', monospace;">
                                    ${data.prizeAmount} SOL
                                </p>
                            </div>

                            <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6; text-align: center;">
                                Connect your Solana wallet to claim your prize. Scan the QR code or click the button below.
                            </p>
                        </td>
                    </tr>

                    <!-- QR Code -->
                    <tr>
                        <td style="padding: 0 32px 24px;" align="center">
                            <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; display: inline-block;">
                                <img src="${data.qrCodeDataUrl}" alt="Claim QR Code" width="200" height="200" style="display: block;" />
                            </div>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 32px 32px;" align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                                <tr>
                                    <td>
                                        <a href="${data.claimUrl}" style="display: inline-block; padding: 16px 40px; background-color: #E84545; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 700; letter-spacing: -0.2px;">
                                            Claim Your Prize
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                        <td style="padding: 0 32px 32px;" align="center">
                            <div style="background-color: #E8454520; border: 1px solid #E84545; border-radius: 4px; padding: 12px 20px;">
                                <p style="margin: 0; color: #E84545; font-size: 13px; font-weight: 600;">
                                    This claim expires on ${data.expiresAt}. Unclaimed prizes will be returned to the host.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #0f172a; border-top: 2px solid #334155; border-radius: 0 0 4px 4px;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px; text-align: center;">
                                Prize powered by <strong style="color: #E84545;">Nocturn</strong> on Solana
                            </p>
                            <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                                &copy; ${new Date().getFullYear()} Nocturn. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();
    }
}
