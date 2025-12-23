import { Card, CardBody, CardHeader, Button } from "@nextui-org/react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const DashboardLists = ({
  pendingMentors,
  topMentors,
  recentCollaborations,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pending Mentors */}
      <Card>
        <CardHeader className="flex justify-between">
          <h4 className="text-lg font-semibold">Pending Mentor Requests</h4>
          <Button
            size="sm"
            variant="light"
            endContent={<FaArrowRight />}
            onPress={() => navigate("/admin/mentormange")}
          >
            View All
          </Button>
        </CardHeader>

        <CardBody>
          {pendingMentors.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {pendingMentors.map((mentor, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mentor.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {mentor.email}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      color="primary"
                      onPress={() => navigate("/admin/mentormange")}
                    >
                      Review
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No pending requests</p>
          )}
        </CardBody>
      </Card>

      {/* Top Mentors */}
      <Card>
        <CardHeader className="flex justify-between">
          <h4 className="text-lg font-semibold">Top Mentors</h4>
          <Button
            size="sm"
            variant="light"
            endContent={<FaArrowRight />}
            onPress={() => navigate("/admin/mentor-analytics")}
          >
            View All
          </Button>
        </CardHeader>

        <CardBody>
          {topMentors.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {topMentors.map((mentor, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mentor.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Sessions: {mentor.sessionCount} | Rating: {mentor.rating}/5
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      color="primary"
                      variant="light"
                      onPress={() => navigate(`/admin/users/${mentor.userId}`)}
                    >
                      View
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No mentors found</p>
          )}
        </CardBody>
      </Card>

      {/* Recent Collaborations */}
      <Card>
        <CardHeader className="flex justify-between">
          <h4 className="text-lg font-semibold">Recent Collaborations</h4>
          <Button
            size="sm"
            variant="light"
            endContent={<FaArrowRight />}
            onPress={() => navigate("/admin/userMentorManagemnt")}
          >
            View All
          </Button>
        </CardHeader>

        <CardBody>
          {recentCollaborations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentCollaborations.map((collab, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {collab.mentorName} & {collab.userName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {collab.skill || "General Mentoring"}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Started:{" "}
                        {new Date(collab.startDate).toLocaleDateString()}
                      </p>
                      <Button
                        size="sm"
                        color="primary"
                        variant="light"
                        onPress={() =>
                          navigate(`/admin/collaboration/${collab.collabId}`)
                        }
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No recent collaborations
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
