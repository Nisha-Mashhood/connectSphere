import { useEffect, useState } from 'react';
import { get_selected_reviews } from '../../../Service/Review.Service';
import toast from 'react-hot-toast';

interface User {
  username: string;
  email: string;
  profilePic?: string;
  jobTitle?: string;
  role: 'user' | 'mentor' | 'admin';
}

interface Review {
  reviewId: string;
  userId: User;
  rating: number;
  comment: string;
  isApproved: boolean;
  isSelect: boolean;
  createdAt: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await get_selected_reviews();
        setReviews(response?.data || []);
      } catch (error) {
        console.error('Failed to fetch selected reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          className={`size-5 ${index < rating ? 'text-green-500' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ));
  };

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2 className="text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Read trusted reviews from our customers
          </h2>

          {loading ? (
            <p className="text-center text-gray-600 mt-8">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-600 mt-8">No reviews yet</p>
          ) : (
            <div className="mt-8 [column-fill:_balance] sm:columns-2 sm:gap-6 lg:columns-3 lg:gap-8">
              {reviews.map((review) => (
                <div key={review.reviewId} className="mb-8 sm:break-inside-avoid">
                  <blockquote className="rounded-lg bg-gray-50 p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-4">
                      <img
                        alt={review.userId.username}
                        src={
                          review.userId.profilePic ||
                          'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80'
                        }
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex justify-center gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                        <p className="mt-0.5 text-lg font-medium text-gray-900">
                          {review.userId.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {review.userId.jobTitle || 'Not specified'} |{' '}
                          {review.userId.role === 'mentor' ? 'Mentor' : 'User'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700">{review.comment}</p>
                  </blockquote>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reviews;