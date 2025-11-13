import React from "react";
import BaseModal from "../../ReusableComponents/BaseModal";

interface Props {
  certificate: string | null;
  onClose: () => void;
}

const CertificateViewer: React.FC<Props> = ({ certificate, onClose }) => {
  if (!certificate) return null;
  return (
    <BaseModal
      isOpen={!!certificate}
      onClose={onClose}
      title="Certificate Preview"
      cancelText="Close"
      size="lg"
    >
      <img src={certificate} alt="Certificate" className="w-full h-auto max-h-[80vh]" />
    </BaseModal>
  );
};

export default React.memo(CertificateViewer);