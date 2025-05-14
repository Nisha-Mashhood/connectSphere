import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { closeReviewModal } from '../../redux/Slice/reviewSlice';
import { skip_review, submit_review } from '../../Service/Review.Service';
import { RootState } from '../../redux/store';

interface ReviewModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [rating, setRating] = useState<number>(0);

  const formik = useFormik({
    initialValues: { comments: '' },
    validationSchema: Yup.object({
      comments: Yup.string().required('Comments are required when submitting a review'),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (rating === 0) {
        formik.setFieldError('comments', 'Please select a star rating');
        return;
      }
      try {
        const isSubmitted = await submit_review(currentUser._id, rating, values.comments);
        if(isSubmitted){
          toast.success('Thank you for your review!');
          resetForm();
          setRating(0);
          dispatch(closeReviewModal());
          onClose();
        }
      } catch (error) {
        console.error('Review submission failed:', error);
        toast.error('Failed to submit review. Try again.');
      }
    },
  });

  const handleSkip = async () => {
    try {
      const isSkipped = await skip_review(currentUser._id);
      if(isSkipped){
        toast.success('Review skipped.');
      }
      dispatch(closeReviewModal());
      onClose();
    } catch (error) {
      console.error('Skip review failed:', error);
      toast.error('Failed to skip review. Try again.');
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
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formik.values.comments}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                rows={4}
              />
              {formik.touched.comments && formik.errors.comments && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.comments}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Skip
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;