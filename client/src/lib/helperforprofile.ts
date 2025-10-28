
export const getRequestStatusColor = (isAccepted: string | undefined) => {
    if (isAccepted === "Accepted") return 'bg-green-100 text-green-800';
    if (isAccepted === "Rejected") return 'bg-red-100 text-red-800';
    if (isAccepted === "Pending") return 'bg-blue-100 text-blue-800';
    return 'bg-blue-100 text-blue-800';
};


  // Function to calculate time left
  export const calculateTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  