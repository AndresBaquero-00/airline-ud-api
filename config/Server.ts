import express, { Application } from "express";
import dotenv from "dotenv";

export class Server {
    private app: Application;
    private port: number = 0;

    public constructor() {
        this.app = express();
    }

    public getPort(): number {
        return this.port;
    }

    public getApp(): Application {
        return this.app;
    }

    public start(): void {
        // Cargar variables de entorno.
        dotenv.config();
        this.port = parseInt(process.env['app.port'] || '0');
        this.app.listen(this.port, process.env['app.host'] || '', function () {
            console.log('Servidor iniciado correctamente.');
        });
    }
}