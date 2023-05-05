import { Connection } from "../config";
import { Data } from "../interfaces";

export const obtenerPilotos = function (): Promise<Data[]> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select p.pilot_license, pe.name_person from pilot p
            inner join employee e on p.employee_number = e.employee_number
            inner join person pe on e.id_person = pe.id_person
        `).then(res => {
            console.log(res);
            return res.rows?.map((row) => {
                console.log(row);
                return ({
                    id: row.at(0),
                    name: row.at(1)
                });
            }) as Data[];
        })
    );
}

export const obtenerNombrePilotoById = function (pilotLicense: string): Promise<string> {
    const cursor = Connection.getConnection().getCursor();
    return (
        cursor.execute<string[]>(`
            select pe.name_person from pilot p
            inner join employee e on p.employee_number = e.employee_number
            inner join person pe on e.id_person = pe.id_person
            where p.pilot_license = :pl
        `, [pilotLicense]).then(res => `${res.rows?.at(0)?.at(0)}`)
    );
}

export const obtenerNombrePilotoByFlightSegment = async function (flightSegment: number): Promise<string> {
    const cursor = Connection.getConnection().getCursor();
    const pilotLicense = await cursor.execute<string[]>(`
        select pilot_license from pilot_assignment where consec_fs = :cfs
    `, [flightSegment]);

    return obtenerNombrePilotoById(`${pilotLicense.rows?.at(0)?.at(0)}`);
}