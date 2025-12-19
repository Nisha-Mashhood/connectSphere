import React, { useMemo } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
} from "@nextui-org/react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { IMentorExperience } from "../../../../Interface/Admin/IMentor";

interface Props {
  experiences: IMentorExperience[];
  loading: boolean;
  isEditable?: boolean;
  onEdit?: (exp: IMentorExperience) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

const ExperienceSection: React.FC<Props> = ({
  experiences,
  loading,
  isEditable = false,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const parseMonthDate = (value: string | null) => {
    if (!value) return null;
    return new Date(`${value}-01`);
  };

  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      const dateA = parseMonthDate(a.startDate)?.getTime() ?? 0;
      const dateB = parseMonthDate(b.startDate)?.getTime() ?? 0;
      return dateB - dateA;
    });
  }, [experiences]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present";

    const date = parseMonthDate(dateString);
    if (!date || isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = parseMonthDate(start);
    const endDate = end ? parseMonthDate(end) : new Date();

    if (!startDate || !endDate) return "—";

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    if (months < 1) return "Less than a month";

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
    }
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? "year" : "years"}`;
    }
    return `${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${
      remainingMonths === 1 ? "month" : "months"
    }`;
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-md">
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading experience...</p>
        </CardBody>
      </Card>
    );
  }

  if (!experiences || experiences.length === 0) {
    return (
      <Card className="bg-white shadow-md">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <FaBriefcase className="text-primary text-xl" />
            <h3 className="text-xl font-semibold">Work Experience</h3>
          </div>
          {isEditable && (
            <Button size="sm" color="primary" onPress={onAdd}>
              Add Experience
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-8">
            <FaBriefcase className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              No work experience listed yet.
            </p>
            {isEditable && (
              <Button className="mt-4" color="primary" onPress={onAdd}>
                Add Your First Experience
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <FaBriefcase className="text-primary text-xl" />
          <h3 className="text-xl font-semibold">Work Experience</h3>
        </div>
        {isEditable && (
          <Button size="sm" color="primary" onPress={onAdd}>
            Add Experience
          </Button>
        )}
      </CardHeader>
      <CardBody className="pt-6">
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

          <div className="space-y-6">
            {sortedExperiences.map((exp, index) => (
              <div key={`${exp.id}-${exp.mentorExperienceId}`} className="relative pl-8 group">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    exp.isCurrent
                      ? "bg-primary border-primary shadow-lg shadow-primary/30"
                      : "bg-white border-primary/50 group-hover:border-primary group-hover:shadow-md"
                  }`}
                >
                  {exp.isCurrent ? (
                    <FaCircle className="text-white text-xs animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                  )}
                </div>

                {/* Experience card */}
                <Card
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:translate-x-1 ${
                    exp.isCurrent
                      ? "border-2 border-green-400"
                      : "border border-gray-200"
                  }`}
                  shadow="sm"
                >
                  <CardBody className="p-5">
                    {/* Date badge */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="font-medium">
                        {formatDate(exp.startDate)} —{" "}
                        {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                      </span>
                      <Chip
                        size="sm"
                        variant="flat"
                        color="default"
                        className="ml-auto"
                      >
                        {calculateDuration(exp.startDate, exp.endDate)}
                      </Chip>
                    </div>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg leading-tight mb-1">
                          {exp.role}
                        </h4>
                        <p className="text-primary font-medium text-base">
                          {exp.organization}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exp.isCurrent && (
                          <Chip color="success" variant="flat">
                            Current
                          </Chip>
                        )}
                        {isEditable && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              isIconOnly
                              variant="light"
                              onPress={() => onEdit?.(exp)}
                            >
                              <FaEdit className="text-gray-600" />
                            </Button>
                            <Button
                              size="sm"
                              isIconOnly
                              color="danger"
                              variant="light"
                              onPress={() => onDelete?.(exp.id)}
                            >
                              <FaTrash className="text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {exp.description && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    )}

                    {/* Most recent indicator */}
                    {index === 0 && sortedExperiences.length > 1 && (
                      <div className="mt-4">
                        <Chip size="sm" variant="dot" color="primary">
                          Most Recent
                        </Chip>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Summary footer */}
        {experiences.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
            <p className="text-center text-sm font-medium text-primary-700">
              Total Professional Experience: {experiences.length}{" "}
              {experiences.length === 1 ? "Position" : "Positions"}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default React.memo(ExperienceSection);
