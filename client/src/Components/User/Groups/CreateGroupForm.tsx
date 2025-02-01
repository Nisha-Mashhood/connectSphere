import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import toast from 'react-hot-toast';
import { createGroup } from '../../../Service/Group.Service';

interface TimeSlot {
  day: string;
  timeSlots: string[];
}

interface GroupFormData {
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  availableSlots: TimeSlot[];
  profilePic: string;
  coverPic: string;
}

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    bio: '',
    price: 0,
    maxMembers: 10,
    availableSlots: [],
    profilePic: '',
    coverPic: ''
  });

  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const handleAddSlot = () => {
    if (!selectedDay || !selectedTime) {
      toast.error('Please select both day and time');
      return;
    }

    setFormData(prev => {
      const existingDaySlot = prev.availableSlots.find(slot => slot.day === selectedDay);
      
      if (existingDaySlot) {
        if (!existingDaySlot.timeSlots.includes(selectedTime)) {
          return {
            ...prev,
            availableSlots: prev.availableSlots.map(slot =>
              slot.day === selectedDay
                ? { ...slot, timeSlots: [...slot.timeSlots, selectedTime].sort() }
                : slot
            )
          };
        }
        toast.error('This time slot already exists for the selected day');
        return prev;
      }

      return {
        ...prev,
        availableSlots: [
          ...prev.availableSlots,
          { day: selectedDay, timeSlots: [selectedTime] }
        ].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day))
      };
    });

    setSelectedTime('');
  };

  
  const handleRemoveSlot = (day: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      availableSlots: prev.availableSlots
        .map(slot => {
          if (slot.day === day) {
            const newTimeSlots = slot.timeSlots.filter(t => t !== time);
            return newTimeSlots.length ? { ...slot, timeSlots: newTimeSlots } : null;
          }
          return slot;
        })
        .filter((slot): slot is TimeSlot => slot !== null)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.availableSlots.length) {
      toast.error('Please add at least one time slot');
      return;
    }
    const membersData = [
      {
        userId: currentUser._id, 
        joinedAt: new Date(),     
      },
    ];
    try {
      const response = await createGroup({
        ...formData,
        adminId: currentUser._id,
        createdAt: new Date(),
        members:  membersData,
      });

      console.log(response);

      toast.success('Group created successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to create group');
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Create New Group</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Group Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (optional)
              </label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Members
              </label>
              <input
                type="number"
                required
                min="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.maxMembers}
                onChange={e => setFormData(prev => ({ ...prev, maxMembers: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Add Available Time Slots
              </label>
              <div className="mt-2 space-y-3">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value)}
                >
                  <option value="">Select Day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>

                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                >
                  <option value="">Select Time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Slot
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Time Slots
              </h4>
              <div className="space-y-2">
                {formData.availableSlots.map(slot => (
                  <div key={slot.day} className="border rounded-md p-3">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{slot.day}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {slot.timeSlots.map(time => (
                        <span
                          key={`${slot.day}-${time}`}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                        >
                          {time}
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot.day, time)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;