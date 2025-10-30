// src/components/Mentor/BioCard.tsx
import { Card, CardHeader, CardBody } from "@nextui-org/react";

type Props = { bio: string };

export const BioCard = ({ bio }: Props) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader className="pb-3"><h2 className="text-lg font-medium">Bio</h2></CardHeader>
    <CardBody className="pt-0">
      <p className="text-sm text-gray-600">{bio || "No bio provided."}</p>
    </CardBody>
  </Card>
);