import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseAnalyticsCard } from './ExpenseAnalyticsCard';
import { RevenueAnalyticsCard } from './RevenueAnalyticsCard';

interface FinancialAnalyticsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'expense' | 'revenue';
}

export const FinancialAnalyticsDialog: React.FC<FinancialAnalyticsDialogProps> = ({
  isOpen,
  onClose,
  type
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'expense' ? 'Expense Analytics' : 'Revenue Analytics'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {type === 'expense' ? <ExpenseAnalyticsCard /> : <RevenueAnalyticsCard />}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 