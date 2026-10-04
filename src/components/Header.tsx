import React from 'react';
import { Package, Store } from 'lucide-react';
import { BusinessProfile } from '../types';

interface HeaderProps {
  businessProfile: BusinessProfile;
  onOpenBusinessSetup: () => void;
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  businessProfile,
  onOpenBusinessSetup,
  onLoadSample,
}) => {
  return (
    <header className="no-print border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900">
            Customer Packaging Label Generator
          </span>
        </div>

        {/* Zone 2: Navigation / Info */}
        <div className="hidden md:flex items-center gap-6 text-xs text-neutral-500 font-medium">
          <span>Courier Standard</span>
          <span aria-hidden="true">·</span>
          <span>4×6 Thermal / A4 Sheet</span>
          <span aria-hidden="true">·</span>
          <span>Itemized Order Table</span>
        </div>

        {/* Zone 3: Quick Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBusinessSetup}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Edit business name and logo"
          >
            <Store className="w-3.5 h-3.5 text-neutral-600" />
            <span className="truncate max-w-[120px] sm:max-w-[160px]">
              {businessProfile.businessName ? businessProfile.businessName : 'Set Business Info'}
            </span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Load Sample
          </button>
        </div>
      </div>
    </header>
  );
};
