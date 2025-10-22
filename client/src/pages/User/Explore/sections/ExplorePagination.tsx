import { Pagination } from '@nextui-org/react';
import { PaginationState } from '../../../../Hooks/User/useExploreMentors';

interface ExplorePaginationProps {
  activeTab: string;
  mentorPagination: PaginationState;
  setMentorPagination: (pagination: PaginationState) => void;
  userPagination: PaginationState;
  setUserPagination: (pagination: PaginationState) => void;
  groupPagination: PaginationState;
  setGroupPagination: (pagination: PaginationState) => void;
}

const ExplorePagination = ({
  activeTab,
  mentorPagination,
  setMentorPagination,
  userPagination,
  setUserPagination,
  groupPagination,
  setGroupPagination,
}: ExplorePaginationProps) => (
  <div className="flex justify-center">
    <Pagination
      total={
        activeTab === 'mentors'
          ? mentorPagination.totalPages
          : activeTab === 'users'
          ? userPagination.totalPages
          : groupPagination.totalPages
      }
      page={
        activeTab === 'mentors'
          ? mentorPagination.currentPage
          : activeTab === 'users'
          ? userPagination.currentPage
          : groupPagination.currentPage
      }
      onChange={(page) => {
        if (activeTab === 'mentors') {
          setMentorPagination({ ...mentorPagination, currentPage: page });
        } else if (activeTab === 'users') {
          setUserPagination({ ...userPagination, currentPage: page });
        } else {
          setGroupPagination({ ...groupPagination, currentPage: page });
        }
      }}
      showControls
      color="primary"
      size="lg"
    />
  </div>
);

export default ExplorePagination;