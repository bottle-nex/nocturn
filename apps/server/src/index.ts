import express from 'express';
import router from './routes/index.ts';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import WebsocketServer from './sockets/socket.server.ts';
import http from 'http';
import initServices from './services/init.services.ts';
import { env } from './configs/env.ts';
import { prisma } from '@nocturn/database';
import './services/cron.ts';
import parser_middleware from './middlewares/parser.middleware.ts';

const PORT = env.SERVER_PORT;
const WEB_URL = env.SERVER_WEB_URL;
const app = express();
const server = http.createServer(app);

app.use(parser_middleware);
app.use(cookieParser());
app.use(
    cors({
        origin: WEB_URL,
        credentials: true,
    }),
);

initServices();
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api/v1', router);

const wsServer = new WebsocketServer(server);

server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await prisma.$queryRawUnsafe('SELECT 1').catch(() => {});
});

function gracefulShutdown(signal: string) {
    console.log(`${signal} received. Starting graceful shutdown...`);

    server.close();

    wsServer.wss.clients.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(
                JSON.stringify({
                    type: 'SERVER_RESTARTING',
                    payload: {
                        message: 'Server is restarting, you will be reconnected automatically.',
                    },
                }),
            );
        }
    });

    setTimeout(() => {
        wsServer.wss.clients.forEach((ws) => {
            ws.close(1012, 'Service restart');
        });
        process.exit(0);
    }, 2000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
