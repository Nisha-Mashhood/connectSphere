import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { FaFileInvoiceDollar } from "react-icons/fa";

type Collab = { collaborationId: string; user?: { name: string }; price: number; isCompleted: boolean; isCancelled: boolean };
type Props = { data: Collab[]; total: number; formatCurrency: (n: number) => string; loading: boolean };

export const EarningsHistory = ({ data, total, formatCurrency, loading }: Props) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader className="pb-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><FaFileInvoiceDollar size={16} /></div>
        <h2 className="text-lg font-medium">Earnings History</h2>
      </div>
    </CardHeader>
    <CardBody className="pt-4">
      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div></div>
      ) : data.length > 0 ? (
        <div className="space-y-4">
          {data.map((c, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-900">{c.user?.name || "Unknown"}</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(c.price)}</p>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>ID: {c.collaborationId}</p>
                <p>Status: {c.isCancelled ? "Cancelled" : c.isCompleted ? "Completed" : "Ongoing"}</p>
              </div>
            </div>
          ))}
          <Divider />
          <p className="text-sm font-semibold text-gray-900 pt-2">Total: {formatCurrency(total)}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No earnings history yet.</p>
      )}
    </CardBody>
  </Card>
);