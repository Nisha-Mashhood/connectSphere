import { Card, CardBody, Divider, Badge } from "@nextui-org/react";

const InfoTab = ({ collaboration, isMentor }) => {
  const otherPartyDetails = isMentor ? collaboration.userId : collaboration.mentorId?.userId;
  const displayName = otherPartyDetails?.name || "Unknown";
  const profilePic = otherPartyDetails?.profilePic;

  return (
    <Card className="shadow-md">
      <CardBody>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <img src={profilePic} alt={displayName} className="w-32 h-32 rounded-lg object-cover" />
            <div>
              <h3 className="text-xl font-bold">{displayName}</h3>
              <p className="text-gray-600 dark:text-gray-400">{otherPartyDetails?.email}</p>
              {otherPartyDetails?.bio && (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{otherPartyDetails.bio}</p>
              )}
            </div>
          </div>
          <Divider />
          {otherPartyDetails?.skills && otherPartyDetails.skills.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {otherPartyDetails.skills.map((skill, index) => (
                  <Badge key={index} color="primary" variant="flat">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default InfoTab;