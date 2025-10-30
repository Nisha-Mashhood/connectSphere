import { Tabs, Tab, Card, CardBody, Spinner } from "@nextui-org/react";
import { lazy, Suspense, Key } from "react";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaBell,
  FaInfoCircle,
  FaCog,
} from "react-icons/fa";
import { Group, GroupRequests as GroupReq, User } from "../../../../../redux/types";
import { MembersTab } from "./tabs/MembersTab";
import { RequestsTab } from "./tabs/RequestsTab";
import { InfoTab } from "./tabs/InfoTab";
import { SettingsTab } from "./tabs/SettingsTab";


const TaskManagement = lazy(() => import("../../../TaskManagement/TaskManagemnt"));

type Props = {
  group: Group;
  groupRequests: GroupReq[];
  currentUser: User;
  isAdmin: boolean;
  pendingCount: number;
  selectedTab: string;
  onTabChange: (key: Key) => void;
  onRequestUpdate: (id: string, status: "Accepted" | "Rejected") => void;
  onRemoveUser: (userId: string) => void;
  onDeleteGroup: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => void;
  isProcessing: Record<string, boolean>;
};

export const GroupTabs = ({
  group,
  groupRequests,
  currentUser,
  isAdmin,
  pendingCount,
  selectedTab,
  onTabChange,
  onRequestUpdate,
  onRemoveUser,
  onDeleteGroup,
  onPhotoUpload,
  isProcessing,
}: Props) => {
  return (
    <Card className="w-full shadow-md">
      <CardBody className="p-0">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={onTabChange}
          color="primary"
          variant="underlined"
          fullWidth
          classNames={{ tabList: "px-6 pt-3", panel: "p-0", tab: "py-3" }}
        >
          <Tab
            key="tasks"
            title={
              <div className="flex items-center gap-2">
                <FaCalendarAlt /> <span>Tasks</span>
              </div>
            }
          >
            <div className="p-6">
              <Suspense fallback={<Spinner size="lg" label="Loading Tasks..." />}>
                <TaskManagement context="group" currentUser={currentUser} contextData={group} />
              </Suspense>
            </div>
          </Tab>

          <Tab
            key="members"
            title={
              <div className="flex items-center gap-2">
                <FaUserFriends /> <span>Members</span>
              </div>
            }
          >
            <MembersTab group={group} isAdmin={isAdmin} onRemoveUser={onRemoveUser} />
          </Tab>

          {isAdmin && (
            <Tab
              key="requests"
              title={
                <div className="flex items-center gap-2">
                  <FaBell /> <span>Requests</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 bg-danger text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </div>
              }
            >
              <RequestsTab
                requests={groupRequests}
                group={group}
                onUpdate={onRequestUpdate}
                isProcessing={isProcessing}
              />
            </Tab>
          )}

          <Tab
            key="info"
            title={
              <div className="flex items-center gap-2">
                <FaInfoCircle /> <span>About</span>
              </div>
            }
          >
            <InfoTab group={group} />
          </Tab>

          {isAdmin && (
            <Tab
              key="settings"
              title={
                <div className="flex items-center gap-2">
                  <FaCog /> <span>Settings</span>
                </div>
              }
            >
              <SettingsTab
                onDelete={onDeleteGroup}
                onPhotoUpload={onPhotoUpload}
              />
            </Tab>
          )}
        </Tabs>
      </CardBody>
    </Card>
  );
};