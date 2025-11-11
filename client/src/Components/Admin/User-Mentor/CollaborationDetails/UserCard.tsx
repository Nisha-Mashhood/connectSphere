export const UserCard = ({
  name,
  email,
  profilePic,
  extra,
}: {
  name: string;
  email: string;
  profilePic?: string;
  extra?: string;
}) => (
  <div className="flex items-center">
    <div className="flex-shrink-0 h-10 w-10">
      <img
        className="h-10 w-10 rounded-full object-cover border border-gray-200"
        src={profilePic || "https://via.placeholder.com/40"}
        alt={name}
      />
    </div>
    <div className="ml-4">
      <div className="font-medium">{name}</div>
      <div className="text-xs text-gray-500">{email}</div>
      {extra && <div className="text-xs text-gray-500 mt-1">{extra}</div>}
    </div>
  </div>
);