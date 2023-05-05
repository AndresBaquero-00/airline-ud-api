import express, { Application } from "express";

export class Server {
    private app: Application;
    private port: number = 3000;

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
        this.app.listen(this.port, '0.0.0.0', function () {
            console.log('Servidor iniciado correctamente.');
        });
    }
}