import React, { useMemo } from "react";
import { Chip } from "@nextui-org/react";
import { IMentorExperience } from "../../Interface/Admin/IMentor";

interface Props {
  experiences: IMentorExperience[];
  loading: boolean;
}

const MentorExperienceTab: React.FC<Props> = ({ experiences, loading }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Sort experiences by startDate (most recent first)
  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
  }, [experiences]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <p className="text-center text-default-500 py-8">
        No work experience added yet.
      </p>
    );
  }

  return (
    <div className="relative py-4">
      {sortedExperiences.map((exp, index) => (
        <div key={exp.id} className="relative pl-8 pb-8 last:pb-0">
          {/* Timeline line */}
          {index !== sortedExperiences.length - 1 && (
            <div className="absolute left-[11px] top-3 w-0.5 h-full bg-gradient-to-b from-primary to-primary/30" />
          )}

          {/* Timeline dot */}
          <div
            className={`absolute left-0 top-1 w-6 h-6 rounded-full border-3 flex items-center justify-center ${
              exp.isCurrent
                ? "bg-primary border-primary shadow-lg shadow-primary/30"
                : "bg-white dark:bg-gray-800 border-primary/50"
            }`}
          >
            {exp.isCurrent && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>

          {/* Content card */}
          <div className="bg-default-50 dark:bg-default-100/10 rounded-xl p-4 border border-default-200 dark:border-default-100/20 hover:shadow-md transition-shadow duration-200">
            {/* Date badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {formatDate(exp.startDate)} — {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
              </span>
              {exp.isCurrent && (
                <Chip size="sm" color="success" variant="flat">
                  Current
                </Chip>
              )}
            </div>

            {/* Role & Organization */}
            <h4 className="text-base font-semibold text-foreground capitalize">
              {exp.role}
            </h4>
            <p className="text-sm text-default-500 font-medium">
              {exp.organization}
            </p>

            {/* Description */}
            {exp.description && (
              <p className="mt-2 text-sm text-default-600 leading-relaxed">
                {exp.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(MentorExperienceTab);