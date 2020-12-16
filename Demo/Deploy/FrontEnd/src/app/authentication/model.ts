export class ActivityStorage 
{
    rateIds: number[];
    movieLikeIds: number[];
    reviewLikes: ReviewLike[];
}
export class ReviewLike 
{
    accountId: number;
    reviewId: number;
    liked: boolean;
    disLiked: boolean;
}