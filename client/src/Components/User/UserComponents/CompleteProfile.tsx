import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { completeProfileSchema, CompleteProfileFormValues } from "../../../validation/completeProfileValidation";
import { useCompleteProfile } from "../../../Hooks/User/useCompleteProfile";
import TextField from "../../ReusableComponents/TextFiled";
import TextArea from "../../ReusableComponents/TextArea";
import FileInput from "../../ReusableComponents/FileInput";
import Button from "../../ReusableComponents/Button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Resolver } from "react-hook-form";
import { debounce } from "lodash";

const CompleteProfile: React.FC = () => {
  const {
    getUserDetails,
    handleSubmit: handleFormSubmit,
    isLoading,
    isDataLoaded,
    profilePicPreview,
    coverPicPreview,
  } = useCompleteProfile();

  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } =
  useForm<CompleteProfileFormValues>({
   resolver: yupResolver(completeProfileSchema) as unknown as Resolver<CompleteProfileFormValues>,
    mode: "onChange",
  });

  const debouncedLoadUserDetails = debounce(async () => {
    const userDetails = await getUserDetails();

    if (userDetails) {
      Object.entries(userDetails).forEach(([key, value]) => {
        setValue(key as keyof CompleteProfileFormValues, value);
      });
    }
  }, 300); 

  useEffect(() => {
    debouncedLoadUserDetails();

    return () => {
      debouncedLoadUserDetails.cancel();
    };
  }, []); 

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <TextField
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            registration={register("name")}
            error={errors.name}
          />
          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email address"
            registration={register("email")}
            error={errors.email}
          />
          <TextField
            label="Phone"
            type="tel"
            placeholder="Enter your phone number (e.g., 1234567890)"
            registration={register("phone")}
            error={errors.phone}
          />
          <TextField
            label="Date of Birth"
            type="date"
            placeholder=""
            registration={register("dateOfBirth")}
            error={errors.dateOfBirth}
          />
          <TextField
            label="Job Title"
            type="text"
            placeholder="Enter your job title"
            registration={register("jobTitle")}
            error={errors.jobTitle}
          />
          <TextField
            label="Industry"
            type="text"
            placeholder="Enter your industry"
            registration={register("industry")}
            error={errors.industry}
          />
          <TextArea
            label="Reason for Joining"
            placeholder="Why are you joining this platform?"
            registration={register("reasonForJoining")}
            error={errors.reasonForJoining}
          />
          <FileInput
            label="Profile Picture"
            name="profilePic"
            setValue={setValue}
            error={errors.profilePic}
            previewUrl={profilePicPreview}
            previewClassName="mt-4 w-32 h-32 object-cover rounded-full border"
          />
          <FileInput
            label="Cover Picture"
            name="coverPic"
            setValue={setValue}
            error={errors.coverPic}
            previewUrl={coverPicPreview}
            previewClassName="mt-4 w-full h-32 object-cover rounded-lg border"
          />
          <div className="flex justify-between items-center">
            <Button
              type="button"
              label="Skip"
              onClick={() => navigate("/")}
            />
            <Button
              type="submit"
              label={isLoading ? "Saving..." : "Save and Continue"}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;