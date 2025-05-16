import { useEffect, useState } from 'react';
import { Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Tooltip } from '@nextui-org/react';
import { get_all_reviews, approve_review, select_review, cancel_approval, deselect_review } from '../../Service/Review.Service';
import toast from 'react-hot-toast';
import { FaCheck, FaStar, FaTimes } from 'react-icons/fa';
import { BsStar } from 'react-icons/bs';

interface Review {
  reviewId: string;
  userId: { username: string; email: string };
  rating: number;
  comment: string;
  isApproved: boolean;
  isSelect: boolean;
  createdAt: string;
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await get_all_reviews();
      setReviews(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await approve_review(reviewId);
      if (response?.success) {
        setReviews(reviews.map(review =>
          review.reviewId === reviewId ? { ...review, isApproved: true } : review
        ));
        toast.success('Review approved');
      }
    } catch (error) {
      console.error('Failed to approve review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleSelect = async (reviewId: string) => {
    try {
      const response = await select_review(reviewId);
      if (response?.success) {
        setReviews(reviews.map(review =>
          review.reviewId === reviewId ? { ...review, isSelect: true } : review
        ));
        toast.success('Review selected for display');
      }
    } catch (error) {
      console.error('Failed to select review:', error);
      toast.error('Failed to select review');
    }
  };

  const handleCancelApproval = async (reviewId: string) => {
    try {
      const response = await cancel_approval(reviewId);
      if (response?.success) {
        setReviews(reviews.map(review =>
          review.reviewId === reviewId ? { ...review, isApproved: false, isSelect: false } : review
        ));
        toast.success('Review approval canceled');
      }
    } catch (error) {
      console.error('Failed to cancel approval:', error);
      toast.error('Failed to cancel approval');
    }
  };

  const handleDeselect = async (reviewId: string) => {
    try {
      const response = await deselect_review(reviewId);
      if (response?.success) {
        setReviews(reviews.map(review =>
          review.reviewId === reviewId ? { ...review, isSelect: false } : review
        ));
        toast.success('Review deselected');
      }
    } catch (error) {
      console.error('Failed to deselect review:', error);
      toast.error('Failed to deselect review');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Review Management</h2>
      <Tabs aria-label="Review Tabs" color="primary" variant="bordered">
        <Tab key="app-reviews" title="App Reviews">
          <div className="mt-4">
            {loading ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p>No reviews available.</p>
            ) : (
              <Table aria-label="App Reviews Table">
                <TableHeader>
                  <TableColumn>User</TableColumn>
                  <TableColumn>Rating</TableColumn>
                  <TableColumn>Comment</TableColumn>
                  <TableColumn>Approved</TableColumn>
                  <TableColumn>Selected</TableColumn>
                  <TableColumn>Created At</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {reviews.map(review => (
                    <TableRow key={review.reviewId}>
                      <TableCell>
                        {review.userId.username} ({review.userId.email})
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <FaStar key={i} className="text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{review.comment}</TableCell>
                      <TableCell>{review.isApproved ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{review.isSelect ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!review.isApproved && (
                            <Tooltip content="Approve Review">
                              <Button
                                isIconOnly
                                color="success"
                                onPress={() => handleApprove(review.reviewId)}
                              >
                                <FaCheck />
                              </Button>
                            </Tooltip>
                          )}
                          {review.isApproved && (
                            <Tooltip content="Cancel Approval">
                              <Button
                                isIconOnly
                                color="danger"
                                onPress={() => handleCancelApproval(review.reviewId)}
                              >
                                <FaTimes />
                              </Button>
                            </Tooltip>
                          )}
                          {review.isApproved && !review.isSelect && (
                            <Tooltip content="Select for Frontend Display">
                              <Button
                                isIconOnly
                                color="primary"
                                onPress={() => handleSelect(review.reviewId)}
                              >
                                <FaStar />
                              </Button>
                            </Tooltip>
                          )}
                          {review.isSelect && (
                            <Tooltip content="Deselect Review">
                              <Button
                                isIconOnly
                                color="warning"
                                onPress={() => handleDeselect(review.reviewId)}
                              >
                                <BsStar />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Tab>
        <Tab key="user-reviews" title="User Reviews">
          <div className="mt-4">
            <p>User Reviews management will be implemented later.</p>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ReviewManagement;