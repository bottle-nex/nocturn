// DTO = Data Transfer Type
export interface ReviewDTO {
  user: {
    name: string;
    image: string | null;
  };
  comment: string;
  createdAt: string | Date;
}

export interface GetReviewsResponse {
  reviews: ReviewDTO[];
}
