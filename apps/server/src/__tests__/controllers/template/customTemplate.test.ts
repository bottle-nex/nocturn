import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { FEATURE, planManager } from '@nocturn/premium';
import { SubscriptionEnum } from '@nocturn/types';
import Subscription from '../../../middlewares/subscription.middleware';
import upsertCustomTemplateController from '../../../controllers/template-controller/upsertCustomTemplateController';
import getAllTemplatesController from '../../../controllers/template-controller/getAllTemplatesController';
import { buildRouteApp } from '../../helpers/app.helper';
import { TEST_USER } from '../../helpers/auth.helper';

const database = vi.hoisted(() => ({
    user: { findUnique: vi.fn() },
    template: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
    },
}));

vi.mock('@nocturn/database', () => ({ prisma: database }));

const app = buildRouteApp(
    'post',
    '/quiz/upsert-template',
    (req, _res, next) => {
        req.user = { ...TEST_USER, subscription: SubscriptionEnum.PRO };
        next();
    },
    Subscription.template_creation_limit,
    upsertCustomTemplateController,
);

const colors = {
    backgroundColor: '#112233',
    textColor: '#ffffff',
    borderColor: '#445566',
    accentType: 'solid',
    accentColor: '#778899',
    itemsColor: '#abcdef',
    itemsTextColor: '#123456',
    buttonColor: '#654321',
    buttonTextColor: '#fedcba',
    bars: ['#112233'],
    src: 'custom-template',
};

const savedTemplate = { ...colors, id: 'saved-theme', name: 'CUSTOM', userId: TEST_USER.id };

describe('custom theme saving', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.resetAllMocks();
        database.user.findUnique.mockResolvedValue({
            subscriptions: [{ tier: { name: SubscriptionEnum.PRO } }],
        });
        database.template.create.mockResolvedValue(savedTemplate);
        database.template.update.mockResolvedValue(savedTemplate);
    });

    it('saves every theme color through the unbound Express plan middleware', async () => {
        const response = await request(app)
            .post('/quiz/upsert-template')
            .send({ ...colors, id: 'NEW_CUSTOM' })
            .expect(200);

        expect(database.user.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: TEST_USER.id } }),
        );
        expect(database.template.create).toHaveBeenCalledWith({
            data: { ...colors, name: 'CUSTOM', userId: TEST_USER.id },
        });
        expect(response.body.data).toEqual(savedTemplate);
    });

    it('updates all colors on a previously saved theme', async () => {
        database.template.findUnique.mockResolvedValue(savedTemplate);

        await request(app)
            .post('/quiz/upsert-template')
            .send({ ...colors, id: savedTemplate.id })
            .expect(200);

        expect(database.template.update).toHaveBeenCalledWith({
            where: { id: savedTemplate.id },
            data: colors,
        });
        expect(database.template.create).not.toHaveBeenCalled();
    });

    it.each([null, { ...savedTemplate, userId: 'another-user' }])(
        'creates an owned copy when the source is missing or belongs to another user: %s',
        async (source) => {
            database.template.findUnique.mockResolvedValue(source);

            await request(app)
                .post('/quiz/upsert-template')
                .send({ ...colors, id: 'source-theme' })
                .expect(200);

            expect(database.template.create).toHaveBeenCalledWith({
                data: { ...colors, name: 'CUSTOM', userId: TEST_USER.id },
            });
            expect(database.template.update).not.toHaveBeenCalled();
        },
    );

    it.each(['itemsTextColor', 'buttonColor', 'buttonTextColor'])(
        'rejects a missing required %s before writing to the database',
        async (field) => {
            const body = Object.fromEntries(
                Object.entries(colors).filter(([key]) => key !== field),
            );

            await request(app).post('/quiz/upsert-template').send(body).expect(400);

            expect(database.template.create).not.toHaveBeenCalled();
        },
    );

    it('returns a clear plan error when custom themes are disabled', async () => {
        database.user.findUnique.mockResolvedValue({ subscriptions: [] });
        const gate = vi.spyOn(planManager, 'isEnabled').mockReturnValue(false);

        const response = await request(app).post('/quiz/upsert-template').send(colors).expect(403);

        expect(gate).toHaveBeenCalledWith(SubscriptionEnum.FREE, FEATURE.CUSTOM_THEME);
        expect(response.body.error.code).toBe('CANNOT_CREATE_CUSTOM_THEME');
        expect(response.body.message).toBe('Become a Pro user to create custom templates');
        expect(database.template.create).not.toHaveBeenCalled();
    });

    it('rejects unauthenticated saves before checking the plan', async () => {
        const unauthenticatedApp = buildRouteApp(
            'post',
            '/quiz/upsert-template',
            Subscription.template_creation_limit,
            upsertCustomTemplateController,
        );

        await request(unauthenticatedApp).post('/quiz/upsert-template').send(colors).expect(401);

        expect(database.user.findUnique).not.toHaveBeenCalled();
        expect(database.template.create).not.toHaveBeenCalled();
    });

    it('returns saved themes in the library used by other quizzes', async () => {
        database.template.findMany.mockResolvedValue([savedTemplate]);
        const libraryApp = buildRouteApp(
            'get',
            '/quiz/get-templates',
            (req, _res, next) => {
                req.user = { ...TEST_USER, subscription: SubscriptionEnum.PRO };
                next();
            },
            getAllTemplatesController,
        );

        const response = await request(libraryApp).get('/quiz/get-templates').expect(200);

        expect(database.template.findMany).toHaveBeenCalledWith({
            where: { OR: [{ userId: null }, { userId: TEST_USER.id }] },
            select: expect.objectContaining({
                itemsColor: true,
                itemsTextColor: true,
                buttonColor: true,
                buttonTextColor: true,
            }),
        });
        expect(response.body.data).toEqual([savedTemplate]);
    });
});
