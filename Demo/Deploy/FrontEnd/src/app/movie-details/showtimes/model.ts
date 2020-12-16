export class ShowDate 
{
    date: Date;
    dayOfWeek: string;
}
export class CinemaChainVM 
{
    id: number;
    name: string;
    logo: string;
    noOfMaxSeats: number;
    cinemas: CinemaVM[];
}
export class CinemaVM 
{
    id: number;
    name: string;
    address: string;
    showtimeFormats: ShowtimeFormatVM[];
}
export class ShowtimeFormatVM
{
    name: string;
    showtimes: ShowtimeVM[]
}
export class ShowtimeVM
{
    id: number;
    startDate: Date;
    info: string;
}
