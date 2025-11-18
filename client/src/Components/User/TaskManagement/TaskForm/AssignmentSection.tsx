import { Select, SelectItem, Chip } from "@nextui-org/react";
import { UseFormSetValue } from "react-hook-form";
import { FaUsers } from "react-icons/fa";
import { TaskFormValues } from "../../../../validation/taskValidation";


interface AssignmentSectionProps {
  users: { userId: string; name: string }[];
  selectedUsers: string[];
  setValue: UseFormSetValue<TaskFormValues>;
  showUserSelect: boolean;
  setShowUserSelect: (v: boolean) => void;
  canEditAssignment?: boolean;
}

const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  users,
  selectedUsers,
  setValue,
  showUserSelect,
  setShowUserSelect,
  canEditAssignment,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-1">
        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 ml-2">Assignment</h3>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-2xl border-2 border-cyan-200">
        <label className={`flex items-center gap-3`}>
          <input
            type="checkbox"
            checked={showUserSelect}
            disabled={canEditAssignment === false}
            onChange={(e) => {
              const c = e.target.checked;
              setShowUserSelect(c);
              if (!c) setValue("assignedUsers", []);
            }}
            className="w-5 h-5 accent-cyan-600"
          />
          <div className="flex items-center gap-2">
            <FaUsers className="text-cyan-600" />
            <span className="font-medium text-gray-800">Assign to Network</span>
          </div>
        </label>

        {showUserSelect && (
          <div className="mt-4 space-y-3">
            <Select
              selectionMode="multiple"
              selectedKeys={selectedUsers}
              onSelectionChange={(keys) => {
                setValue("assignedUsers", Array.from(keys) as string[]);
              }}
              variant="bordered"
              label="Select Users"
            >
              {users.map((u) => (
                <SelectItem key={u.userId}>{u.name}</SelectItem>
              ))}
            </Select>

            {selectedUsers.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-cyan-200">
                <p className="text-xs text-gray-600 mb-2">
                  Assigned Users ({selectedUsers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((id) => {
                    const user = users.find((u) => u.userId === id);
                    return user ? (
                      <Chip key={id} color="primary" variant="flat">
                        {user.name}
                      </Chip>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSection;
