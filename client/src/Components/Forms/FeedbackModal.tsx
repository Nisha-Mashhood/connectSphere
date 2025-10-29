import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { sendFeedBack } from "../../Service/Feedback.service";
import { RootState } from "../../redux/store";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  FeedbackFormValues,
  feedbackSchema,
} from "../../validation/feedbackValidation";
import { CollabData } from "../../redux/types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborationData: CollabData;
  onComplete: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  collaborationData,
  onComplete,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [recipientType, setRecipientType] = useState<"User" | "Mentor">("User");
  const [recipientName, setRecipientName] = useState("User");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FeedbackFormValues>({
    resolver: yupResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      communication: 0,
      expertise: 0,
      punctuality: 0,
      comments: "",
      wouldRecommend: null,
    },
    mode: "onChange",
  });

  const watched = watch();

  useEffect(() => {
    if (collaborationData && currentUser) {
      if (currentUser.role === "mentor") {
        setRecipientType("User");
        setRecipientName(collaborationData.user?.name || "User");
      } else {
        setRecipientType("Mentor");
        setRecipientName(collaborationData.mentor?.user?.name || "Mentor");
      }
    }
  }, [collaborationData, currentUser]);

  const handleStarClick = (field: keyof FeedbackFormValues, value: number) => {
    setValue(field, value, { shouldValidate: true });
    trigger(field);
  };

  const onSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const feedbackData = {
        ...data,
        collaborationId: collaborationData?.id,
        role: currentUser.role,
        userId:
          currentUser.role === "user"
            ? currentUser.id
            : collaborationData.userId,
        mentorId:
          currentUser.role === "mentor"
            ? (currentUser.mentorId || collaborationData.mentorId)
            : collaborationData.mentorId,
      };

      await sendFeedBack(feedbackData);
      toast.success(`Feedback for ${recipientName} submitted!`);
      onComplete();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (
    field: keyof FeedbackFormValues,
    value: number,
    label: string
  ) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => handleStarClick(field, star)}
          />
        ))}
      </div>
      {errors[field] && (
        <span className="text-red-500 text-xs">{errors[field]?.message}</span>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent className="max-h-[90vh]">
        <ModalHeader>
          <h2 className="text-xl">{recipientType} Feedback</h2>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Star Ratings */}
              <div className="space-y-5">
                {renderStars("rating", watched.rating, "Overall Rating")}
                {renderStars("communication", watched.communication, "Communication")}
                {renderStars(
                  "expertise",
                  watched.expertise,
                  recipientType === "Mentor" ? "Expertise" : "Engagement"
                )}
                {renderStars("punctuality", watched.punctuality, "Punctuality")}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Would you recommend this {recipientType.toLowerCase()}?
                  </label>
                  <RadioGroup
                    orientation="horizontal"
                    {...register("wouldRecommend")}
                    onValueChange={(v) =>
                      setValue("wouldRecommend", v === "true", {
                        shouldValidate: true,
                      })
                    }
                    className="mt-1"
                  >
                    <Radio value="true">Yes</Radio>
                    <Radio value="false">No</Radio>
                  </RadioGroup>
                  {errors.wouldRecommend && (
                    <span className="text-red-500 text-xs">
                      {errors.wouldRecommend.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Comments */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Comments (min 10 characters)
                </label>
                <Textarea
                  {...register("comments")}
                  placeholder={`Share your experience with this ${recipientType.toLowerCase()}...`}
                  minRows={12}
                  maxRows={12}
                  className="h-full"
                />
                {errors.comments && (
                  <span className="text-red-500 text-xs block mt-1">
                    {errors.comments.message}
                  </span>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {watched.comments.length}/500 characters
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              Submit Feedback
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;