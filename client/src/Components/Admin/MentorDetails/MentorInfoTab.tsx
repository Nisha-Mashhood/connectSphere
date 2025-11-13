import React from "react";
import { Chip } from "@nextui-org/react";
import { Mentor } from "../../../redux/types";

interface Props {
  mentor: Mentor;
  onCertificateClick: (cert: string) => void;
}

const MentorInfoTab: React.FC<Props> = ({ mentor, onCertificateClick }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div>
      <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
      <div className="space-y-3">
        <p><strong>Name:</strong> {mentor.user.name}</p>
        <p><strong>Email:</strong> {mentor.user.email}</p>
        <p><strong>Job Title:</strong> {mentor.user.jobTitle || "Not specified"}</p>
        <p><strong>Specialization:</strong> {mentor.specialization}</p>
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-4">Professional Details</h3>
      <div className="space-y-3">
        <p><strong>Bio:</strong> {mentor.bio}</p>
        <p><strong>Price per Session:</strong> ₹{mentor.price}</p>
        <div>
          <strong>Skills:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {mentor.skillsDetails.map((s, i) => (
              <Chip key={i} color="primary" variant="flat">{s.name}</Chip>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="md:col-span-2">
      <h3 className="text-xl font-semibold mb-4">Certificates</h3>
      <div className="flex flex-wrap gap-4">
        {mentor.certifications.map((cert, i) => (
          <img
            key={i}
            src={cert}
            alt={`Certificate ${i + 1}`}
            className="w-32 h-32 object-cover rounded cursor-pointer hover:shadow-lg"
            onClick={() => onCertificateClick(cert)}
          />
        ))}
      </div>
    </div>

    <div className="md:col-span-2">
      <h3 className="text-xl font-semibold mb-4">Available Slots</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mentor.availableSlots.map((slot, i) => (
          <div key={i} className="border p-3 rounded-lg bg-gray-50 text-center">
            <p className="font-semibold">{slot.day || "Unspecified Day"}</p>
            {slot.timeSlots.length > 0 ? (
              slot.timeSlots.map((time, ti) => (
                <p key={ti} className="text-gray-600">{time}</p>
              ))
            ) : (
              <p className="text-gray-600">No time specified</p>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default React.memo(MentorInfoTab);