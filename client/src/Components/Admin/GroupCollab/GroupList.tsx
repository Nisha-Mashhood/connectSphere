import React from "react";
import { useNavigate } from "react-router-dom";
import { Group } from "../../../redux/types";
import Pagination from "../../ReusableComponents/Pagination";

interface Props {
  groups: Group[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  loading: boolean;
  pageSize?: number;
}

const GroupList: React.FC<Props> = ({ groups, total, page, onPageChange, loading, pageSize = 10 }) => {
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!loading && groups.length === 0)
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No groups found</p>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(`/admin/group/${group.id}`)}
          >
            <div
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${group.coverPic})` }}
            />
            <div className="p-5 relative">
              <img
                src={group.profilePic}
                alt={group.name}
                className="absolute -top-10 left-5 w-16 h-16 rounded-lg object-cover border-4 border-white shadow-md"
              />
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{group.bio}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    👥 {group.members.length}/{group.maxMembers} members
                  </div>
                  <span className="text-blue-600 hover:underline text-sm">View Details</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <Pagination page={page} total={total} limit={pageSize} onPageChange={onPageChange} />
      )}
    </>
  );
};

export default React.memo(GroupList);