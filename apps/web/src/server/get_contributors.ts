import { Contributor } from 'app/contributors/page';
import axios from 'axios';
import { ALL_CONTRIBUTORS_DETAILS_URL } from 'routes/api_routes';

export async function getAllContributors() {
    try {
        const { data } = await axios.get(ALL_CONTRIBUTORS_DETAILS_URL, {
            headers: {
                Accept: 'application/vnd.github+json',
                ...(process.env.GITHUB_TOKEN && {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                }),
            },
        });

        const botPatterns = [
            /bot$/i, // ends with 'bot'
            /^.*bot.*$/i, // contains 'bot' anywhere
            /temp/i, // contains 'temp'
            /^dependabot/i, // dependabot variations
            /^github-actions/i, // github actions
            /^renovate/i, // renovate bot
        ];

        const specificBotsToExclude = ['turbobot-temp'];

        return data.filter((contributor: Contributor) => {
            if (specificBotsToExclude.includes(contributor.login)) {
                return false;
            }

            // Check against bot patterns
            const isBot = botPatterns.some((pattern) => pattern.test(contributor.login));
            return !isBot;
        });
    } catch {
        return [];
    }
}
