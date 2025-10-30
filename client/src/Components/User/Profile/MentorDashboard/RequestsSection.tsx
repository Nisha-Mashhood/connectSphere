import { lazy, Suspense } from "react";
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import { FaUsers } from "react-icons/fa";

const RequestsSection = lazy(() => import("../../Profile/RequestSection/RequestSection"));

type Props = { onProfileClick: (id: string) => void };

export const RequestsSec = ({ onProfileClick }: Props) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader className="pb-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-50 text-green-600"><FaUsers size={16} /></div>
        <h2 className="text-lg font-medium">Pending Requests</h2>
      </div>
    </CardHeader>
    <CardBody className="pt-4">
      <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="md" /></div>}>
        <RequestsSection handleProfileClick={onProfileClick} />
      </Suspense>
    </CardBody>
  </Card>
);