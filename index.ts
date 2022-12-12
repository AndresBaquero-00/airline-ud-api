import cors from 'cors';
import bodyParser from 'body-parser';
import { Server, Connection } from './config';

import routes from './routes/routes';

const server = new Server();
const connection = Connection.getConnection();

server.getApp().use(cors());
server.getApp().use(bodyParser.json());
server.getApp().use('/api/v1', routes);
server.start();
