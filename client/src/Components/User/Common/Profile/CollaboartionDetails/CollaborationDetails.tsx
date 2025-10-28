import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/store";
import CancelModal from "./CancelModal";
import CollaborationHeader from "./CollaboartionHeader";
import CollaborationTabs from "./CollaboartionTabs";
import TimeSlotsModal from "./TimeSlotsModal";
import UnavailableDatesModal from "./UnavailableDatesModal";
import PendingRequests from "./PendingRequset";
import { CollabData, TemporarySlotChange, UnavailableDay, User } from "../../../../../redux/types";

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
  const [pendingRequests, setPendingRequests] = useState<Array<UnavailableDay | TemporarySlotChange>>([]);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useSelector((state: RootState) => state.user);
  const { collabDetails } = useSelector((state: RootState) => state.profile);

  // ✅ Memoize collaboration lookup
  const collaboration = useMemo(
    () => collabDetails?.data?.find((collab) => collab.id === collabId),
    [collabDetails, collabId]
  );

  const mongoCollabId = collaboration?.id;

  // ✅ Memoized logic to extract pending requests (stable across renders)
  const getPendingRequests = useCallback(
    (collaboration: CollabData, currentUser: User): Array<UnavailableDay | TemporarySlotChange> => {
      if (!collaboration || !currentUser) return [];

      const isPending = (r: UnavailableDay | TemporarySlotChange) => r.isApproved === "pending";

      const allPending = [
        ...(collaboration.unavailableDays?.filter(isPending) ?? []),
        ...(collaboration.temporarySlotChanges?.filter(isPending) ?? []),
      ];

      return allPending.filter((req) => req.requesterId !== currentUser.id);
    },
    []
  );

  useEffect(() => {
    if (collaboration && currentUser) {
      const updatedPending = getPendingRequests(collaboration, currentUser);

      // Prevent unnecessary re-renders
      setPendingRequests((prev) => {
        const same =
          prev.length === updatedPending.length &&
          prev.every((p, i) => p.id === updatedPending[i].id);
        return same ? prev : updatedPending;
      });

      console.log("Pending Requests (updated):", updatedPending);
    }
  }, [collaboration, currentUser, getPendingRequests]);

  if (!collaboration) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Collaboration not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <CollaborationHeader collaboration={collaboration} currentUser={currentUser} />

        <PendingRequests
          pendingRequests={pendingRequests}
          setPendingRequests={setPendingRequests}
          collabId={mongoCollabId}
          currentUser={currentUser}
          loading={loading}
          setLoading={setLoading}
          dispatch={dispatch}
        />

        <CollaborationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collaboration={collaboration}
          currentUser={currentUser}
          setShowTimeSlotsModal={setShowTimeSlotsModal}
          setShowUnavailableDatesModal={setShowUnavailableDatesModal}
          setShowCancelDialog={setShowCancelDialog}
        />
      </div>

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
        collaboration={collaboration}
      />
    </div>
  );
};

export default CollaborationDetails;
