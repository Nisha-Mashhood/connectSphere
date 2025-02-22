import { useState } from 'react';
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
import { sendFeedBackToMentor } from '../../../../Service/Feedback.service';

const FeedbackModal = ({ isOpen, onClose, collaborationData, onComplete }) => {
  console.log("collaboration Data",collaborationData);
  const [feedback, setFeedback] = useState({
    rating: 0,
    communication: 0,
    expertise: 0,
    punctuality: 0,
    comments: '',
    wouldRecommend: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        rating: feedback.rating,
        communication: feedback.communication,
        expertise: feedback.expertise,
        punctuality: feedback.punctuality,
        comments: feedback.comments,
        wouldRecommend: feedback.wouldRecommend,
        userId: collaborationData.userId,
        mentorId: collaborationData.mentorId?._id, 
        collaborationId: collaborationData?._id, 
      };

      const response = await sendFeedBackToMentor(feedbackData);
      console.log(response);
      if (response) {
      toast.success("Feedback submitted successfully!");
      onComplete(); 
      onClose(); 
    }
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
          <h2 className="text-xl">Mentorship Feedback</h2>
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
                Expertise
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
                Comments (min length 10 character)
              </label>
              <Textarea
                placeholder="Share your experience with this mentor..."
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
                Would you recommend this mentor?
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