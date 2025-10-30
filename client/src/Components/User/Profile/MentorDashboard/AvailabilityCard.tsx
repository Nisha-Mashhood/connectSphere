import { Card, CardHeader, CardBody, Accordion, AccordionItem, Chip } from "@nextui-org/react";

type Slot = { day: string; timeSlots: string[] };
type Props = { slots: Slot[] };

export const AvailabilityCard = ({ slots }: Props) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader className="pb-3"><h2 className="text-lg font-medium">Availability</h2></CardHeader>
    <CardBody className="pt-0">
      {slots.length > 0 ? (
        <Accordion variant="light">
          {slots.map((slot, i) => (
            <AccordionItem key={i} title={slot.day}>
              <div className="flex flex-wrap gap-2">
                {slot.timeSlots.map((t, j) => (
                  <Chip key={j} variant="flat" color="primary" size="sm">{t}</Chip>
                ))}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-gray-500">No slots added yet.</p>
      )}
    </CardBody>
  </Card>
);