import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaChartBar } from "react-icons/fa";

type Props = {
  data: { date: string; earnings: number }[];
  formatCurrency: (n: number) => string;
};

export const EarningsChart = ({ data, formatCurrency }: Props) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader className="pb-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><FaChartBar size={16} /></div>
        <h2 className="text-lg font-medium">Performance Graphs</h2>
      </div>
    </CardHeader>
    <CardBody className="pt-4">
      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No earnings data</p>
        </div>
      )}
    </CardBody>
  </Card>
);