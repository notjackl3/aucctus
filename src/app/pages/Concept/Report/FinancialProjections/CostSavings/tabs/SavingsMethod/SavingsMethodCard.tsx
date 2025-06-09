import React from 'react';
import { Badge, Icon } from '@components';
import { ISavingMethodV2 } from '@libs/api/types/concept/financialProjectionV2';

const SavingMethodIconMap: Record<string, IconVariant> = {
  // Process & Automation
  'Process Automation': 'gear',
  'Labor Reallocation': 'users-edit',
  'Shared Services Model': 'users-03',
  'Workflow Simplification': 'dataflow-04',
  'Utilization of Existing Tools / Tech': 'gear',
  'Preventive Maintenance Programs': 'gear',
  'Throughput Improvement': 'trendup',
  'Cross-Training Employees': 'users-edit',

  // Procurement & Supplier
  'Supplier Consolidation': 'building-02',
  'Contract Renegotiation': 'briefcase',
  'Packaging Optimization': 'cube',
  'Inventory Optimization': 'cube',
  'Demand Forecasting Improvements': 'line-chart-up',
  'SKU Rationalization': 'list',

  // Cost Management
  'Employee Retention Strategy': 'heart',
  'Travel & Expense Policy Optimization': 'route',
  'Facility Consolidation': 'building',
  'Energy Efficiency Upgrades': 'lightbulb',
  'Asset Utilization': 'pie-chart',
  'Outsourcing Non-Core Functions': 'link-external',
  'Zero-Based Budgeting': 'currency-dollar',
  'Audit & Compliance Cost Reduction': 'shield-dollar',
};

interface SavingsMethodCardProps {
  savingMethodData?: ISavingMethodV2;
}

const SavingsMethodCard: React.FC<SavingsMethodCardProps> = ({
  savingMethodData,
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <span className='flex flex-1 flex-row items-center gap-2'>
        <h3 className='aucctus-text-lg-medium aucctus-text-tertiary mb-4'>
          Savings Method
        </h3>
        <span className='flex flex-1' />
        <Badge.Default
          value={'Internal'}
          classNameBadge='aucctus-border-primary aucctus-bg-secondary border rounded-full items-center justify-center'
          classNameLabel='aucctus-text-secondary'
        />
      </span>
      <div className='mb-2 flex flex-1 flex-row items-center gap-2'>
        {savingMethodData?.type && (
          <>
            <Icon
              variant={SavingMethodIconMap[savingMethodData.type]}
              className='aucctus-stroke-brand-primary mr-1 h-6 w-6'
            />
            <div className='aucctus-text-lg-medium aucctus-text-secondary'>
              {savingMethodData.type}
            </div>
          </>
        )}
      </div>
      <p className='aucctus-text-sm aucctus-text-tertiary'>
        {savingMethodData?.description}
      </p>

      {/* Primary Value Driver Section */}
      <div className='aucctus-border-tertiary mt-4 border-t pt-3'>
        <div className='mb-2 flex items-center gap-2'>
          <Icon
            variant='barchart'
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <h4 className='aucctus-text-sm-medium aucctus-text-secondary'>
            Primary Value Driver
          </h4>
        </div>
        <div className='aucctus-bg-success-secondary flex items-center gap-2 rounded-md bg-opacity-25 px-3 py-2'>
          <Icon
            variant='piggy-bank'
            className='aucctus-stroke-success-primary h-4 w-4'
          />
          <p className='aucctus-text-xs aucctus-text-success-primary'>
            Cost Savings
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsMethodCard;
