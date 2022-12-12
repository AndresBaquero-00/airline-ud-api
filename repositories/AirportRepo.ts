import { Connection } from "../config";
import { Data, Place } from "../interfaces";

export const obtenerAeropuertos = function (): Promise<Data[]> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select airport_code, airport_name from airport
        `).then(res => res.rows?.map(row => ({
            id: row.at(0),
            name: row.at(1)
        })) as Data[])
    )
}

export const obtenerAeropuertosByVuelo = function (airlineCode: string, flightNumber: string) {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select distinct a.airport_code, a.airport_name from flight_segment fs
            inner join airport a on fs.airport_code_dest = a.airport_code
            where fs.flight_number = :fn and fs.airline_code = :ac
        `, [Number(flightNumber), airlineCode]).then(res => res.rows?.map(row => ({
            id: row.at(0),
            name: row.at(1)
        })) as Data[])
    );
}

export const obtenerNombreAeropuertoById = function (airportCode: string): Promise<string> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select airport_name from airport where airport_code = :ac
        `, [airportCode]).then(res => `${res.rows?.at(0)?.at(0)}`)
    );
}

export const obtenerLugarAeropuertoById = function (airportCode: string): Promise<Place[]> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select p.place_name, pt.des_place_type from place p
            inner join place_type pt on p.id_place_type = pt.id_place_type
            start with p.id_place = (
                select id_place from airport where airport_code = :ac
            ) connect by p.id_place = prior p.id_place_cont
        `, [airportCode]).then(res => res.rows?.map(place => {
            const name = place?.at(0);
            const type = place?.at(1);
            return {
                name,
                type: type?.at(0)?.concat(type.substring(1).toLowerCase())
            }
        }) as Place[])
    );
}