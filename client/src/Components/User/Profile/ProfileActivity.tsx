import { FC, lazy, Suspense } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  Spinner,
} from "@nextui-org/react";
import { FaCalendarAlt, FaUserFriends, FaLayerGroup, FaUserGraduate } from "react-icons/fa";
import { Mentor, User } from "../../../redux/types";
import { NavigateFunction } from "react-router-dom";

// Lazy load components
const RequestsSection = lazy(() => import("./RequestSection/RequestSection"));
const GroupRequests = lazy(() => import("./GroupSection/GroupRequest/GroupRequests"));
const ActiveCollaborations = lazy(() => import("./ActiveCollaborations/ActiveCollaborations"));
const GroupCollaborations = lazy(() => import("./GroupSection/GroupCollaborations"));
const TaskManagement = lazy(() => import("../../../Components/User/TaskManagement/TaskManagemnt"));
const UserConnections = lazy(() => import("./UserConnection/UserConnections"));

interface ProfileActivityProps {
  currentUser: User;
  mentorDetails: Mentor;
  navigate: NavigateFunction;
}

const ProfileActivity: FC<ProfileActivityProps> = ({ currentUser, mentorDetails, navigate }) => {
  return (
    <div className="lg:col-span-8 space-y-6">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FaCalendarAlt size={16} />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
          </div>
        </CardHeader>
        <CardBody className="pt-4">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            }
          >
            <TaskManagement
              context="user"
              currentUser={currentUser}
              contextData={currentUser}
            />
          </Suspense>
        </CardBody>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Activity</h2>
        </CardHeader>
        <CardBody className="pt-4">
          <Tabs variant="underlined" color="primary" className="w-full">
            <Tab
              key="connections"
              title={
                <div className="flex items-center gap-2">
                  <FaUserFriends size={14} />
                  <span>Connections</span>
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                <Accordion variant="light" className="px-0">
                  <AccordionItem key="requests" title="Pending Requests">
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-4">
                          <Spinner size="sm" />
                        </div>
                      }
                    >
                      <RequestsSection
                        handleProfileClick={(id: string) =>
                          navigate(`/profileDispaly/${id}`)
                        }
                      />
                    </Suspense>
                  </AccordionItem>
                  <AccordionItem
                    key="collaborations"
                    title="Active Collaborations"
                  >
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-4">
                          <Spinner size="sm" />
                        </div>
                      }
                    >
                      <ActiveCollaborations
                        handleProfileClick={(id: string) =>
                          navigate(`/profileDispaly/${id}`)
                        }
                      />
                    </Suspense>
                  </AccordionItem>
                  <AccordionItem key="network" title="My Network">
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-4">
                          <Spinner size="sm" />
                        </div>
                      }
                    >
                      <UserConnections
                        handleProfileClick={(id: string) =>
                          navigate(`/profileDispaly/${id}`)
                        }
                      />
                    </Suspense>
                  </AccordionItem>
                </Accordion>
              </div>
            </Tab>
            <Tab
              key="groups"
              title={
                <div className="flex items-center gap-2">
                  <FaLayerGroup size={14} />
                  <span>Groups</span>
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                <Accordion variant="light" className="px-0">
                  <AccordionItem
                    key="invitations"
                    title="Group Invitations"
                  >
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-4">
                          <Spinner size="sm" />
                          </div>
                        }
                    >
                      <GroupRequests />
                    </Suspense>
                  </AccordionItem>
                  <AccordionItem key="my-groups" title="My Groups">
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-4">
                          <Spinner size="sm" />
                        </div>
                      }
                    >
                      <GroupCollaborations
                        handleProfileClick={(id: string) =>
                          navigate(`/profileDispaly/${id}`)
                        }
                      />
                    </Suspense>
                  </AccordionItem>
                </Accordion>
              </div>
            </Tab>
            {mentorDetails && (
              <Tab
                key="mentoring"
                title={
                  <div className="flex items-center gap-2">
                    <FaUserGraduate size={14} />
                    <span>Mentoring</span>
                  </div>
                }
              >
                <div className="text-center py-8">
                  <div className="p-4 rounded-lg bg-gray-50 max-w-sm mx-auto">
                    <FaUserGraduate
                      size={24}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-sm text-gray-600">
                      Manage your mentoring activities here.
                    </p>
                  </div>
                </div>
              </Tab>
            )}
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfileActivity;