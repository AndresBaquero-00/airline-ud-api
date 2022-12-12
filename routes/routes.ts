import { Request, Response, Router } from "express";
import {
    obtenerConsecutivoAerolineaById,
    obtenerAerolineas,
    obtenerVuelosAerolineaById,
    obtenerAeropuertosByVuelo,
    obtenerAeropuertos,
    obtenerPilotos,
    generarReporteSegmentos,
    crearSegmento,
    crearConexion,
    generarReporte
} from "../repositories";
import { ConnectionInfo, Query, SegmentInfo } from "../interfaces";

const routes = Router();

/* Ruta de prueba. */
routes.get('/', function (req: Request, res: Response) {
    res.json({
        ok: true,
        message: 'Hola Mundo'
    })
});

/* Endpoints para datos de aerolíneas. */
routes.get('/aerolineas/all', function (req: Request, res: Response) {
    obtenerAerolineas()
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Aerolíneas obtenidas correctamente.',
                data: value
            });
        })
});

routes.get('/aerolineas/consecutivo', function (req: Request, res: Response) {
    const airlineCode = req.query.airlineCode as string;
    obtenerConsecutivoAerolineaById(airlineCode)
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Consecutivo obtenido correctamente.',
                data: value
            });
        })
});

routes.get('/aerolineas/vuelos', function (req: Request, res: Response) {
    const airlineCode = req.query.airlineCode as string;
    obtenerVuelosAerolineaById(airlineCode)
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Vuelos obtenidos correctamente.',
                data: value
            });
        })
});

/* Endpoints para datos de aeropuertos. */
routes.get('/aeropuertos/all', function (req: Request, res: Response) {
    obtenerAeropuertos()
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Aeropuertos obtenidas correctamente.',
                data: value
            });
        })
});

routes.get('/aeropuertos/vuelo', function (req: Request, res: Response) {
    const airlineCode = req.query.airlineCode as string;
    const flightNumber = req.query.flightNumber as string;

    obtenerAeropuertosByVuelo(airlineCode, flightNumber)
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Aeropuertos obtenidas correctamente.',
                data: value
            });
        })
});

/* Endpoints para datos de pilotos. */
routes.get('/pilotos/all', function (req: Request, res: Response) {
    obtenerPilotos()
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Pilotos obtenidas correctamente.',
                data: value
            });
        })
});

/* Endpoints para obtener reportes. */
routes.get('/reporte/segmentos', function (req: Request, res: Response) {
    const segmentInfo: SegmentInfo = req.query.segmentInfo as unknown as SegmentInfo;
    generarReporteSegmentos(segmentInfo)
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Reporte generado correctamente.',
                data: value
            });
        })
});

routes.get('/reporte/query', function (req: Request, res: Response) {
    const query: Query = req.query.query as unknown as Query;
    generarReporte(query)
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Reporte generado correctamente.',
                data: value
            });
        })
});

/* Endpoints para agregar segmentos y conexiones. */
routes.post('/crear/segmento', function (req: Request, res: Response) {
    const segmentInfo: SegmentInfo = req.body.segmentInfo as SegmentInfo;
    crearSegmento(segmentInfo)
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Segmento creado correctamente.',
                data: value
            });
        })
});

routes.post('/crear/conexion', function (req: Request, res: Response) {
    const connectionInfo: ConnectionInfo = req.body.connectionInfo as ConnectionInfo;
    crearConexion(connectionInfo)
        .then(value => {
            res.json({
                state: true,
                code: '200',
                message: 'Conexión creada correctamente.',
                data: value
            });
        }).catch(error => {
            res.json({
                state: false,
                code: '501',
                message: 'Ya se encuentra una conexión entre los dos vuelos.',
                data: error
            })
        })
});

export default routes;