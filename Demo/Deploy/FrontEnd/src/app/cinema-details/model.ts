import { ShowtimeFormatVM } from "app/movie-details/showtimes/model";
import { Movie } from "app/shared/movie-modal/model";

export class ShowtimesInMovie
{
    movie: Movie;
    showtimeFormats: ShowtimeFormatVM[];
}
export class CinemaVM {
    id: number;
    name: string;
    address: string;
    logo: string;
    description: string;
    cityId: number;
    cinemaChainName: string;
    cinemaChainId: number;
}