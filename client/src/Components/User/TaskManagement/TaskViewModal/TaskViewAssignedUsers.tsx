import { Chip } from "@nextui-org/react";
import { FaUsers } from "react-icons/fa";

export default function TaskViewAssignedUsers({ users }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FaUsers className="text-cyan-600" />
        <h4 className="font-semibold text-gray-800">Assigned Users</h4>
      </div>

      {users?.length ? (
        <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-5">
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <Chip key={u.id} color="primary" variant="flat">
                {u.name}
              </Chip>
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-3">
            {users.length} {users.length === 1 ? "person" : "people"} assigned
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-2xl p-5 text-center text-gray-500">
          No users assigned
        </div>
      )}
    </div>
  );
}
