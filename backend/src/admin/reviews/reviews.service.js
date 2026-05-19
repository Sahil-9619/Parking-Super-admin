import { reviewsRepository } from "./reviews.repository.js";
import { AppError } from "../../utils/AppError.js";

export class ReviewsService {
  async getAllReviews() {
    const reviews = await reviewsRepository.findAllReviews();
    return {
      success: true,
      data: reviews,
      count: reviews.length,
      message: "All reviews retrieved successfully",
    };
  }

  async deleteReview(id) {
    try {
      await reviewsRepository.deleteReview(id);
      return {
        success: true,
        message: "Review deleted successfully by administrator",
      };
    } catch (error) {
      throw new AppError("Review not found or could not be deleted", 404);
    }
  }
}

export const reviewsService = new ReviewsService();
