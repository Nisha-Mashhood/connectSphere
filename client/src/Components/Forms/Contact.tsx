import { useForm, SubmitHandler } from "react-hook-form";
import { Input, Textarea, Button } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { sendContactMessage } from "../../Service/ContactUs.Service";

interface ContactFormInputs {
  name: string;
  email: string;
  message: string;
}

const Contact = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    try {
      await sendContactMessage(data);
      toast.success("Message sent successfully!");
      reset();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to send message. Please try again.");
        console.error("Error sending Message:", error.message);
      } else {
        toast.error("An unknown error occurred");
        console.error("Unknown error:", error);
      }
    }
  };

  return (
    <div>
      <div className="grid max-w-screen-xl grid-cols-1 gap-8 px-8 py-16 mx-auto rounded-lg md:grid-cols-2 md:px-12 lg:px-16 xl:px-32 dark:bg-gray-100 dark:text-gray-800">
        <div className="flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold leading-tight lg:text-5xl">
              Let's talk!
            </h2>
            <div className="dark:text-gray-600">
              Share Your feedback and concerns.
            </div>
          </div>
          <img
            src="assets/svg/doodle.svg"
            alt=""
            className="p-6 h-52 md:h-64"
          />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm">
              Full name
            </label>
            <Input
              id="name"
              label="Name"
              type="text"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm">
              Email
            </label>
            <Input
              id="email"
              label="Email"
              type="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
            />
          </div>
          <div>
            <label htmlFor="message" className="text-sm">
              Message
            </label>
            <Textarea
              id="message"
              label="Message"
              placeholder="Enter your message"
              isInvalid={!!errors.message}
              errorMessage={errors.message?.message}
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 10,
                  message: "Message must be at least 10 characters",
                },
              })}
            />
          </div>
          <Button
            type="submit"
            color="secondary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
