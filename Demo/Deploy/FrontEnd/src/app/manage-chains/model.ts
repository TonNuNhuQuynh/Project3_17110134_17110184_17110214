export class CinemaChain {
    id: number;
    name: string;
    logo: string;
    noOfMaxSeats: number;
    cinemas: Cinema[];
}
export class Cinema 
{
    id: number;
    name: string;
    description: string;
    address: string;
    location: string;
    cinemaChainId: number;
    cityId: number;
}
export class City {
    id: number;
    name: string;
}
export class CinemaVM {
    id: number;
    name: string;
    address: string;
    logo: string;
    cinemaChainId: number;
}
export class CinemasInCity {
    city: City;
    cinemas: CinemaVM[];
}