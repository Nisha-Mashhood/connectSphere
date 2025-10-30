import { useGroupRequests } from "../../../../../Hooks/User/useGroupRequests";
import GroupsSection from "./Groups.Section";
import { GroupRequestCard } from "./GroupRequestCard";

export const GroupRequests = () => {
  const { currentUser, groupRequests, groups, loading, refresh } =
    useGroupRequests();

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {/* ----- Join Requests ----- */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 dark:text-white">
          Your Join Requests
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          These are the groups you’ve <strong>requested to join</strong>. Once
          the admin accepts your request and you complete the payment (if
          required), you’ll become a member.
        </p>

        <div className="space-y-4">
          {groupRequests.length > 0 ? (
            groupRequests.map((req) => (
              <GroupRequestCard
                key={req.id}
                request={req}
                currentUser={currentUser!}
                onPaymentSuccess={refresh}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No requests sent
            </p>
          )}
        </div>
      </section>

      {/* ----- Owned Groups ----- */}
      <section>
        <h3 className="text-xl font-semibold mb-2 dark:text-white">
          Groups You’ve Created
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          These are the groups where you are the <strong>admin</strong>.
        </p>

        {groups.length > 0 ? (
          <GroupsSection groups={groups} />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            You haven't created any groups yet
          </p>
        )}
      </section>
    </div>
  );
};

export default GroupRequests;