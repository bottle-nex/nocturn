import { Contributor } from 'app/contributors/page';
import axios from 'axios';
import { ALL_CONTRIBUTORS_DETAILS_URL } from 'routes/api_routes';

export async function getAllContributors() {
    try {
        const headers: Record<string, string> = {
            Accept: 'application/vnd.github+json',
        };

        const token = process.env.GITHUB_TOKEN;
        if (token && token.startsWith('ghp_')) {
            headers.Authorization = `Bearer ${token}`;
        }

        const { data } = await axios.get(ALL_CONTRIBUTORS_DETAILS_URL, { headers });
        const botPatterns = [
            /bot$/i, // ends with 'bot'
            /\[bot\]$/i, // ends with '[bot]'
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
    } catch (error) {
        console.error('Failed to fetch contributors:', error);
        return [];
    }
}
