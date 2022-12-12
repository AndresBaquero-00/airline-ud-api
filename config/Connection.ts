import oracledb, { Connection as Cursor, ConnectionAttributes } from "oracledb";
import dotenv from "dotenv";

export class Connection {
    private static instance: Connection = new Connection();
    
    private cursor!: Cursor;
    private readonly config: ConnectionAttributes;

    private constructor() {
        // Cargar variables de entorno.
        dotenv.config();
        this.config = {
            user: process.env['db.user'],
            password: process.env['db.password'],
            connectString: `${process.env['db.host']}:${process.env['db.port']}`
        }

        oracledb.getConnection(this.config)
            .then(cursor => {
                this.cursor = cursor;
                console.log('Base de datos conectada.');
            }).catch(error => {
                console.log(error);
            });
    }

    public getCursor(): Cursor {
        return this.cursor;
    }

    public static getConnection(): Connection {
        return Connection.instance;
    }
}