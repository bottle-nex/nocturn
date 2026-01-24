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
}
