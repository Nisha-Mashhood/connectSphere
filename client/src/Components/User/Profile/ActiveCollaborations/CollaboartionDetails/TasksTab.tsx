import { Card, CardBody } from "@nextui-org/react";
import TaskManagement from "../../../TaskManagement/TaskManagemnt";

const TasksTab = ({ collaboration, currentUser }) => (
  <Card className="shadow-md">
    <CardBody>
      <TaskManagement context="collaboration" currentUser={currentUser} contextData={collaboration} />
    </CardBody>
  </Card>
);

export default TasksTab;