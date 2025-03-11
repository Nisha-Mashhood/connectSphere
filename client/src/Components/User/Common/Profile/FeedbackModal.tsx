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
import { sendFeedBack } from '../../../../Service/Feedback.service';
import { RootState } from '../../../../redux/store';

const FeedbackModal = ({ isOpen, onClose, collaborationData, onComplete }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [feedback, setFeedback] = useState({
    rating: 0,
    communication: 0,
    expertise: 0,
    punctuality: 0,
    comments: '',
    wouldRecommend: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientType, setRecipientType] = useState('');
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    // Determine if current user is the mentor or the user in this collaboration
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

  const handleRatingChange = (category, value) => {
    setFeedback(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const renderStars = (category, value) => {
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
            onClick={() => handleRatingChange(category, star)}
          />
        ))}
      </div>
    );
  };
  console.log("Collaboration Data :", collaborationData);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validation
      if (!feedback.rating || !feedback.communication || 
          !feedback.expertise || !feedback.punctuality || 
          !feedback.comments || feedback.wouldRecommend === null) {
        toast.error('Please complete all fields');
        return;
      }

      const feedbackData = {
        // Common feedback data
        rating: feedback.rating,
        communication: feedback.communication,
        expertise: feedback.expertise,
        punctuality: feedback.punctuality,
        comments: feedback.comments,
        wouldRecommend: feedback.wouldRecommend,
        collaborationId: collaborationData?._id,
        
        // Role-specific data
        role: currentUser.role,
        userId: currentUser.role === 'user' ? currentUser._id : collaborationData.userId?._id,
        mentorId: currentUser.role === 'mentor' ? 
          (currentUser.mentorId || collaborationData.mentorId?._id) : 
          collaborationData.mentorId?._id
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
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl">{recipientType} Feedback</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Overall Rating
              </label>
              {renderStars('rating', feedback.rating)}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Communication
              </label>
              {renderStars('communication', feedback.communication)}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {recipientType === 'Mentor' ? 'Expertise' : 'Engagement'}
              </label>
              {renderStars('expertise', feedback.expertise)}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Punctuality
              </label>
              {renderStars('punctuality', feedback.punctuality)}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Comments (min length 10 characters)
              </label>
              <Textarea
                placeholder={`Share your experience with this ${recipientType.toLowerCase()}...`}
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({
                  ...prev,
                  comments: e.target.value
                }))}
                minRows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Would you recommend this {recipientType.toLowerCase()}?
              </label>
              <RadioGroup
                orientation="horizontal"
                value={feedback.wouldRecommend?.toString()}
                onValueChange={(value) => setFeedback(prev => ({
                  ...prev,
                  wouldRecommend: value === 'true'
                }))}
              >
                <Radio value="true">Yes</Radio>
                <Radio value="false">No</Radio>
              </RadioGroup>
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