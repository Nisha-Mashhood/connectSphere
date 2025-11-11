export const StatusBadge = ({ status }: { status: boolean | string }) => {
  if (status === true) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Payment Done
      </span>
    );
  }
  if (status === false || status === "Pending") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        Payment Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
      {status}
    </span>
  );
};