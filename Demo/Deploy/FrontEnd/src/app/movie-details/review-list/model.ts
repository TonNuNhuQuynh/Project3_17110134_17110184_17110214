export class ListReview 
{
    reviews: Review[]
    total: number;
    title: string;
    releaseDate: Date;
    percent: number;
    // average: number;
    likes: number;
}
export class Review 
{
    id: number;
    content: string;
    ratings: number;
    spoilers: boolean;
    createdDate: Date;
    movieId: number;
    likeCounts: number;
    dislikeCounts: number;
    username: string;
    image: string;
}