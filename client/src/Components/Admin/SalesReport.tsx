import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from '@nextui-org/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSalesReport } from '../../Service/Mentor.Service';

interface SalesReport {
  period: string;
  totalRevenue: number;
  platformRevenue: number;
  mentorRevenue: number;
  mentorBreakdown: {
    mentorId: string;
    name: string;
    email: string;
    collaborations: number;
    mentorEarnings: number;
    platformFees: number;
  }[];
}

const SalesReport = () => {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [period, setPeriod] = useState('1month');
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSalesReport(period);
      console.log(response);
      setReport(response);
    } catch (error) {
      toast.error('Failed to fetch sales report');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  },[period])

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Recharts data format
  const chartData = report
    ? [
        { name: 'Total Revenue', amount: report.totalRevenue, fill: '#3b82f6' },
        { name: 'Platform Revenue', amount: report.platformRevenue, fill: '#10b981' },
        { name: 'Mentor Revenue', amount: report.mentorRevenue, fill: '#f59e0b' },
      ]
    : [
        { name: 'Total Revenue', amount: 0, fill: '#3b82f6' },
        { name: 'Platform Revenue', amount: 0, fill: '#10b981' },
        { name: 'Mentor Revenue', amount: 0, fill: '#f59e0b' },
      ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card className="shadow-md">
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sales Report</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="1month">Last 30 Days</option>
            <option value="1year">Last 1 Year</option>
            <option value="5years">Last 5 Years</option>
          </select>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : !report ? (
            <p>No data available.</p>
          ) : (
            <>
              {/* Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">
                  Revenue ({period === '1month' ? 'Last 30 Days' : period === '1year' ? 'Last 1 Year' : 'Last 5 Years'})
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardBody>
                    <h3 className="text-lg font-semibold">Total Revenue</h3>
                    <p className="text-2xl">₹{report.totalRevenue.toFixed(2)}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <h3 className="text-lg font-semibold">Platform Revenue</h3>
                    <p className="text-2xl">₹{report.platformRevenue.toFixed(2)}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <h3 className="text-lg font-semibold">Mentor Revenue</h3>
                    <p className="text-2xl">₹{report.mentorRevenue.toFixed(2)}</p>
                  </CardBody>
                </Card>
              </div>

              {/* Mentor Breakdown Table */}
              <Table aria-label="Mentor Earnings Breakdown">
                <TableHeader>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Email</TableColumn>
                  <TableColumn>Sessions</TableColumn>
                  <TableColumn>Earnings (₹)</TableColumn>
                  <TableColumn>Platform Fees (₹)</TableColumn>
                </TableHeader>
                <TableBody>
                  {report.mentorBreakdown.map((mentor) => (
                    <TableRow key={mentor.mentorId}>
                      <TableCell>{mentor.name}</TableCell>
                      <TableCell>{mentor.email}</TableCell>
                      <TableCell>{mentor.collaborations}</TableCell>
                      <TableCell>{mentor.mentorEarnings.toFixed(2)}</TableCell>
                      <TableCell>{mentor.platformFees.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SalesReport;