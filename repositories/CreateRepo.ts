import { Connection } from "../config";
import { ConnectionInfo, SegmentInfo } from "../interfaces";

export const crearSegmento = async function (segmentInfo: SegmentInfo): Promise<boolean> {
    const cursor = Connection.getConnection().getCursor();

    let res = await cursor.execute(`
        insert into flight values (:ac, :fn, to_date(:fd, 'YYYY-MM-DD'))
    `, [segmentInfo.aerolinea, Number(segmentInfo.numeroVuelo), segmentInfo.fecha]);

    for (let i = 0; i < segmentInfo.aeropuertos.length; i++) {
        try {
            const airportCodeOrig = segmentInfo.aeropuertos[i];
            const airportCodeDest = segmentInfo.aeropuertos[i + 1];
            res = await cursor.execute(`
                insert into flight_segment values (:acd, :ac, :fn, fs_sequence.nextval, :aco)
            `, [airportCodeDest, segmentInfo.aerolinea, Number(segmentInfo.numeroVuelo), airportCodeOrig]);

            res = await cursor.execute(`
                insert into pilot_assignment values (:acd, :ac, :fn, (
                    select max(consec_fs) from flight_segment
                ), :pl, pa_sequence.nextval)
            `, [airportCodeDest, segmentInfo.aerolinea, Number(segmentInfo.numeroVuelo), segmentInfo.piloto]);
        } catch (e) {
            break;
        }
    }
    
    cursor.commit();
    return true;
}

export const crearConexion = async function (connectionInfo: ConnectionInfo): Promise<boolean> {
    const cursor = Connection.getConnection().getCursor();
    const res = await cursor.execute(`
        insert into flight_connection values (:apd1, :aed1, :fnd1, (
            select consec_fs from flight_segment
            where airport_code_dest = :apd2 and airline_code = :aed2 and flight_number = :fnd2
        ), :apo1, :aeo1, :fno1, (
            select consec_fs from flight_segment
            where airport_code_dest = :apo2 and airline_code = :aeo2 and flight_number = :fno2
        ))
    `, [
        connectionInfo.aeropuertoDestino, 
        connectionInfo.aerolineaDestino, 
        Number(connectionInfo.vueloDestino),
        connectionInfo.aeropuertoDestino, 
        connectionInfo.aerolineaDestino, 
        Number(connectionInfo.vueloDestino),
        connectionInfo.aeropuertoOrigen,
        connectionInfo.aerolineaOrigen,
        Number(connectionInfo.vueloOrigen),
        connectionInfo.aeropuertoOrigen,
        connectionInfo.aerolineaOrigen,
        Number(connectionInfo.vueloOrigen)
    ]);

    cursor.commit();
    return true;
}