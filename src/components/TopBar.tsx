import React from 'react';
import { Menu, Plus, Globe, Building } from 'lucide-react';
import { NavView } from './Sidebar';

interface TopBarProps {
  currentView: NavView;
  onOpenRecordModal: () => void;
  onToggleMobileMenu: () => void;
  onNavigateToPortal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onOpenRecordModal,
  onToggleMobileMenu,
  onNavigateToPortal,
}) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'overview':
        return 'Overview Dashboard';
      case 'donors':
        return 'Donors Directory';
      case 'donations':
        return 'Donations Ledger';
      case 'campaigns':
        return 'Campaigns & Funds';
      case 'stewardship':
        return 'Stewardship & Tax Statements';
      case 'public_portal':
        return 'Public Giving Portal';
      default:
        return 'Donor Management';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-800 md:hidden rounded-lg hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
          <span className="text-slate-900 font-semibold hidden sm:inline">
            Hope Horizons Foundation
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-700 font-bold">{getViewTitle()}</span>
        </div>
      </div>

      {/* Zone 2: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {currentView !== 'public_portal' && (
          <button
            onClick={onNavigateToPortal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Donation Page</span>
            <span className="sm:hidden">Donate Page</span>
          </button>
        )}

        <button
          onClick={onOpenRecordModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Gift</span>
        </button>
      </div>
    </header>
  );
};
