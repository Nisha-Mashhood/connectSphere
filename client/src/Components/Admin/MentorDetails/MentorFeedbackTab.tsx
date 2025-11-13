import React from "react";
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@nextui-org/react";
import { FaStar } from "react-icons/fa";
import { Feedback } from "../../../redux/types";

interface Props {
  feedbacks: Feedback[];
  loading: boolean;
  onToggleVisibility: (id: string) => void;
}

const MentorFeedbackTab: React.FC<Props> = ({ feedbacks, loading, onToggleVisibility }) => (
  <Card>
    <CardBody>
      {loading ? (
        <p>Loading feedback...</p>
      ) : feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        <Table aria-label="Feedback Table">
          <TableHeader>
            <TableColumn>User</TableColumn>
            <TableColumn>Rating</TableColumn>
            <TableColumn>Comments</TableColumn>
            <TableColumn>Visibility</TableColumn>
            <TableColumn>Action</TableColumn>
          </TableHeader>
          <TableBody>
            {feedbacks.map((fb) => (
              <TableRow key={fb.feedbackId}>
                <TableCell>{fb.user.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${i < fb.rating ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>{fb.comments}</TableCell>
                <TableCell>
                  <Chip color={fb.isHidden ? "danger" : "success"} variant="flat">
                    {fb.isHidden ? "Hidden" : "Visible"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    color={fb.isHidden ? "success" : "danger"}
                    onPress={() => onToggleVisibility(fb.feedbackId)}
                  >
                    {fb.isHidden ? "Unhide" : "Hide"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardBody>
  </Card>
);

export default React.memo(MentorFeedbackTab);