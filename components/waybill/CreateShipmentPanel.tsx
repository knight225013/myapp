'use client';

import FbaShipmentForm from './ShipmentForm';

export default function CreateShipmentPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return <FbaShipmentForm isOpen={isOpen} onClose={onClose} />;
}
