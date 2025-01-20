
export const getRequestStatusColor = (isAccepted: String | undefined) => {
    if (isAccepted === "Accepted") return 'bg-green-100 text-green-800';
    if (isAccepted === "Rejected") return 'bg-red-100 text-red-800';
    if (isAccepted === "Pending") return 'bg-blue-100 text-blue-800';
    return 'bg-blue-100 text-blue-800';
};

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
