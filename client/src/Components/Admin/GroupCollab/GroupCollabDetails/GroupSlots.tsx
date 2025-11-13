import { Slot } from "../../../ReusableComponents/AvailableSlotSelector";

const GroupSlots = ({ slots }: { slots: Slot[] }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-800 mb-4">Available Time Slots</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {slots.map((slot, i) => (
        <div key={i} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">{slot.day}</h4>
          <div className="mt-2">
            {slot.timeSlots.map((t: string, j: number) => (
              <div key={j} className="text-sm bg-white border border-gray-200 px-3 py-1 rounded">
                {t}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default GroupSlots;
