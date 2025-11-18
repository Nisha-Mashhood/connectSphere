import { FaBell, FaCalendar } from "react-icons/fa";

export default function TaskViewSchedule({ task, formatDate }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl space-y-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
        <FaCalendar className="text-blue-600" /> Schedule
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="bg-white rounded-xl p-3 flex gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <FaCalendar className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Start Date</p>
            <p className="font-semibold">{formatDate(task.startDate)}</p>
          </div>
        </div>

        {/* Due Date */}
        <div className="bg-white rounded-xl p-3 flex gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <FaCalendar className="text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Due Date</p>
            <p className="font-semibold">{formatDate(task.dueDate)}</p>
          </div>
        </div>
      </div>

      {task.notificationDate && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl flex gap-3 border-2 border-amber-200">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <FaBell className="text-amber-600" />
          </div>

          <div>
            <p className="text-xs text-amber-700 uppercase">Notification</p>
            <p className="font-semibold">
              {formatDate(task.notificationDate)} at {task.notificationTime}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
