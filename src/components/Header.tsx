import React, { useState } from 'react';
import {
  FileText,
  Calculator,
  Scan,
  BookOpen,
  Settings,
  Plus,
  Smartphone,
  Menu,
  X,
  Layers,
  Crown,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SubscriptionState } from '../types';
import { getAiQuotaInfo, PLANS_CONFIG } from '../utils/storage';

export type NavTab = 'offers' | 'editor' | 'scanner' | 'guidelines' | 'pricing';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewOffer: () => void;
  onOpenInstallModal: () => void;
  onOpenSubscriptionModal: () => void;
  subscription: SubscriptionState;
  offersCount: number;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onNewOffer,
  onOpenInstallModal,
  onOpenSubscriptionModal,
  subscription,
  offersCount,
}) => {
  const { isInstallable, isInstalled, isIOS } = usePWAInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const quota = getAiQuotaInfo(subscription);
  const currentPlanConfig = PLANS_CONFIG[subscription.plan] || PLANS_CONFIG.free;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
    { id: 'offers', label: 'Ponude', icon: FileText, badge: offersCount },
    { id: 'editor', label: 'Kalkulator', icon: Calculator },
    { id: 'scanner', label: 'AI Skener Skice', icon: Scan },
    { id: 'guidelines', label: 'Upute za Skicu', icon: BookOpen },
    { id: 'pricing', label: 'Cjenik & Profil', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('offers')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                  KeraKalk
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-600/30 text-orange-400 border border-orange-500/30">
                  AI Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Kalkulator i ponude za keramičare
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-orange-800 text-orange-100' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions & PWA Install */}
          <div className="flex items-center gap-2">
            {/* Subscription status badge */}
            <button
              onClick={onOpenSubscriptionModal}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                subscription.plan === 'business'
                  ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/50 text-amber-300'
                  : subscription.plan === 'pro'
                  ? 'bg-orange-950/80 hover:bg-orange-900 border-orange-500/50 text-orange-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Paketi i status AI kvote"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{currentPlanConfig.name}</span>
              <span className="text-[10px] font-mono font-normal opacity-80 hidden sm:inline">
                ({quota.used}/{quota.limit} AI)
              </span>
            </button>

            {/* Install Button */}
            {!isInstalled && (
              <button
                onClick={onOpenInstallModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition hover:border-orange-500/50"
                title="Instaliraj na telefon ili računalo"
              >
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span>{isIOS ? 'iPhone App' : isInstallable ? 'Instaliraj App' : 'Mobilna App'}</span>
              </button>
            )}

            {/* Quick New Offer Button */}
            <button
              onClick={() => {
                onNewOffer();
                onSelectTab('editor');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-semibold shadow-md shadow-orange-600/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Ponuda</span>
              <span className="sm:hidden">Nova</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Izbornik"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {/* Subscription Banner in Mobile Drawer */}
          <button
            onClick={() => {
              onOpenSubscriptionModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-950/50 to-orange-950/50 border border-amber-500/30 text-amber-300 mb-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>
                Paket: {currentPlanConfig.name} • AI analize ({quota.used}/{quota.limit})
              </span>
            </div>
            <span className="text-orange-400 font-mono">
              {currentPlanConfig.price > 0 ? `${currentPlanConfig.price.toFixed(2)} €/mj` : 'Besplatno'}
            </span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-orange-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-orange-400" />
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onOpenInstallModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 bg-slate-800/60 hover:bg-slate-800"
            >
              <Smartphone className="w-5 h-5 text-orange-400" />
              <span>Instaliraj kao Android / iPhone aplikaciju</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
