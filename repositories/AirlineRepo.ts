import { Connection } from "../config";
import { Data, Query } from "../interfaces";

export const obtenerAerolineas = function (): Promise<Data[]> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select airline_code, airline_name from airline
        `).then(res => res.rows?.map(row => ({
            id: row.at(0),
            name: row.at(1)
        })) as Data[])
    );
}

export const obtenerConsecutivoAerolineaById = function (airlineCode: string): Promise<string> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<number[]>(`
            select (
                case when max(flight_number) is null then 0
                else max(flight_number) end
            ) numero from flight where airline_code = :ac
        `, [airlineCode]).then(res => `${Number(res.rows?.at(0)?.at(0)) + 1}`)
    );
}

export const obtenerVuelosAerolineaById = function (airlineCode: string): Promise<string[]> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<number[]>(`
            select flight_number from flight where airline_code = :ac
        `, [airlineCode]).then(res => res.rows?.map(row => `${row.at(0)}`) as string[])
    );
}

export const obtenerSegmentoByVuelo = function (airlineCode: string, flightNumber: number, airportCode: string): Promise<string[][]> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select consec_fs, airport_code_dest from flight_segment
            where airline_code = :ac and flight_number = :fn and airport_code_orig = :aco
        `, [airlineCode, flightNumber, airportCode]).then(res => res.rows as string[][])
    );
}

export const obtenerConexionByVuelo = function (consecFs: number, airlineCode: string, flightNumber: number, airportCodeOrig: string): Promise<string[][]> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select consec_fs2, airline_code2, flight_number2, airport_code_dest2 from flight_connection
            where consec_fs1 = :cfs and airline_code1 = :ac and flight_number1 = :fn
            and airport_code_dest1 = :acd
        `, [consecFs, airlineCode, flightNumber, airportCodeOrig]).then(res => res.rows as string[][])
    );
}

export const obtenerSegmentosByQuery = function (query: Query, directo?: boolean): Promise<string[][]> {
    const cursor = Connection.getConnection().getCursor();
    if (directo) {
        return (
            cursor.execute<string[]>(`
                select fs.airline_code, fs.flight_number from flight_segment fs
                inner join flight f on fs.airline_code = f.airline_code and fs.flight_number = f.flight_number
                where fs.airport_code_orig = :aco and to_char(f."DATE", 'YYYY-MM-DD') = :df1
                intersect
                select fs.airline_code, fs.flight_number from flight_segment fs
                inner join flight f on fs.airline_code = f.airline_code and fs.flight_number = f.flight_number
                where fs.airport_code_dest = :acd and to_char(f."DATE", 'YYYY-MM-DD') = :df2
            `, [query.aeropuertoOrigen, query.fechaViaje, query.aeropuertoDestino, query.fechaViaje])
                .then(res => res.rows as string[][])
        );
    }

    return (
        cursor.execute<string[]>(`
            select fs.airline_code, fs.flight_number from flight_segment fs
            inner join flight f on fs.airline_code = f.airline_code and fs.flight_number = f.flight_number
            where fs.airport_code_orig = :aco and to_char(f."DATE", 'YYYY-MM-DD') = :df1
            minus
            select fs.airline_code, fs.flight_number from flight_segment fs
            inner join flight f on fs.airline_code = f.airline_code and fs.flight_number = f.flight_number
            where fs.airport_code_dest = :acd and to_char(f."DATE", 'YYYY-MM-DD') = :df2
        `, [query.aeropuertoOrigen, query.fechaViaje, query.aeropuertoDestino, query.fechaViaje])
            .then(res => res.rows as string[][])
    );
}

export const obtenerNombreAerolineaById = function (airlineCode: string): Promise<string> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select airline_name from airline where airline_code = :ac
        `, [airlineCode]).then(res => `${res.rows?.at(0)?.at(0)}`)
    );
}