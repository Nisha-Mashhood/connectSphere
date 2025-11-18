import { Button, Tabs, Tab, Chip } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import BaseModal from "../../ReusableComponents/BaseModal";
import TaskList from "./TaskList";
import TaskForm from "../../Forms/TaskForm";
import TaskViewModal from "./TaskViewModal/TaskViewModal";
import { useTaskManagement } from "../../../Hooks/User/useTaskManagement";
import { CollabData, Group, User } from "../../../redux/types";
import { Task } from "../../../Interface/User/Itask";

interface TaskManagementProps {
  context: "user" | "group" | "collaboration";
  currentUser: User;
  contextData?: User | Group | CollabData;
}

const TaskManagement = ({ context, currentUser, contextData }: TaskManagementProps) => {
  const {
    tasksByStatus,
    selectedTask,
    setSelectedTask,

    // modal states
    modals: {
      isOpen,
      setIsOpen,
      isEditOpen,
      setIsEditOpen,
      isViewOpen,
      setIsViewOpen,
      isDeleting,
      setIsDeleting,
    },

    selectedTab,
    setSelectedTab,

    connectedUsers,
    showUserSelect,
    setShowUserSelect,

    handlers: { createTask, updateTask, deleteTask, updateStatus, updatePriority },

    formatDate,
    getEditInitialData,
  } = useTaskManagement(context, currentUser, contextData);

  // Wrapper for opening edit modal
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    const editable = task.createdBy === currentUser.id;
    setShowUserSelect(context === "user" && editable);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button
          color="primary"
          size="sm"
          startContent={<FaPlus />}
          onPress={() => {
            setShowUserSelect(false);
            setIsOpen(true);
          }}
        >
          Add Task
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        aria-label="Task statuses"
        color="primary"
        variant="underlined"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        fullWidth
        classNames={{
          tabList: "px-0 pt-0",
          panel: "p-3",
        }}
      >
        {/* UPCOMING */}
        <Tab
          key="upcoming"
          title={
            <span className="flex items-center gap-1">
              Upcoming
              <Chip size="sm" color="warning" variant="flat">
                {tasksByStatus.upcoming.length}
              </Chip>
            </span>
          }
        >
          <TaskList
            tasks={tasksByStatus.upcoming}
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(t) => {
              setSelectedTask(t);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={updateStatus}
            onPriorityChange={updatePriority}
            formatDate={formatDate}
            notifications={[]}
          />
        </Tab>

        {/* PENDING */}
        <Tab
          key="pending"
          title={
            <span className="flex items-center gap-1">
              Pending
              <Chip size="sm" color="warning" variant="flat">
                {tasksByStatus.pending.length}
              </Chip>
            </span>
          }
        >
          <TaskList
            tasks={tasksByStatus.pending}
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(t) => {
              setSelectedTask(t);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={updateStatus}
            onPriorityChange={updatePriority}
            formatDate={formatDate}
            notifications={[]}
          />
        </Tab>

        {/* IN PROGRESS */}
        <Tab
          key="inProgress"
          title={
            <span className="flex items-center gap-1">
              In Progress
              <Chip size="sm" color="primary" variant="flat">
                {tasksByStatus.inProgress.length}
              </Chip>
            </span>
          }
        >
          <TaskList
            tasks={tasksByStatus.inProgress}
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(t) => {
              setSelectedTask(t);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={updateStatus}
            onPriorityChange={updatePriority}
            formatDate={formatDate}
            notifications={[]}
          />
        </Tab>

        {/* COMPLETED */}
        <Tab
          key="completed"
          title={
            <span className="flex items-center gap-1">
              Completed
              <Chip size="sm" color="success" variant="flat">
                {tasksByStatus.completed.length}
              </Chip>
            </span>
          }
        >
          <TaskList
            tasks={tasksByStatus.completed}
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(t) => {
              setSelectedTask(t);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={updateStatus}
            onPriorityChange={updatePriority}
            formatDate={formatDate}
            notifications={[]}
          />
        </Tab>

        {/* NOT COMPLETED */}
        <Tab
          key="notCompleted"
          title={
            <span className="flex items-center gap-1">
              Not Completed
              <Chip size="sm" color="danger" variant="flat">
                {tasksByStatus.notCompleted.length}
              </Chip>
            </span>
          }
        >
          <TaskList
            tasks={tasksByStatus.notCompleted}
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            context={context}
            onViewTask={(t) => {
              setSelectedTask(t);
              setIsViewOpen(true);
            }}
            onEditTask={openEditModal}
            onStatusChange={updateStatus}
            onPriorityChange={updatePriority}
            formatDate={formatDate}
            notifications={[]}
          />
        </Tab>
      </Tabs>

      {/* CREATE MODAL */}
      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Task"
        size="lg"
        scrollBehavior="inside"
      >
        <TaskForm
          users={connectedUsers}
          context={context}
          isEditMode={false}
          showUserSelect={showUserSelect}
          setShowUserSelect={setShowUserSelect}
          onSubmit={createTask}
          onCancel={() => setIsOpen(false)}
        />
      </BaseModal>

      {/* EDIT MODAL */}
      <BaseModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Task"
        size="lg"
        scrollBehavior="inside"
      >
        <TaskForm
          initialData={getEditInitialData()}
          users={connectedUsers}
          context={context}
          isEditMode={true}
          showUserSelect={showUserSelect}
          setShowUserSelect={setShowUserSelect}
          canEditAssignment={selectedTask?.createdBy === currentUser.id}
          onSubmit={updateTask}
          onCancel={() => setIsEditOpen(false)}
        />
      </BaseModal>

      {/* VIEW MODAL */}
      <TaskViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        task={selectedTask}
        onEdit={() => {
          setIsViewOpen(false);
          openEditModal(selectedTask!);
        }}
        onDelete={deleteTask}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        formatDate={formatDate}
      />
    </div>
  );
};

export default TaskManagement;
