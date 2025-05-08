export const convertTo24HourFormat = (time12h: string): { hours: number; minutes: number } | null => {
    const match = time12h.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) {
      console.log(`[DEBUG] Invalid time format: ${time12h}`);
      return null;
    }

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  };

  export const formatTimeDifference = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs >= 24) {
      return `${Math.floor(diffHrs / 24)} days ago`;
    } else if (diffHrs > 0) {
      return `${diffHrs} hr${diffHrs > 1 ? "s" : ""} ago`;
    } else {
      return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    }
  };