// Contact.tsx
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { sendContactMessage } from "../../Service/ContactUs.Service";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ContactFormValues,
  contactSchema,
} from "../../validation/contactValidation";
import TextField from "../ReusableComponents/TextFiled";
import TextArea from "../ReusableComponents/TextArea";
import ButtonComponent from "../ReusableComponents/Button";

const Contact = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    mode: "onChange",
  });

  const messageValue = watch("message"); 

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    try {
      await sendContactMessage(data);
      toast.success("Message sent successfully!");
      reset();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to send message. Please try again."
      );
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <div className="grid max-w-screen-xl grid-cols-1 gap-8 px-8 py-16 mx-auto rounded-lg md:grid-cols-2 md:px-12 lg:px-16 xl:px-32 dark:bg-gray-100 dark:text-gray-800">
        {/* Left: Info */}
        <div className="flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold leading-tight lg:text-5xl">
              Let's talk!
            </h2>
            <div className="dark:text-gray-600">
              Share your feedback and concerns.
            </div>
          </div>
          {/* <img
            alt="Contact illustration"
            className="p-6 h-52 md:h-64"
          /> */}
        </div>

        {/* Right: Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <TextField
            label="Full Name"
            placeholder="John Doe"
            registration={register("name")}
            error={errors.name}
          />

          {/* Email */}
          <TextField
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            registration={register("email")}
            error={errors.email}
          />

          {/* Message */}
          <TextArea
            label="Message"
            description="How can we help you?"
            placeholder="Enter your message..."
            registration={register("message")}
            error={errors.message}
          />
          <p className="text-xs text-gray-500 mt-1">
            {messageValue?.length || 0}/1000
          </p>

          {/* Submit */}
          <ButtonComponent
            label="Send Message"
            type="submit"
            disabled={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
};

export default Contact;