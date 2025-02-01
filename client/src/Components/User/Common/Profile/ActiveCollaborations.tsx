import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { calculateTimeLeft } from "../../../../lib/helperforprofile";
import { FaClock } from "react-icons/fa";

const ActiveCollaborations = (handleProfileClick) => {
    const { currentUser } = useSelector((state: RootState) => state.user);
    const { collabDetails } = useSelector((state: RootState) => state.profile);
  
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Active Collaborations
        </h2>
        <div className="space-y-4">
        {collabDetails?.data?.map((collab: any) => (
                  <div
                    key={collab._id}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Profile Picture */}
                      <img
                        src={
                          currentUser.role === "user"
                            ? collab.mentorId?.userId?.profilePic
                            : collab.userId?.profilePic
                        }
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      {/* Collab Details */}
                      <div className="flex-1">
                        {/* Name */}
                        <p
                          className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
                          onClick={() =>
                            currentUser.role === "user"
                              ? handleProfileClick(collab.mentorId?._id)
                              : handleProfileClick(collab.userId?._id)
                          }
                        >
                          {currentUser.role === "user"
                            ? collab.mentorId?.name
                            : collab.userId?.name}
                        </p>

                        {/* Time Slots */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <span>{collab.selectedSlot[0].day}</span>
                          <span>•</span>
                          <span>
                            {collab.selectedSlot[0].timeSlots.join(", ")}
                          </span>
                        </div>

                        {/* Time Left & Price */}
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center text-blue-600 dark:text-blue-400">
                            <FaClock className="mr-1" />
                            <span>{calculateTimeLeft(collab.endDate)}</span>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">
                            ₹{collab.price}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center">
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {collab.isCancelled ? "Cancelled" : "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              ((new Date().getTime() -
                                new Date(collab.startDate).getTime()) /
                                (new Date(collab.endDate).getTime() -
                                  new Date(collab.startDate).getTime())) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
  
          {(!collabDetails?.data || collabDetails.data.length === 0) && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No active collaborations found
            </p>
          )}
        </div>
      </div>
    );
}

export default ActiveCollaborations