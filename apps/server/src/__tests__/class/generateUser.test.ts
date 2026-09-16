import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import GenerateUser from '../../class/generateUser';

const publicDir = path.resolve(__dirname, '../../../../web/public');

describe('GenerateUser.getRandomAvatar', () => {
    it('only returns avatars that ship with the web app', () => {
        const seen = new Set<string>();

        for (let i = 0; i < 2000; i++) {
            const avatar = GenerateUser.getRandomAvatar();
            seen.add(avatar);
            expect(existsSync(path.join(publicDir, avatar))).toBe(true);
        }

        // every avatar is reachable, so an off-by-one in the range is caught
        expect(seen.size).toBe(76);
    });
});
