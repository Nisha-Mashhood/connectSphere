import { RequestData } from "../../../redux/types";

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatDate = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";


export const getRelativeTime = (dateString: string) => {
    const now = new Date().getTime();
    const past = new Date(dateString).getTime();
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    
    return `${Math.floor(diffInMonths / 12)}y ago`;
};

//request Section Utils

export const getReturnUrl = () => {
  return typeof window !== "undefined"
    ? `${window.location.origin}/profile`
    : "https://yourwebsite.com/payment-result";
};

export const getRequestProfile = (request: RequestData, isSent: boolean) => {
  const otherPerson = isSent ? request.mentor?.user : request.user;
  return {
    profileId: isSent ? request.mentorId : otherPerson.id,
    profilePic: otherPerson.profilePic || "/default-avatar.png",
    name: otherPerson.name || "Unknown User",
  };
};
