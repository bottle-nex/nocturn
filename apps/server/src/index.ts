import express from 'express';
import router from './routes/index.ts';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import WebsocketServer from './sockets/WebSocketServer.ts';
import http from 'http';
import initServices from './services/init-services.ts';
import { env } from './configs/env.ts';

const PORT = env.SERVER_PORT;
const WEB_URL = env.SERVER_WEB_URL;
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: WEB_URL,
        credentials: true,
    }),
);

initServices();

app.use('/api/v1', router);

new WebsocketServer(server);

server.listen(PORT, () => {
    console.warn('Application started at port : ', PORT);
});
