import { CustomResponse, GetReviewsData, ReviewDTO } from "@nocturn/types";
import axios from "axios";
import { GET_REVIEW_URL } from "routes/api_routes";


export default class HomeDataActions {

    static async get_reviews(token: string): Promise<ReviewDTO[] | undefined> {
        try {
            const res = await axios.get<CustomResponse<GetReviewsData>>(`${GET_REVIEW_URL}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data.data?.reviews;

        } catch (error) {
            console.error('error while fetching reviews');
            return undefined;
        }
    }

}