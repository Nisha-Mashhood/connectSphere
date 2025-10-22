import { Card, CardBody, CardHeader, CardFooter, Button, Chip } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { FaStar, FaClock } from "react-icons/fa";
import { CompleteMentorDetails, User, Group } from "../../redux/types";
import { ButtonConfig } from "../../pages/User/Explore/helpers/getButtonConfigs";

interface ExploreCardProps {
  item: CompleteMentorDetails | User | Group;
  type: "mentor" | "user" | "group";
  getButtonConfig: (item: CompleteMentorDetails | User | Group) => ButtonConfig;
  onButtonPress: (item: CompleteMentorDetails | User | Group) => void;
}

const ExploreCard = ({ item, type, getButtonConfig, onButtonPress }: ExploreCardProps) => {
  const buttonConfig = getButtonConfig(item);
  if (buttonConfig.hidden) return null;

  const isMentor = type === "mentor";
  const isUser = type === "user";
  const mentorItem = item as CompleteMentorDetails;
  const userItem = item as User;
  const groupItem = item as Group;

  const profileId = isMentor
    ? mentorItem.id
    : isUser
    ? userItem.id
    : null;


  return (
    <Card
      key={item.id}
      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <CardHeader className="p-0 relative overflow-hidden">
        <img
          src={
            isMentor
              ? mentorItem.userId?.profilePic || "/api/placeholder/400/400"
              : isUser
              ? userItem.profilePic || "/api/placeholder/400/400"
              : groupItem.profilePic || "/api/placeholder/400/400"
          }
          alt={isMentor ? mentorItem.userId?.name : isUser ? userItem.name : groupItem.name}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isMentor && (
          <>
            <div className="absolute top-3 right-3">
              <Chip
                color="primary"
                variant="solid"
                size="sm"
                className="bg-white/90 text-primary font-semibold"
              >
                ₹{mentorItem.price}
              </Chip>
            </div>
            {mentorItem.avgRating && (
              <div className="absolute top-3 left-3 bg-black/70 rounded-lg px-2 py-1">
                <div className="flex items-center gap-1 text-white text-xs">
                  <FaStar className="text-yellow-400" />
                  <span className="font-medium">
                    {mentorItem.avgRating.toFixed(1)} ({mentorItem.feedbackCount})
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        {isUser && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        {type === "group" && (
          <>
            <div className="absolute top-3 right-3">
              <Chip
                color="primary"
                variant="solid"
                size="sm"
                className="bg-white/90 text-primary font-semibold"
              >
                ₹{groupItem.price}
              </Chip>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </CardHeader>
      <CardBody className="p-4 space-y-3">
        {type === "group" ? (
          <>
            <div className="space-y-2">
                <h3 className="text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                  {groupItem.name}
                </h3>
              <p className="text-sm text-default-600 line-clamp-2">{groupItem.bio}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-default-700">
                  Group Progress
                </span>
                <span className="text-xs font-medium text-primary">
                  {groupItem.members?.length || 0}/{groupItem.maxMembers} members
                </span>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-default-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((groupItem.members?.length || 0) / groupItem.maxMembers) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-default-500">
                  <span>{groupItem.maxMembers - (groupItem.members?.length || 0)} spots left</span>
                  <span>{(((groupItem.members?.length || 0) / groupItem.maxMembers) * 100).toFixed(0)}% full</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-default-500">
              <FaClock className="text-primary" />
              <span>
                Starts:{" "}
                {groupItem.startDate
                  ? new Date(groupItem.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "TBD"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              {profileId ? (
                <Link to={`/profileDispaly/${profileId}`}>
                  <h3 className="text-lg font-bold hover:text-primary transition-colors line-clamp-1">
                    {isMentor ? mentorItem.userId?.name : userItem.name}
                  </h3>
                </Link>
              ) : (
                <h3 className="text-lg font-bold line-clamp-1">
                  {isMentor ? mentorItem.userId?.name : userItem.name}
                </h3>
              )}
              <p className="text-sm text-default-600 font-medium">
                {isMentor ? mentorItem.specialization : userItem.jobTitle || "Community Member"}
              </p>
            </div>
            {isMentor ? (
              <>
                <div className="flex items-center gap-2 text-xs text-default-500">
                  <FaClock className="text-primary" />
                  <span>{mentorItem.timePeriod || "5"} session</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-default-700">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {mentorItem.skills?.slice(0, 3).map((skill) => (
                      <Chip
                        key={skill._id}
                        size="sm"
                        variant="flat"
                        color="secondary"
                        className="text-xs"
                      >
                        {skill.name}
                      </Chip>
                    ))}
                    {mentorItem.skills?.length > 3 && (
                      <Chip size="sm" variant="flat" className="text-xs">
                        +{mentorItem.skills.length - 3}
                      </Chip>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                {userItem.industry && (
                  <p className="text-xs text-default-500">
                    <span className="font-medium">Industry: </span>{userItem.industry}
                  </p>
                )}
                {userItem.reasonForJoining && (
                  <p className="text-xs text-default-500 line-clamp-2">
                    <span className="font-medium">About: </span>{userItem.reasonForJoining}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardBody>
      <CardFooter className="p-4 pt-0">
        <Button
          color="primary"
          variant={buttonConfig.disabled ? "flat" : "solid"}
          className="w-full font-medium"
          onPress={() => !buttonConfig.disabled && onButtonPress(item)}
          isDisabled={buttonConfig.disabled}
          size="md"
        >
          {buttonConfig.text}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExploreCard;