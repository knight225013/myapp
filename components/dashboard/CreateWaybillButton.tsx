import React from 'react';
import Button from '@/components/ui/Button';

interface CreateWaybillButtonProps {
  onClick: () => void;
}

const CreateWaybillButton: React.FC<CreateWaybillButtonProps> = ({ onClick }) => {
  return (
    <div className="mb-8">
      <Button 
        onClick={onClick}
        size="lg"
        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
      >
        <i className="fas fa-plus mr-2" />
        Create New Waybill
      </Button>
    </div>
  );
};

export default CreateWaybillButton; 