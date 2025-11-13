import { useCollaborationDetails } from "../../Hooks/Admin/useCollaborationDetails";
import { CollabData, RequestData } from "../../redux/types";
import { CancelReasonModal } from "../../Components/Admin/User-Mentor/CollaborationDetails/CancelReasonModal";
import { CollaborationDetailsView } from "../../Components/Admin/User-Mentor/CollaborationDetails/CollaborationDetailsView";
import { RefundConfirmModal } from "../../Components/Admin/User-Mentor/CollaborationDetails/RefundConfirmModal";
import { RequestDetailsView } from "../../Components/Admin/User-Mentor/CollaborationDetails/RequestDetailsView";

const CollaborationDetails = () => {
  const {
    details,
    loading,
    isCollab,
    showCancelDialog,
    showRefundConfirmDialog,
    setShowRefundConfirmDialog,
    reason,
    setReason,
    openCancelFlow,
    closeCancelFlow,
    openRefundConfirm,
    handleConfirmRefund,
    handleAccept,
    handleReject,
    navigateBack,
  } = useCollaborationDetails();
  

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!details)
    return (
      <div className="p-6 bg-white shadow-lg rounded-xl text-center">
        <h3 className="mt-4 text-lg font-medium text-gray-900">Details not found</h3>
        <p className="mt-1 text-sm text-gray-500">We couldn't find the requested information.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={navigateBack}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white shadow overflow-hidden rounded-lg p-6">
        {isCollab ? (
          <CollaborationDetailsView details={details as CollabData} onCancelClick={openCancelFlow} />
        ) : (
          <RequestDetailsView details={details as RequestData} onAccept={handleAccept} onReject={handleReject} />
        )}
      </div>

      {isCollab && (
        <>
          <CancelReasonModal
            isOpen={showCancelDialog}
            reason={reason}
            setReason={setReason}
            onClose={closeCancelFlow}
            onProceed={openRefundConfirm}
          />
          <RefundConfirmModal
            isOpen={showRefundConfirmDialog}
            price={details.price}
            reason={reason}
            onClose={() => setShowRefundConfirmDialog(false)}
            onConfirm={handleConfirmRefund}
          />
        </>
      )}
    </div>
  );
};

export default CollaborationDetails;