import { useState } from 'react';
import {  Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem, Chip } from "@nextui-org/react";
import { FaPlus, FaBell, FaUsers, FaLock, FaCalendar } from "react-icons/fa";
// import { Calendar } from 'lucide-react';

//Task Priority Colors
const priorityColors = {
  low: "success",
  medium: "warning",
  high: "danger"
};

//Task Types
const taskTypes = {
  PRIVATE: 'private',
  GROUP: 'group',
  COLLABORATION: 'collaboration'
};

const TaskManagement = ({ 
  context, // 'profile' | 'group' | 'collaboration'
  currentUser,
  contextData, // group or collaboration data if applicable
  onTaskCreate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    startDate: '',
    notificationDate: '',
    privacy: taskTypes.PRIVATE,
    status: 'pending',
    snoozeUntil: null
  });

  const canCreatePublicTask = () => {
    if (context === 'profile') return true;
    if (context === 'group') return contextData?.adminId === currentUser._id;
    if (context === 'collaboration') return currentUser.role === 'mentor';
    return false;
  };

  const handleSubmit = () => {
    const newTask = {
      ...taskData,
      createdBy: currentUser._id,
      createdAt: new Date(),
      contextId: contextData?._id,
      contextType: context
    };
    
    onTaskCreate(newTask);
    setIsOpen(false);
    setTaskData({
      name: '',
      description: '',
      priority: 'medium',
      startDate: '',
      notificationDate: '',
      privacy: taskTypes.PRIVATE,
      status: 'pending',
      snoozeUntil: null
    });
  };

  return (
    <>
      <Button 
        color="primary"
        startContent={<FaPlus />}
        onPress={() => setIsOpen(true)}
        className="mb-4"
      >
        Add New Task
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Task Name"
                placeholder="Enter task name"
                value={taskData.name}
                onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
              />

              <Textarea
                label="Description"
                placeholder="Enter task description"
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Start Date"
                  placeholder="Select start date"
                  value={taskData.startDate}
                  onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                  startContent={<FaCalendar className="text-default-400" />}
                />

                <Input
                  type="date"
                  label="Notification Date"
                  placeholder="Select notification date"
                  value={taskData.notificationDate}
                  onChange={(e) => setTaskData({ ...taskData, notificationDate: e.target.value })}
                  startContent={<FaBell className="text-default-400" />}
                />
              </div>

              <Select
                label="Priority"
                selectedKeys={[taskData.priority]}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
              >
                <SelectItem key="low" value="low">
                  <Chip color="success" size="sm">Low Priority</Chip>
                </SelectItem>
                <SelectItem key="medium" value="medium">
                  <Chip color="warning" size="sm">Medium Priority</Chip>
                </SelectItem>
                <SelectItem key="high" value="high">
                  <Chip color="danger" size="sm">High Priority</Chip>
                </SelectItem>
              </Select>

              {(context !== 'profile' && canCreatePublicTask()) && (
                <Select
                  label="Privacy"
                  selectedKeys={[taskData.privacy]}
                  onChange={(e) => setTaskData({ ...taskData, privacy: e.target.value })}
                >
                  <SelectItem key={taskTypes.PRIVATE} value={taskTypes.PRIVATE}>
                    <div className="flex items-center gap-2">
                      <FaLock />
                      Private Task
                    </div>
                  </SelectItem>
                  <SelectItem key={taskTypes.GROUP} value={taskTypes.GROUP}>
                    <div className="flex items-center gap-2">
                      <FaUsers />
                      {context === 'group' ? 'Group Task' : 'Shared Task'}
                    </div>
                  </SelectItem>
                </Select>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              Create Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TaskManagement;