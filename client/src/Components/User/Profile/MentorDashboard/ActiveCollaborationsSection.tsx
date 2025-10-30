import { lazy, Suspense } from "react";
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import { FaCalendarAlt } from "react-icons/fa";

const ActiveCollaborations = lazy(() => import("../../Profile/ActiveCollaborations/ActiveCollaborations"));

type Props = { onProfileClick: (id: string) => void };

export const ActiveCollaborationsSection = ({ onProfileClick }: Props) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader className="pb-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><FaCalendarAlt size={16} /></div>
        <h2 className="text-lg font-medium">Active Collaborations</h2>
      </div>
    </CardHeader>
    <CardBody className="pt-4">
      <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="md" /></div>}>
        <ActiveCollaborations handleProfileClick={onProfileClick} />
      </Suspense>
    </CardBody>
  </Card>
);