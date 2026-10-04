import React from 'react';
import { Package, Store } from 'lucide-react';
import { BusinessProfile } from '../types';

interface HeaderProps {
  businessProfile: BusinessProfile;
  onOpenBusinessSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  businessProfile,
  onOpenBusinessSetup,
}) => {
  return (
    <header className="no-print border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900">
            Customer Packaging Label Generator
          </span>
        </div>

        {/* Zone 2: Business Profile Quick Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBusinessSetup}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Edit business name and logo"
          >
            <Store className="w-3.5 h-3.5 text-neutral-700" />
            <span className="font-bold text-neutral-900">
              {businessProfile.businessName ? businessProfile.businessName : 'Set Business Info'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
