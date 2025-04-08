import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/store";
import CancelModal from "./CancelModal";
import CollaborationHeader from "./CollaboartionHeader";
import CollaborationTabs from "./CollaboartionTabs";
import TimeSlotsModal from "./TimeSlotsModal";
import UnavailableDatesModal from "./UnavailableDatesModal";
import PendingRequests from "./PendingRequset";

const CollaborationDetails = () => {
  const { collabId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showTimeSlotsModal, setShowTimeSlotsModal] = useState(false);
  const [showUnavailableDatesModal, setShowUnavailableDatesModal] = useState(false);
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [selectedUnavailableDates, setSelectedUnavailableDates] = useState<{ date: Date; reason: string }[]>([]);
  const [selectedDatesForTimeSlot, setSelectedDatesForTimeSlot] = useState<Date[]>([]);
  const [newTimeSlotsMap, setNewTimeSlotsMap] = useState<{ [dateString: string]: string[] }>({});
  const [pendingRequests, setPendingRequests] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useSelector((state: RootState) => state.user);
  const { collabDetails } = useSelector((state: RootState) => state.profile);

  const collaboration = collabDetails?.data?.find((collab) => collab._id === collabId);

  useEffect(() => {
    if (collaboration) {
      console.log("Raw collaboration data:", collaboration);
      console.log("Unavailable Days:", collaboration.unavailableDays);
      console.log("Temporary Slot Changes:", collaboration.temporarySlotChanges);

      const unavailableRequests = collaboration.unavailableDays.filter(
        (req) => req.isApproved === "pending"
      );
      const timeSlotRequests = collaboration.temporarySlotChanges.filter(
        (req) => req.isApproved === "pending"
      );
      console.log("Filtered unavailableRequests:", unavailableRequests);
      console.log("Filtered timeSlotRequests:", timeSlotRequests);
      setPendingRequests([...unavailableRequests, ...timeSlotRequests]);
    }
  }, [collaboration]);

  if (!collaboration) {
    return (
    <div className="flex items-center justify-center min-h-screen">
    <p className="text-xl text-gray-600">
    Collaboration not found
    </p>
    </div>
    )
  }

  const isMentor = currentUser.role === "mentor";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <CollaborationHeader collaboration={collaboration} isMentor={isMentor} />
        <PendingRequests
          pendingRequests={pendingRequests}
          setPendingRequests={setPendingRequests}
          collabId={collabId}
          currentUser={currentUser}
          loading={loading}
          setLoading={setLoading}
          dispatch={dispatch}
        />
        <CollaborationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collaboration={collaboration}
          isMentor={isMentor}
          currentUser={currentUser}
          setShowTimeSlotsModal={setShowTimeSlotsModal}
          setShowUnavailableDatesModal={setShowUnavailableDatesModal}
          setShowCancelDialog={setShowCancelDialog}
        />
      </div>


      {/* Make this for other person only */}
      <TimeSlotsModal
        isOpen={showTimeSlotsModal}
        onClose={() => {
          setShowTimeSlotsModal(false);
          setSelectedDatesForTimeSlot([]);
          setNewTimeSlotsMap({});
        }}
        collaboration={collaboration}
        currentUser={currentUser}
        selectedDatesForTimeSlot={selectedDatesForTimeSlot}
        setSelectedDatesForTimeSlot={setSelectedDatesForTimeSlot}
        newTimeSlotsMap={newTimeSlotsMap}
        setNewTimeSlotsMap={setNewTimeSlotsMap}
        loading={loading}
        setLoading={setLoading}
        dispatch={dispatch}
        collabId={collabId}
      />

      <UnavailableDatesModal
        isOpen={showUnavailableDatesModal}
        onClose={() => {
          setShowUnavailableDatesModal(false);
          setSelectedUnavailableDates([]);
        }}
        collaboration={collaboration}
        currentUser={currentUser}
        selectedUnavailableDates={selectedUnavailableDates}
        setSelectedUnavailableDates={setSelectedUnavailableDates}
        loading={loading}
        setLoading={setLoading}
        dispatch={dispatch}
        collabId={collabId}
      />

      <CancelModal
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        reason={reason}
        setReason={setReason}
        collabId={collabId}
        currentUser={currentUser}
        dispatch={dispatch}
        navigate={navigate}
      />
    </div>
  );
};

export default CollaborationDetails;