import React, { useState } from 'react';
import { Search, ShoppingBag, X, CreditCard, CheckCircle2, Split, Check } from 'lucide-react';
import { Service, ProjectInstallment } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';

interface FranchiseCatalogProps {
  services: Service[];
  franchiseId: string;
  onProjectCreated: (projectId: string) => void;
}

export const FranchiseCatalog: React.FC<FranchiseCatalogProps> = ({
  services,
  franchiseId,
  onProjectCreated,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookingService, setBookingService] = useState<Service | null>(null);

  // Booking modal form states
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'installment' | 'full'>('installment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const categories = ['All', 'Website', 'App', 'Software', 'ERP', 'Other'];

  const filteredServices = services.filter((s) => {
    if (!s.active) return false;
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenBooking = (service: Service) => {
    setBookingService(service);
    setClientName('');
    setClientMobile('');
    setNotes('');
    setPaymentPreference(service.allowInstallments ? 'installment' : 'full');
    setBookingError(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService) return;
    setBookingError(null);
    if (!clientName.trim()) return setBookingError('Please enter your client or organization name.');
    if (!clientMobile.trim() || clientMobile.replace(/\D/g, '').length < 10) {
      return setBookingError('Please enter a valid 10-digit mobile number for client contact.');
    }

    setIsSubmitting(true);
    try {
      const isInstallment = Boolean(bookingService.allowInstallments && paymentPreference === 'installment');
      let projectInstallments: ProjectInstallment[] | undefined = undefined;

      if (isInstallment) {
        if (bookingService.installmentPlan && bookingService.installmentPlan.length > 0) {
          projectInstallments = bookingService.installmentPlan.map((p, idx) => ({
            installmentId: `INST-${idx + 1}`,
            installmentNumber: p.installmentNumber,
            title: p.title,
            amount: Math.round((bookingService.price * p.percent) / 100),
            percent: p.percent,
            status: 'Pending',
            dueDate: idx === 0 ? 'Upon Booking / Advance' : `Milestone ${idx + 1}`,
            notes: p.description || p.title,
          }));
        } else {
          const inst1 = Math.round(bookingService.price * 0.4);
          const inst2 = Math.round(bookingService.price * 0.3);
          const inst3 = bookingService.price - inst1 - inst2;
          projectInstallments = [
            { installmentId: 'INST-1', installmentNumber: 1, title: 'Installment 1: Advance Token (40%)', amount: inst1, percent: 40, status: 'Pending', dueDate: 'Upon Booking' },
            { installmentId: 'INST-2', installmentNumber: 2, title: 'Installment 2: Mid-way Demo Inspection (30%)', amount: inst2, percent: 30, status: 'Pending', dueDate: 'Sandbox Demo Ready' },
            { installmentId: 'INST-3', installmentNumber: 3, title: 'Installment 3: Final Delivery Handover (30%)', amount: inst3, percent: 30, status: 'Pending', dueDate: 'Final Deployment' },
          ];
        }
      }

      const newProject = await SidTechDatabase.createProject({
        franchiseId,
        serviceId: bookingService.serviceId,
        clientName,
        clientMobile,
        requirementNotes: notes,
        hasInstallments: isInstallment,
        installments: projectInstallments,
      });

      setIsSubmitting(false);
      setBookingService(null);
      onProjectCreated(newProject.projectId);
    } catch {
      setBookingError('Failed to place booking order in Database. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E86A17]" />
            Enterprise Digital Services Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select high-demand IT services to book and deliver for your clients with automated Database commission tracking.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search website, app, software..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full font-medium transition flex-shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#12294A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No matching services found.
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.serviceId}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={service.imageUrl}
                  alt={service.serviceName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#12294A]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {service.category}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  {service.commissionPercent}% Commission
                </div>
                {service.allowInstallments && (
                  <div className="absolute bottom-2.5 left-2.5 bg-indigo-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 backdrop-blur-xs">
                    <CreditCard className="w-3 h-3 text-amber-300" />
                    <span>{service.installmentCount || service.installmentPlan?.length || 3}x Installments Available</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#E86A17] transition leading-snug">
                    {service.serviceName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Agency Base Price</div>
                      <div className="text-lg font-black text-[#12294A] font-mono">
                        ₹{service.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <div>Advance: <strong className="text-slate-800">{service.advancePercent}%</strong></div>
                      <div>Earnings: <strong className="text-emerald-600 font-mono">₹{Math.round((service.price * service.commissionPercent) / 100).toLocaleString('en-IN')}</strong></div>
                    </div>
                  </div>

                  {service.allowInstallments && (
                    <div className="text-[11px] text-indigo-700 bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-200/80 flex items-center gap-1">
                      <Split className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span>Installments enabled: Pay in {service.installmentCount || service.installmentPlan?.length || 3} milestone installments</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenBooking(service)}
                    className="w-full py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 group-hover:shadow-orange-500/20 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy Now / Book for Client</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setBookingService(null);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
            <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
              <div>
                <h3 className="font-bold text-base text-white">Book Project for Client</h3>
                <p className="text-xs text-orange-200">{bookingService.serviceName}</p>
              </div>
              <button
                onClick={() => setBookingService(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Catalog Price</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    ₹{bookingService.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Advance Required</span>
                  <span className="text-sm font-bold text-[#E86A17] font-mono">
                    ₹{Math.round((bookingService.price * bookingService.advancePercent) / 100).toLocaleString('en-IN')} ({bookingService.advancePercent}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Your Earning</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono">
                    ₹{Math.round((bookingService.price * bookingService.commissionPercent) / 100).toLocaleString('en-IN')} ({bookingService.commissionPercent}%)
                  </span>
                </div>
              </div>

              {/* Installment Payment Choice (If allowed by catalog item) */}
              {bookingService.allowInstallments && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <span className="block text-xs font-bold text-[#12294A] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#E86A17]" />
                    <span>Payment Structure Options</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className={`p-2.5 rounded-lg border flex flex-col justify-between cursor-pointer transition ${
                      paymentPreference === 'installment'
                        ? 'border-[#E86A17] bg-orange-50/70 font-bold text-[#12294A]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>Milestone Installments</span>
                        <input
                          type="radio"
                          name="paymentPreference"
                          checked={paymentPreference === 'installment'}
                          onChange={() => setPaymentPreference('installment')}
                          className="text-[#E86A17] focus:ring-[#E86A17]"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal mt-1">
                        Pay in {bookingService.installmentCount || bookingService.installmentPlan?.length || 3} milestones
                      </span>
                    </label>

                    <label className={`p-2.5 rounded-lg border flex flex-col justify-between cursor-pointer transition ${
                      paymentPreference === 'full'
                        ? 'border-[#E86A17] bg-orange-50/70 font-bold text-[#12294A]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>Standard Advance</span>
                        <input
                          type="radio"
                          name="paymentPreference"
                          checked={paymentPreference === 'full'}
                          onChange={() => setPaymentPreference('full')}
                          className="text-[#E86A17] focus:ring-[#E86A17]"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal mt-1">
                        {bookingService.advancePercent}% Advance + Final Balance
                      </span>
                    </label>
                  </div>

                  {/* Installment breakdown preview if selected */}
                  {paymentPreference === 'installment' && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-700 block">
                        Milestone Payment Schedule:
                      </span>
                      <div className="space-y-1">
                        {(bookingService.installmentPlan && bookingService.installmentPlan.length > 0
                          ? bookingService.installmentPlan
                          : [
                              { installmentNumber: 1, title: 'Installment 1: Advance Token', percent: 40, description: 'Scope lock & database setup' },
                              { installmentNumber: 2, title: 'Installment 2: Mid-way Demo Inspection', percent: 30, description: 'Demo inspection & feedback review' },
                              { installmentNumber: 3, title: 'Installment 3: Final Delivery Handover', percent: 30, description: 'Final production launch & domain deployment' },
                            ]
                        ).map((item, idx) => (
                          <div key={idx} className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                            <div>
                              <strong className="text-slate-800">{item.title}</strong>
                              <span className="text-[10px] text-slate-500 block">{item.description}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-[#12294A] block">
                                ₹{Math.round((bookingService.price * item.percent) / 100).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-[#E86A17] font-semibold">{item.percent}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {bookingError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {bookingError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Client / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="e.g. Apex Hospital, Verma Hardware, St. Anne School"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={clientMobile}
                  onChange={(e) => setClientMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="10 digit client contact number"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Requirements & Special Instructions
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="Pages needed, color preferences, domain name, logos, or custom features..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingService(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating Project in Database...' : 'Confirm & Place Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
