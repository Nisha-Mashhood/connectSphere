import { Tabs, Tab } from '@nextui-org/react';
import { getTabIcon } from '../../../pages/User/Explore/helpers/getTabIcon';
import { PaginationState } from '../../../Hooks/User/useExploreMentors';

interface TabsSectionProps {
  activeTab: string;
  handleSelectionChange: (key: string | number) => void;
  mentorPagination: PaginationState;
  userPagination: PaginationState;
  groupPagination: PaginationState;
}

const TabsSection = ({
  activeTab,
  handleSelectionChange,
  mentorPagination,
  userPagination,
  groupPagination,
}: TabsSectionProps) => (
  <div className="mb-6">
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={handleSelectionChange}
      aria-label="Explore sections"
      color="primary"
      variant="underlined"
      size="lg"
      classNames={{
        base: 'w-full',
        tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
        cursor: 'w-full bg-primary',
        tab: 'max-w-fit px-0 h-12',
        tabContent: 'group-data-[selected=true]:text-primary',
      }}
    >
      <Tab
        key="mentors"
        title={
          <div className="flex items-center gap-3">
            {getTabIcon('mentors')}
            <div className="flex flex-col items-start">
              <span className="font-semibold">Mentors</span>
              <span className="text-xs text-default-400">
                {mentorPagination.totalItems > 5
                  ? '5+ available'
                  : `${mentorPagination.totalItems} available`}
              </span>
            </div>
          </div>
        }
      />
      <Tab
        key="users"
        title={
          <div className="flex items-center gap-3">
            {getTabIcon('users')}
            <div className="flex flex-col items-start">
              <span className="font-semibold">Users</span>
              <span className="text-xs text-default-400">
                {userPagination.totalItems > 5
                  ? '5+ members'
                  : `${userPagination.totalItems} members`}
              </span>
            </div>
          </div>
        }
      />
      <Tab
        key="groups"
        title={
          <div className="flex items-center gap-3">
            {getTabIcon('groups')}
            <div className="flex flex-col items-start">
              <span className="font-semibold">Groups</span>
              <span className="text-xs text-default-400">
                {groupPagination.totalItems > 5
                  ? '5+ communities'
                  : `${groupPagination.totalItems} communities`}
              </span>
            </div>
          </div>
        }
      />
    </Tabs>
  </div>
);

export default TabsSection;