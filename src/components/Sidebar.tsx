import React from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Target,
  MailCheck,
  Globe,
  Plus,
  Building2,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';

export type NavView = 'overview' | 'donors' | 'donations' | 'campaigns' | 'stewardship' | 'public_portal';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenRecordModal: () => void;
  onResetData: () => void;
  totalDonors: number;
  totalDonations: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenRecordModal,
  onResetData,
  totalDonors,
  totalDonations,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems = [
    {
      id: 'overview' as NavView,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'donors' as NavView,
      label: 'Donors Directory',
      icon: Users,
      count: totalDonors,
    },
    {
      id: 'donations' as NavView,
      label: 'Donations Ledger',
      icon: Receipt,
      count: totalDonations,
    },
    {
      id: 'campaigns' as NavView,
      label: 'Campaigns & Funds',
      icon: Target,
    },
    {
      id: 'stewardship' as NavView,
      label: 'Stewardship & Tax',
      icon: MailCheck,
    },
    {
      id: 'public_portal' as NavView,
      label: 'Public Giving Portal',
      icon: Globe,
      isSpecial: true,
    },
  ];

  const handleNavClick = (view: NavView) => {
    onSelectView(view);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-2xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Organization Block */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-xs">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  Kith & Kin
                </span>
                <span className="text-2xs text-slate-400 font-medium block">
                  Hope Horizons Foundation
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Record Action */}
          <div className="p-4">
            <button
              onClick={() => {
                onOpenRecordModal();
                setIsMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Record Contribution</span>
            </button>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1">
            <div className="px-3 py-1.5 text-3xs font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-emerald-400'
                          : item.isSpecial
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="font-mono text-2xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 tabular-nums">
                      {item.count}
                    </span>
                  )}
                  {item.isSpecial && (
                    <span className="text-3xs bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.2 rounded uppercase">
                      Live
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Reset Demo */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 text-2xs space-y-1 text-slate-400">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>501(c)(3) Compliant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </div>
            <p>EIN: 82-4192084</p>
            <p>Audit Period: FY2026</p>
          </div>

          <button
            onClick={onResetData}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-2xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Records</span>
          </button>
        </div>
      </aside>
    </>
  );
};
