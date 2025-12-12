import { CollabData, CollabDetails, RequestData } from "../../../../redux/types";

export const parseSelectedSlotLabel = (slotLabel: string): { day: string; time: string } | null => {
  const [dayPart, timePart] = slotLabel.split(" - ");
  if (!dayPart || !timePart) return null;

  return {
    day: dayPart.trim().toLowerCase(),
    time: timePart.trim().toLowerCase(),
  };
};


export const hasUserCollabConflict = (slotLabel: string, collabDetails: CollabDetails | null): boolean => {
  if (!collabDetails || !Array.isArray(collabDetails.data)) return false;

  const parsed = parseSelectedSlotLabel(slotLabel);
  if (!parsed) return false;

  const { day, time } = parsed;

  return collabDetails.data.some((collab) => {

    if ((collab as CollabData).isCancelled || (collab as CollabData).isCompleted) {
      return false;
    }

    if (!Array.isArray(collab.selectedSlot)) return false;

    return collab.selectedSlot.some((slot) => {
      if (!slot.day || !Array.isArray(slot.timeSlots)) return false;

      const slotDay = slot.day.trim().toLowerCase();
      if (slotDay !== day) return false;

      return slot.timeSlots.some(
        (t) => t.trim().toLowerCase() === time
      );
    });
  });
};

export const findSameSlotSentRequests = (
  slotLabel: string,
  sentRequests: RequestData[]
): RequestData[] => {
  const parsed = parseSelectedSlotLabel(slotLabel);
  if (!parsed) return [];

  const { day, time } = parsed;

  return sentRequests.filter((reqItem) => {
    const slot = reqItem.selectedSlot;
    if (!slot || !slot.day || !slot.timeSlots) return false;

    const slotDay = slot.day.trim().toLowerCase();
    const rawTime =
      Array.isArray(slot.timeSlots) ? slot.timeSlots[0] : slot.timeSlots;
    if (!rawTime) return false;
    const slotTime = rawTime.trim().toLowerCase();

    return slotDay === day && slotTime === time;
  });
};