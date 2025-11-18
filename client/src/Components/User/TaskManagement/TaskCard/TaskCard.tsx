import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";

import TaskHeader from "./TaskHeader";
import TaskBody from "./TaskBody";
import TaskFooter from "./TaskFooter";

export default function TaskCard({
  task,
  currentUser,
  context,
  onView,
  onEdit,
  onStatusChange,
  onPriorityChange,
  formatDate,
  hasUnreadNotification,
}) {
  return (
    <Card className="w-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group">
      <CardHeader>
        <TaskHeader
          task={task}
          currentUser={currentUser}
          context={context}
          onView={onView}
          onEdit={onEdit}
          hasUnread={hasUnreadNotification}
        />
      </CardHeader>

      <CardBody>
        <TaskBody task={task} formatDate={formatDate} />
      </CardBody>

      <CardFooter className="w-full flex flex-col md:flex-row gap-4 flex-wrap">
        <TaskFooter
          task={task}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
        />
      </CardFooter>
    </Card>
  );
}
