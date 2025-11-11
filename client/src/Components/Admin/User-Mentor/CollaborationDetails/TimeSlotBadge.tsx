import { Slot } from "../../../../validation/createGroupValidation";

type Props = {
  slot: Slot | Slot[] | null;
};

export const TimeSlotBadge = ({ slot }: Props) => {
  if (Array.isArray(slot)) {
    return slot.length ? (
      <>
        {slot.map((s, i) => (
          <div
            key={i}
            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 mr-2"
          >
            {s.day} at {Array.isArray(s.timeSlots) ? s.timeSlots.join(", ") : s.timeSlots}
          </div>
        ))}
      </>
    ) : (
      <span>No slot selected</span>
    );
  }
  return slot ? (
    <div className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
      {slot.day} at {Array.isArray(slot.timeSlots) ? slot.timeSlots.join(", ") : slot.timeSlots}
    </div>
  ) : (
    <span>No slot selected</span>
  );
};