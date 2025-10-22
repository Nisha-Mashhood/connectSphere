import { FaUsers, FaUserTie } from 'react-icons/fa';

export const getTabIcon = (tabKey: string) => {
  switch (tabKey) {
    case "mentors":
        return <FaUserTie className="text-lg" />;
      case "users":
        return <FaUserTie className="text-lg" />;
      case "groups":
        return <FaUsers className="text-lg" />;
      default:
        return <FaUserTie className="text-lg" />;
  }
};
