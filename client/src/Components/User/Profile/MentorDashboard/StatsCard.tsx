// src/components/Mentor/StatsCard.tsx
import { Card, CardBody } from "@nextui-org/react";
import { FaFileInvoiceDollar, FaUsers, FaCalendarAlt } from "react-icons/fa";

type Props = {
  totalEarnings: number;
  totalMentees: number;
  activeCount: number;
  formatCurrency: (n: number) => string;
};

export const StatsCard = ({ totalEarnings, totalMentees, activeCount, formatCurrency }: Props) => {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardBody className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600"><FaFileInvoiceDollar size={20} /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><FaUsers size={20} /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mentees</p>
              <p className="text-lg font-bold text-gray-900">{totalMentees}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><FaCalendarAlt size={20} /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-lg font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </Card>
      </CardBody>
    </Card>
  );
};





