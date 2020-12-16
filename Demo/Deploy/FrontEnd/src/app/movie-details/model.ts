import { Movie } from "app/shared/movie-modal/model";

export class MovieDetails {
    movie: Movie;
    ratings: number;
    genres: string;
    directors: string[];
    producers: string[];
}