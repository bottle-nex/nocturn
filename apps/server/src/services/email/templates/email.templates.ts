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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 600;">
                                🎯 You've Been Invited!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hi there!
                            </p>
                            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                <strong>${data.inviterName}</strong> has invited you to collaborate on the quiz:
                            </p>
                            <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #2d3748; font-size: 18px; font-weight: 600;">
                                    "${data.quizTitle}"
                                </p>
                            </div>
                            <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Accept the invitation to join Nocturn and start collaborating!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 40px 40px;" align="center">
                            <a href="${data.inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #4299e1; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                                Accept Invitation
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #718096; font-size: 14px; text-align: center;">
                                This invitation was sent by ${data.inviterName} via Nocturn
                            </p>
                            <p style="margin: 10px 0 0; color: #a0aec0; font-size: 12px; text-align: center;">
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 600;">
                                ✨ You're Now a Collaborator!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hi ${data.userName}!
                            </p>
                            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Great news! <strong>${data.inviterName}</strong> has added you as a collaborator on:
                            </p>
                            <div style="background-color: #f7fafc; border-left: 4px solid #48bb78; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #2d3748; font-size: 18px; font-weight: 600;">
                                    "${data.quizTitle}"
                                </p>
                            </div>
                            <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                You can now view and collaborate on this quiz. Click the button below to get started!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 40px 40px;" align="center">
                            <a href="${data.quizUrl}" style="display: inline-block; padding: 14px 32px; background-color: #48bb78; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                                View Quiz
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #718096; font-size: 14px; text-align: center;">
                                You received this because ${data.inviterName} added you as a collaborator
                            </p>
                            <p style="margin: 10px 0 0; color: #a0aec0; font-size: 12px; text-align: center;">
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
