import { Itinerario, Query, Report, SegmentInfo } from "../interfaces";
import { obtenerLugarAeropuertoById, obtenerNombreAeropuertoById } from "./AirportRepo";
import { obtenerNombrePilotoByFlightSegment, obtenerNombrePilotoById } from "./PilotRepo";
import { obtenerConexionByVuelo, obtenerNombreAerolineaById, obtenerSegmentoByVuelo, obtenerSegmentosByQuery } from "./AirlineRepo";

const realizarReporte = async function (data: {
    airlineCode: string,
    airportCode: string,
    flightNumber: number,
    flightDate: string,
    consecFs?: number,
    pilotLicense?: string
}): Promise<Report> {
    const airline = await obtenerNombreAerolineaById(data.airlineCode);
    const airport = await obtenerNombreAeropuertoById(data.airportCode);
    const places = await obtenerLugarAeropuertoById(data.airportCode);
    const pilot = data.consecFs && await obtenerNombrePilotoByFlightSegment(data.consecFs) ||
        data.pilotLicense && await obtenerNombrePilotoById(data.pilotLicense);

    const report: Report = {
        airline,
        airport,
        flight: `${data.airlineCode}${data.flightNumber}`,
        pilot,
        date: data.flightDate,
        city: places.at(0),
        division: places.at(1),
        country: places.at(2)
    }

    return report;
}

const realizarItinerario = async function (data: {
    segment: string[],
    query: Query,
    airportCodeOrig: string,
    isConnection?: boolean
}): Promise<Itinerario[][]> {
    const itinerariosTotal: Itinerario[][] = [];
    const itinerarios: Itinerario[] = [];
    const airlineCode = data.segment.at(0) as string;
    const flightNumber = data.segment.at(1) as unknown as number;
    const flightDate = data.query.fechaViaje;
    let airportCodeOrig = data.airportCodeOrig;

    do {
        const segmentDest = (await obtenerSegmentoByVuelo(airlineCode, flightNumber, airportCodeOrig))
            .at(0) as string[];
        const consecFsDest = segmentDest?.at(0) as unknown as number;
        const airportCodeDest = segmentDest?.at(1) as string;

        const reporteVueloOrigen = await realizarReporte({
            airlineCode,
            flightNumber,
            flightDate,
            airportCode: airportCodeOrig,
            consecFs: consecFsDest
        });

        const reporteVueloDest = await realizarReporte({
            airlineCode,
            flightNumber,
            flightDate,
            airportCode: airportCodeDest,
            consecFs: consecFsDest
        });

        itinerarios.push({
            type: 'Trayecto',
            reports: [reporteVueloOrigen, reporteVueloDest]
        });

        if (data.isConnection) {
            const obtenerItinerarioByConexion = async function (dataConnection: {
                connections: string[][],
                airlineCode: string,
                flightNumber: number,
                flightDate: string,
                airportCode: string,
                consecFs: number
            }): Promise<Itinerario[][]> {
                const itinerariosConexion: Itinerario[][] = [];
                for (const conexion of dataConnection.connections) {
                    const consecFs2 = conexion.at(0) as unknown as number;
                    const airlineCode2 = conexion.at(1) as string;
                    const flightNumber2 = conexion.at(2) as string;
                    const airportCodeOrig2 = conexion.at(3) as string;

                    const itinerarioConexion = await realizarItinerario({
                        segment: [airlineCode2, flightNumber2],
                        airportCodeOrig: airportCodeOrig2,
                        query: data.query,
                        isConnection: true
                    });

                    if (itinerarioConexion.length > 0) {
                        const reporteVuelo = await realizarReporte({
                            airlineCode: dataConnection.airlineCode,
                            flightNumber: dataConnection.flightNumber,
                            flightDate: dataConnection.flightDate,
                            airportCode: dataConnection.airportCode,
                            consecFs: dataConnection.consecFs
                        });

                        itinerariosConexion.push(...itinerarioConexion.map(itinerario => {
                            itinerario.unshift({
                                type: 'Conexión',
                                reports: [reporteVuelo, itinerario.at(0)?.reports?.at(0) as Report]
                            });

                            return itinerario;
                        }));
                    }
                }

                return itinerariosConexion;
            }

            const conexiones = await obtenerConexionByVuelo(
                consecFsDest,
                airlineCode,
                flightNumber,
                airportCodeDest
            );

            const itinerariosConexiones = await obtenerItinerarioByConexion({
                connections: conexiones,
                airlineCode,
                flightNumber,
                flightDate,
                airportCode: airportCodeDest,
                consecFs: consecFsDest
            });

            if (itinerariosConexiones.length) {
                itinerariosTotal.push(...itinerariosConexiones.map(itinerario => (
                    [...itinerarios, ...itinerario]
                )));
            }
        }

        airportCodeOrig = airportCodeDest;

    } while (airportCodeOrig !== data.query.aeropuertoDestino && airportCodeOrig !== undefined);

    if (airportCodeOrig !== undefined)
        itinerariosTotal.push(itinerarios);

    return itinerariosTotal;
}

export const generarReporteSegmentos = async function (segmentInfo: SegmentInfo): Promise<Report[]> {
    const reports: Report[] = [];
    for (const airportCode of segmentInfo.aeropuertos) {
        const reporte = await realizarReporte({
            airlineCode: segmentInfo.aerolinea,
            flightNumber: Number(segmentInfo.numeroVuelo),
            flightDate: segmentInfo.fecha,
            airportCode,
            pilotLicense: segmentInfo.piloto
        });

        reports.push(reporte);
    }

    return reports;
}

export const generarReporte = async function (query: Query): Promise<Itinerario[][]> {
    const reports: Itinerario[][] = [];

    // Se realiza el itinerario para los vuelos directos.
    let flightSegments = await obtenerSegmentosByQuery(query, true);
    for (const segment of flightSegments) {
        const itinerarios: Itinerario[][] = await realizarItinerario({
            segment,
            query,
            airportCodeOrig: query.aeropuertoOrigen
        });

        reports.push(...itinerarios);
    }

    // Se realiza el itinerario para los vuelos que posiblemente tengan conexiones.
    flightSegments = await obtenerSegmentosByQuery(query);
    for (const segment of flightSegments) {
        const itinerarios: Itinerario[][] = await realizarItinerario({
            segment,
            query,
            airportCodeOrig: query.aeropuertoOrigen,
            isConnection: true
        });

        itinerarios.length && reports.push(...itinerarios);
    }

    return reports;
}