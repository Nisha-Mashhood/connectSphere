import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  RadioGroup,
  Radio
} from "@nextui-org/react";
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { sendFeedBack } from '../../Service/Feedback.service';
import { RootState } from '../../redux/store';

interface IFeedbackData {
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean | null;
}

interface IFeedbackErrors {
  rating?: string;
  communication?: string;
  expertise?: string;
  punctuality?: string;
  comments?: string;
  wouldRecommend?: string;
}

const FeedbackModal = ({ isOpen, onClose, collaborationData, onComplete }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [feedback, setFeedback] = useState<IFeedbackData>({
    rating: 0,
    communication: 0,
    expertise: 0,
    punctuality: 0,
    comments: '',
    wouldRecommend: null,
  });
  const [errors, setErrors] = useState<IFeedbackErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientType, setRecipientType] = useState('');
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    if (collaborationData) {
      if (currentUser.role === 'mentor') {
        setRecipientType('User');
        setRecipientName(collaborationData.userId?.name || 'User');
      } else {
        setRecipientType('Mentor');
        setRecipientName(collaborationData.mentorId?.userId?.name || 'Mentor');
      }
    }
  }, [collaborationData, currentUser]);

  const validateForm = (): IFeedbackErrors => {
    const newErrors: IFeedbackErrors = {};

    if (!feedback.rating) {
      newErrors.rating = "Overall rating is required";
    } else if (feedback.rating < 1 || feedback.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }

    if (!feedback.communication) {
      newErrors.communication = "Communication rating is required";
    } else if (feedback.communication < 1 || feedback.communication > 5) {
      newErrors.communication = "Communication rating must be between 1 and 5";
    }

    if (!feedback.expertise) {
      newErrors.expertise = `${recipientType === 'Mentor' ? 'Expertise' : 'Engagement'} rating is required`;
    } else if (feedback.expertise < 1 || feedback.expertise > 5) {
      newErrors.expertise = `${recipientType === 'Mentor' ? 'Expertise' : 'Engagement'} rating must be between 1 and 5`;
    }

    if (!feedback.punctuality) {
      newErrors.punctuality = "Punctuality rating is required";
    } else if (feedback.punctuality < 1 || feedback.punctuality > 5) {
      newErrors.punctuality = "Punctuality rating must be between 1 and 5";
    }

    if (!feedback.comments.trim()) {
      newErrors.comments = "Comments are required";
    } else if (feedback.comments.length < 10) {
      newErrors.comments = "Comments must be at least 10 characters long";
    } else if (feedback.comments.length > 500) {
      newErrors.comments = "Comments cannot exceed 500 characters";
    }

    if (feedback.wouldRecommend === null) {
      newErrors.wouldRecommend = "Please indicate if you would recommend this " + recipientType.toLowerCase();
    }

    return newErrors;
  };

  const handleInputChange = <K extends keyof IFeedbackData>(field: K, value: IFeedbackData[K]) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
    const newErrors = validateForm();
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  const renderStars = (category: keyof IFeedbackData, value: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-6 h-6 cursor-pointer ${
              star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => handleInputChange(category, star)}
          />
        ))}
      </div>
    );
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);

      const feedbackData = {
        rating: feedback.rating,
        communication: feedback.communication,
        expertise: feedback.expertise,
        punctuality: feedback.punctuality,
        comments: feedback.comments,
        wouldRecommend: feedback.wouldRecommend,
        collaborationId: collaborationData?._id,
        role: currentUser.role,
        userId: currentUser.role === 'user' ? currentUser._id : collaborationData.userId?._id,
        mentorId: currentUser.role === 'mentor' 
          ? (currentUser.mentorId || collaborationData.mentorId?._id) 
          : collaborationData.mentorId?._id,
      };

      const response = await sendFeedBack(feedbackData);

      if (response) {
        toast.success(`Feedback for ${recipientName} submitted successfully!`);
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent className="max-h-[90vh]">
        <ModalHeader>
          <h2 className="text-xl">{recipientType} Feedback</h2>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Star Ratings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Overall Rating</label>
                {renderStars('rating', feedback.rating)}
                {errors.rating && <span className="text-red-500 text-xs">{errors.rating}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Communication</label>
                {renderStars('communication', feedback.communication)}
                {errors.communication && <span className="text-red-500 text-xs">{errors.communication}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {recipientType === 'Mentor' ? 'Expertise' : 'Engagement'}
                </label>
                {renderStars('expertise', feedback.expertise)}
                {errors.expertise && <span className="text-red-500 text-xs">{errors.expertise}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Punctuality</label>
                {renderStars('punctuality', feedback.punctuality)}
                {errors.punctuality && <span className="text-red-500 text-xs">{errors.punctuality}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Would you recommend this {recipientType.toLowerCase()}?
                </label>
                <RadioGroup
                  orientation="horizontal"
                  value={feedback.wouldRecommend?.toString()}
                  onValueChange={(value) => handleInputChange('wouldRecommend', value === 'true')}
                  className="mt-1"
                >
                  <Radio value="true">Yes</Radio>
                  <Radio value="false">No</Radio>
                </RadioGroup>
                {errors.wouldRecommend && <span className="text-red-500 text-xs">{errors.wouldRecommend}</span>}
              </div>
            </div>

            {/* Right Column - Comments */}
            <div>
              <label className="block text-sm font-medium mb-1">Comments (min length 10 characters)</label>
              <Textarea
                placeholder={`Share your experience with this ${recipientType.toLowerCase()}...`}
                value={feedback.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                minRows={12}
                maxRows={12}
                className="h-full"
              />
              {errors.comments && <span className="text-red-500 text-xs mt-1 block">{errors.comments}</span>}
              <div className="text-xs text-gray-500 mt-1">
                {feedback.comments.length}/500 characters
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;