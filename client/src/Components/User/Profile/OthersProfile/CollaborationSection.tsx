import React from "react";
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import { FaUsers } from "react-icons/fa";
import { CollabData } from "../../../../redux/types";
import { CollaborationCard } from "./CollaborationCard";

interface Props {
  collabData: CollabData[];
  isMentor: boolean;
  onProfileClick: (id: string) => void;
}

export const CollaborationSection: React.FC<Props> = ({
  collabData,
  isMentor,
  onProfileClick,
}) => {
  // Sort by most recent first
  const sortedCollabs = [...collabData].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate stats based on boolean flags
  const stats = {
    total: collabData.length,
    completed: collabData.filter(c => c.isCompleted).length,
    ongoing: collabData.filter(c => !c.isCompleted && !c.isCancelled).length,
    cancelled: collabData.filter(c => c.isCancelled).length,
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4 w-full">
          <div className="flex items-center gap-2">
            <FaUsers className="text-primary text-xl" />
            <h3 className="text-xl font-semibold">
              {isMentor ? "Mentorship Sessions" : "Learning Journey"}
            </h3>
          </div>
          {collabData.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Chip size="sm" variant="flat" color="primary">
                Total: {stats.total}
              </Chip>
              {stats.completed > 0 && (
                <Chip size="sm" variant="flat" color="success">
                  Completed: {stats.completed}
                </Chip>
              )}
              {stats.ongoing > 0 && (
                <Chip size="sm" variant="flat" color="warning">
                  Ongoing: {stats.ongoing}
                </Chip>
              )}
              {stats.cancelled > 0 && (
                <Chip size="sm" variant="flat" color="danger">
                  Cancelled: {stats.cancelled}
                </Chip>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody className="pt-6">
        {collabData.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {isMentor
                ? "No mentorship sessions yet."
                : "No learning collaborations yet."}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isMentor
                ? "Your mentees will appear here once they book sessions."
                : "Book a session with a mentor to start your journey!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedCollabs.map((collab) => (
              <CollaborationCard
                key={collab.id}
                collab={collab}
                isMentor={isMentor}
                onProfileClick={onProfileClick}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CollaborationSection;