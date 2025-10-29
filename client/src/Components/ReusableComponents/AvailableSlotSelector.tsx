// AvailableSlotSelector.tsx

import { FC, useState } from "react";
import { Button, Chip, Select, SelectItem } from "@nextui-org/react";
import toast from "react-hot-toast";

export interface Slot {
  day: string;
  timeSlots: string[];
}

export interface AvailableSlotSelectorProps {
  availableSlots: Slot[];
  onSlotsChange: (slots: Slot[]) => void; // Callback to update parent
  error?: string; // Optional error from parent
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

const MAX_DAYS = 3;
const MAX_TIMES_PER_DAY = 1;

const AvailableSlotSelector: FC<AvailableSlotSelectorProps> = ({
  availableSlots: parentSlots,
  onSlotsChange,
  error,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const handleAddSlot = () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }
    if (selectedTimes.length === 0) {
      toast.error("Please select a time");
      return;
    }

    // Max 3 days total
    const currentDays = parentSlots.map(s => s.day);
    const newDays = selectedDays.filter(d => !currentDays.includes(d));
    if (currentDays.length + newDays.length > MAX_DAYS) {
      toast.error(`Maximum ${MAX_DAYS} days allowed`);
      return;
    }

    // Only 1 time per day
    if (selectedTimes.length > MAX_TIMES_PER_DAY) {
      toast.error(`Only ${MAX_TIMES_PER_DAY} time per day allowed`);
      return;
    }

    const newSlots = [...parentSlots];

    selectedDays.forEach(day => {
      const existing = newSlots.find(s => s.day === day);
      if (existing) {
        if (existing.timeSlots.length >= MAX_TIMES_PER_DAY) {
          toast.error(`Only one time slot allowed per day`);
          return;
        }
        existing.timeSlots = selectedTimes;
      } else {
        newSlots.push({ day, timeSlots: selectedTimes });
      }
    });

    // Sort by day order
    newSlots.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));

    onSlotsChange(newSlots);
    setSelectedDays([]);
    setSelectedTimes([]);
  };

  const handleRemoveSlot = (day: string, time: string) => {
    const updated = parentSlots
      .map(slot => {
        if (slot.day === day) {
          const filtered = slot.timeSlots.filter(t => t !== time);
          return filtered.length > 0 ? { ...slot, timeSlots: filtered } : null;
        }
        return slot;
      })
      .filter(Boolean) as Slot[];

    onSlotsChange(updated);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Available Slots
      </label>

      {/* Day Select */}
      <Select
        selectionMode="multiple"
        placeholder={`Select days (max ${MAX_DAYS})`}
        selectedKeys={new Set(selectedDays)}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys) as string[];
          const currentDays = parentSlots.map(s => s.day);
          const valid = selected.filter(d => !currentDays.includes(d));
          if (currentDays.length + valid.length > MAX_DAYS) {
            toast.error(`Max ${MAX_DAYS} days`);
            return;
          }
          setSelectedDays(valid);
        }}
        className="mb-3"
      >
        {days.map(d => (
          <SelectItem key={d} value={d}>
            {d}
          </SelectItem>
        ))}
      </Select>

      {/* Time Select */}
      <Select
        selectionMode="single"
        placeholder="Select time"
        selectedKeys={new Set(selectedTimes)}
        onSelectionChange={(keys) => setSelectedTimes(Array.from(keys) as string[])}
        className="mb-3"
      >
        {timeSlots.map(t => (
          <SelectItem key={t}>{t}</SelectItem>
        ))}
      </Select>

      <Button color="primary" onPress={handleAddSlot} className="w-full">
        Add Slot
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Display Slots */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Selected Slots</h4>
        {parentSlots.length === 0 ? (
          <p className="text-sm text-gray-500">No slots added yet</p>
        ) : (
          <div className="space-y-2">
            {parentSlots.map(slot => (
              <div key={slot.day} className="border rounded p-2">
                <div className="font-medium">{slot.day}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {slot.timeSlots.map(time => (
                    <Chip
                      key={time}
                      onClose={() => handleRemoveSlot(slot.day, time)}
                      color="primary"
                      variant="flat"
                      size="sm"
                    >
                      {time}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableSlotSelector;