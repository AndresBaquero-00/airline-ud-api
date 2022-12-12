
export interface Response<T = unknown> {
    code: string;
    state: boolean;
    message: string;
    data: T;
}

export interface Data {
    id: string;
    name: string;
}

export interface SegmentInfo {
    aerolinea: string;
    numeroVuelo: string;
    fecha: string;
    piloto: string;
    numSegmentos: string;
    aeropuertos: string[];
}

export interface ConnectionInfo {
    aerolineaOrigen: string;
    aerolineaDestino: string;
    vueloOrigen: string;
    vueloDestino: string;
    aeropuertoOrigen: string;
    aeropuertoDestino: string;
}

export interface Query {
    aeropuertoOrigen: string;
    aeropuertoDestino: string;
    fechaViaje: string;
}

export interface Report {
    airline?: string;
    flight?: string;
    airport?: string;
    city?: Place;
    division?: Place;
    country?: Place;
    date?: string;
    pilot?: string;
}

export interface Place {
    name?: string;
    type?: string;
}

export interface Itinerario {
    type?: 'Trayecto' | 'Conexión';
    reports?: Report[];
}