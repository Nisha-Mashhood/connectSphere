import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { closeReviewModal } from "../../redux/Slice/reviewSlice";
import { skip_review, submit_review } from "../../Service/Review.Service";
import { RootState } from "../../redux/store";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ReviewFormValues,
  reviewSchema,
} from "../../validation/reviewValidation";

interface ReviewModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<ReviewFormValues>({
    resolver: yupResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comments: "",
    },
    mode: "onChange",
  });

  const rating = watch("rating");

  const handleStarClick = (value: number) => {
    setValue("rating", value, { shouldValidate: true });
    trigger("rating");
  };

  const onSubmit: SubmitHandler<ReviewFormValues> = async (data) => {
    try {
      const success = await submit_review(currentUser.id, data.rating, data.comments);
      if (success) {
        toast.success("Thank you for your review!");
        dispatch(closeReviewModal());
        onClose();
      }
    } catch (error) {
      console.error("Review submission failed:", error);
      toast.error("Failed to submit review. Try again.");
    }
  };

  const handleSkip = async () => {
    try {
      const success = await skip_review(currentUser.id);
      if (success) {
        toast.success("Review skipped.");
        dispatch(closeReviewModal());
        onClose();
      }
    } catch (error) {
      console.error("Skip review failed:", error);
      toast.error("Failed to skip review. Try again.");
    }
  };

  const handleClose = () => {
    dispatch(closeReviewModal());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Rate Your Experience</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center mb-6 space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              className={`text-3xl transition-colors ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              } hover:text-yellow-500`}
            >
              ★
            </button>
          ))}
        </div>

        {errors.rating && (
          <p className="text-red-500 text-sm text-center mb-3">
            {errors.rating.message}
          </p>
        )}

        {/* Show form only if rating is selected */}
        {rating > 0 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="comments"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Comments <span className="text-gray-500">(min 10 chars)</span>
              </label>
              <textarea
                id="comments"
                {...register("comments")}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.comments && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.comments.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {watch("comments").length}/500
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;