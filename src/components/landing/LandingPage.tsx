import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Award,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Search,
  Flame,
} from 'lucide-react';
import { Service } from '../../types/database';

interface LandingPageProps {
  services: Service[];
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenVerify?: (query?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  services,
  onOpenLogin,
  onOpenRegister,
  onOpenVerify,
}) => {
  const [quickVerifyQuery, setQuickVerifyQuery] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOpenVerify) {
      onOpenVerify(quickVerifyQuery);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#12294A] via-[#16335d] to-[#12294A] text-white pt-14 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E86A17]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-orange-300">
            <Sparkles className="w-3.5 h-3.5 text-[#E86A17]" />
            <span>Official SidTech 366 Enterprise Franchise & Cloud Delivery Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Partner with SidTech. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              Sell Websites, Apps & Software
            </span>{' '}
            Under Your Own Branch.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SidTech handles complete end-to-end development, architecture, and deployment. As an authorized branch partner, you book client orders, collect milestones, and receive automated commissions with verified credentials.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="px-6 py-3 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-900/30 transition flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Apply for Franchise</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold border border-white/20 backdrop-blur-xs transition cursor-pointer"
            >
              Sign In to Branch Portal
            </button>
            {onOpenVerify && (
              <button
                onClick={() => onOpenVerify()}
                className="px-5 py-3 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold border border-emerald-400/40 transition flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify ID / Certificate</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/10 max-w-4xl mx-auto text-left">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-300 font-medium">SidTech Fulfilled</div>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-amber-400">Up to 15%</div>
              <div className="text-xs text-slate-300 font-medium">Guaranteed Commission</div>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-amber-400">HD ID Card</div>
              <div className="text-xs text-slate-300 font-medium">Authorized Branch Director Card</div>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-amber-400">100% Secure</div>
              <div className="text-xs text-slate-300 font-medium">Encrypted Live Cloud Storage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Search Bar Section */}
      <section className="py-6 px-4 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleVerifySubmit}
            className="bg-slate-50 border border-slate-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Official Verification Registry
                </h4>
                <p className="text-xs text-slate-500">
                  Verify genuine SidTech franchise branches & client completion certificates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={quickVerifyQuery}
                  onChange={(e) => setQuickVerifyQuery(e.target.value)}
                  placeholder="Enter Franchise ID or Cert No..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <span>Verify Now</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 4-Step Operating Workflow */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#E86A17] uppercase tracking-wider">
            Clear 4-Step Operating Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#12294A]">
            How SidTech Branch Partnership Operates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            You don't need technical coding skills. You act as the official branch partner in your area, while our engineers develop and deliver.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#E86A17] flex items-center justify-center font-bold text-lg mx-auto">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">Apply & Get ID</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Register your branch. Once approved, you receive an authorized SidTech ID Card, Work Certificate, and digital badge.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mx-auto">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">Book IT Services</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose from our catalog of Websites, Mobile Apps, and Cloud ERPs. Enter your client's details to book the project.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg mx-auto">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">Pay Advance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Collect client payment and submit advance via official Company UPI/QR. Admin verifies payment and kicks off development.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mx-auto">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900">Delivery & Earnings</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Test the demo preview, clear remaining balance, and deliver the final URL and completion certificate. Commissions credit instantly to your wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#E86A17] uppercase tracking-wider">
              High-Demand Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#12294A]">
              Enterprise Digital Services Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ready-to-deliver software packages tailored for local businesses, schools, shops, and institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.serviceId}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition group flex flex-col"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={service.imageUrl}
                    alt={service.serviceName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-[#12294A] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {service.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {service.commissionPercent}% Commission
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#E86A17] transition">
                      {service.serviceName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Agency Price</div>
                      <div className="text-base font-extrabold text-[#12294A]">
                        ₹{service.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button
                      onClick={onOpenLogin}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E86A17] hover:bg-[#d45e12] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Book Service</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#12294A] text-white py-12 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E86A17] flex items-center justify-center font-black text-white text-base">
              ST
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wide">
                SIDTECH <span className="text-[#E86A17]">366</span>
              </div>
              <div className="text-xs text-slate-400">
                Enterprise Cloud Suite & Branch Distribution Network
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <p>© {new Date().getFullYear()} SidTech Technologies. All rights reserved.</p>
            <p>Encrypted database architecture, HD credential verification, & secure escrow delivery.</p>
          </div>
          <div className="flex items-center gap-3">
            {onOpenVerify && (
              <button
                onClick={() => onOpenVerify()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                Verify ID / Cert
              </button>
            )}
            <span className="text-slate-600">•</span>
            <button
              onClick={onOpenRegister}
              className="text-xs text-orange-300 hover:text-white font-semibold underline underline-offset-4 cursor-pointer"
            >
              Become a Franchise
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={onOpenLogin}
              className="text-xs text-slate-300 hover:text-white font-semibold cursor-pointer"
            >
              Branch Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
