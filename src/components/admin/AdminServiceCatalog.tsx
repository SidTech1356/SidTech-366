import React, { useState } from 'react';
import { Plus, Edit2, ShoppingBag, Eye, EyeOff, X, CreditCard, Split, Trash2 } from 'lucide-react';
import { Service, ServiceCategory, AppSettings, ServiceInstallmentPlanItem } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';

interface AdminServiceCatalogProps {
  services: Service[];
  settings: AppSettings;
  onRefresh: () => void;
}

export const AdminServiceCatalog: React.FC<AdminServiceCatalogProps> = ({
  services,
  settings,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(2000);
  const [advancePercent, setAdvancePercent] = useState<number>(settings.defaultAdvancePercent);
  const [commissionPercent, setCommissionPercent] = useState<number>(settings.defaultCommissionPercent);
  const [category, setCategory] = useState<ServiceCategory>('Website');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  const [allowInstallments, setAllowInstallments] = useState(false);
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [installmentPlan, setInstallmentPlan] = useState<ServiceInstallmentPlanItem[]>([
    { installmentNumber: 1, title: 'Installment 1: Advance Token', percent: 40, description: 'Scope lock & database setup' },
    { installmentNumber: 2, title: 'Installment 2: Mid-way Demo Inspection', percent: 30, description: 'Payable on demo preview inspection' },
    { installmentNumber: 3, title: 'Installment 3: Final Delivery Handover', percent: 30, description: 'Final production launch & domain deployment' },
  ]);

  const openAddModal = () => {
    setEditingService(null);
    setServiceName('');
    setDescription('');
    setPrice(2500);
    setAdvancePercent(settings.defaultAdvancePercent);
    setCommissionPercent(settings.defaultCommissionPercent);
    setCategory('Website');
    setImageUrl('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80');
    setActive(true);
    setAllowInstallments(false);
    setInstallmentCount(3);
    setInstallmentPlan([
      { installmentNumber: 1, title: 'Installment 1: Advance Token', percent: 40, description: 'Scope lock & database setup' },
      { installmentNumber: 2, title: 'Installment 2: Mid-way Demo Inspection', percent: 30, description: 'Payable on demo preview inspection' },
      { installmentNumber: 3, title: 'Installment 3: Final Delivery Handover', percent: 30, description: 'Final production launch & domain deployment' },
    ]);
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setServiceName(service.serviceName);
    setDescription(service.description);
    setPrice(service.price);
    setAdvancePercent(service.advancePercent);
    setCommissionPercent(service.commissionPercent);
    setCategory(service.category);
    setImageUrl(service.imageUrl);
    setActive(service.active);
    setAllowInstallments(Boolean(service.allowInstallments));
    setInstallmentCount(service.installmentCount || service.installmentPlan?.length || 3);
    if (service.installmentPlan && service.installmentPlan.length > 0) {
      setInstallmentPlan(JSON.parse(JSON.stringify(service.installmentPlan)));
    } else {
      setInstallmentPlan([
        { installmentNumber: 1, title: 'Installment 1: Advance Token', percent: 40, description: 'Scope lock & database setup' },
        { installmentNumber: 2, title: 'Installment 2: Mid-way Demo Inspection', percent: 30, description: 'Payable on demo preview inspection' },
        { installmentNumber: 3, title: 'Installment 3: Final Delivery Handover', percent: 30, description: 'Final production launch & domain deployment' },
      ]);
    }
    setShowModal(true);
  };

  const handleApplyPreset = (parts: 2 | 3 | 4) => {
    setInstallmentCount(parts);
    if (parts === 2) {
      setInstallmentPlan([
        { installmentNumber: 1, title: 'Installment 1: Advance Token', percent: 50, description: 'Required to start development' },
        { installmentNumber: 2, title: 'Installment 2: Final Handover', percent: 50, description: 'Payable upon final production delivery' },
      ]);
    } else if (parts === 3) {
      setInstallmentPlan([
        { installmentNumber: 1, title: 'Installment 1: Advance Token', percent: 40, description: 'Scope lock & database architecture' },
        { installmentNumber: 2, title: 'Installment 2: Demo Review', percent: 30, description: 'Payable on sandbox demo inspection' },
        { installmentNumber: 3, title: 'Installment 3: Final Handover', percent: 30, description: 'Payable prior to final domain release' },
      ]);
    } else {
      setInstallmentPlan([
        { installmentNumber: 1, title: 'Installment 1: Kick-off Token', percent: 25, description: 'Initial requirements & architecture' },
        { installmentNumber: 2, title: 'Installment 2: Core Modules Demo', percent: 25, description: 'First milestone inspection' },
        { installmentNumber: 3, title: 'Installment 3: Beta Testing Demo', percent: 25, description: 'Integration and testing' },
        { installmentNumber: 4, title: 'Installment 4: Final Handover', percent: 25, description: 'Production server release' },
      ]);
    }
  };

  const handleAddPlanItem = () => {
    const nextNum = installmentPlan.length + 1;
    const currentSum = installmentPlan.reduce((s, p) => s + (Number(p.percent) || 0), 0);
    const remainingPct = Math.max(0, 100 - currentSum);
    setInstallmentPlan([
      ...installmentPlan,
      {
        installmentNumber: nextNum,
        title: `Installment ${nextNum}: Milestone Phase`,
        percent: remainingPct || 20,
        description: 'Milestone deliverable review',
      },
    ]);
  };

  const handleRemovePlanItem = (idx: number) => {
    const updated = installmentPlan
      .filter((_, i) => i !== idx)
      .map((item, i) => ({
        ...item,
        installmentNumber: i + 1,
      }));
    setInstallmentPlan(updated);
  };

  const handleUpdatePlanItem = (idx: number, field: keyof ServiceInstallmentPlanItem, val: any) => {
    const updated = [...installmentPlan];
    updated[idx] = { ...updated[idx], [field]: val };
    setInstallmentPlan(updated);
  };

  const handleAutoDistributePercent = () => {
    const count = installmentPlan.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const updated = installmentPlan.map((p, i) => ({
      ...p,
      percent: i === count - 1 ? 100 - base * (count - 1) : base,
    }));
    setInstallmentPlan(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      serviceName,
      description,
      price,
      advancePercent,
      commissionPercent,
      category,
      imageUrl,
      active,
      allowInstallments,
      installmentCount: allowInstallments ? (installmentPlan.length || installmentCount) : undefined,
      installmentPlan: allowInstallments ? installmentPlan : undefined,
    };

    if (editingService) {
      await SidTechDatabase.updateService(editingService.serviceId, payload);
    } else {
      await SidTechDatabase.addService(payload);
    }
    setShowModal(false);
    onRefresh();
  };

  const handleToggleActive = async (service: Service) => {
    await SidTechDatabase.updateService(service.serviceId, { active: !service.active });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E86A17]" />
            Service Catalog & Pricing Engine (Database Synced)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Flipkart-style grid cards, base prices, advance % and franchise commission % stored in Database
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.serviceId}
            className={`bg-white rounded-2xl overflow-hidden border shadow-xs transition flex flex-col justify-between ${
              service.active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={service.imageUrl}
                  alt={service.serviceName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#12294A]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {service.category}
                </div>
                <div className="absolute top-2.5 right-2.5 font-mono text-[10px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded shadow">
                  {service.serviceId}
                </div>
                {service.allowInstallments && (
                  <div className="absolute bottom-2.5 left-2.5 bg-indigo-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 backdrop-blur-xs">
                    <CreditCard className="w-3 h-3 text-amber-300" />
                    <span>{service.installmentCount || service.installmentPlan?.length || 3}x Installments Available</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {service.serviceName}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Base Price</span>
                    <span className="font-mono font-bold text-[#12294A]">
                      ₹{service.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Advance</span>
                    <span className="font-bold text-[#E86A17]">{service.advancePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Commission</span>
                    <span className="font-bold text-emerald-600">{service.commissionPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => handleToggleActive(service)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  service.active
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                {service.active ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Active in Grid</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => openEditModal(service)}
                className="px-3 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto sm:my-8 flex flex-col">
            <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
              <div>
                <h3 className="font-bold text-base text-white">
                  {editingService ? `Edit Service: ${editingService.serviceId}` : 'Add New Service to Master Catalog'}
                </h3>
                <p className="text-xs text-orange-200">Set agency deliverable parameters</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Real Estate Portal, Hospital ERP"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  >
                    <option value="Website">Website</option>
                    <option value="App">App</option>
                    <option value="Software">Software</option>
                    <option value="ERP">ERP</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Agency Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Advance Required (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={100}
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch Commission (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              {/* Installment System Option */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#E86A17]" />
                    <label htmlFor="allowInstallments" className="text-xs font-bold text-[#12294A] cursor-pointer">
                      Enable Installment Payment System for this Catalog Item
                    </label>
                  </div>
                  <input
                    id="allowInstallments"
                    type="checkbox"
                    checked={allowInstallments}
                    onChange={(e) => setAllowInstallments(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E86A17] focus:ring-[#E86A17] cursor-pointer"
                  />
                </div>

                {allowInstallments && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Quick Preset Templates:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(2)}
                          className="px-2 py-0.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded text-[10px] font-bold transition cursor-pointer"
                        >
                          2 Installments (50/50)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(3)}
                          className="px-2 py-0.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded text-[10px] font-bold transition cursor-pointer"
                        >
                          3 Installments (40/30/30)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(4)}
                          className="px-2 py-0.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded text-[10px] font-bold transition cursor-pointer"
                        >
                          4 Installments (25% each)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {installmentPlan.map((planItem, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-slate-700 text-[11px]">
                              #{planItem.installmentNumber}
                            </span>
                            <input
                              type="text"
                              value={planItem.title}
                              onChange={(e) => handleUpdatePlanItem(idx, 'title', e.target.value)}
                              placeholder="Installment Title (e.g. Advance Token)"
                              className="flex-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={5}
                                max={100}
                                value={planItem.percent}
                                onChange={(e) => handleUpdatePlanItem(idx, 'percent', Number(e.target.value))}
                                className="w-12 px-1.5 py-1 bg-slate-50 border border-slate-300 rounded text-center text-xs font-bold font-mono"
                              />
                              <span className="text-[11px] text-slate-500 font-mono">%</span>
                              <span className="text-[11px] text-[#E86A17] font-bold font-mono min-w-[55px] text-right">
                                ₹{Math.round((price * planItem.percent) / 100).toLocaleString('en-IN')}
                              </span>
                            </div>
                            {installmentPlan.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePlanItem(idx)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={planItem.description || ''}
                            onChange={(e) => handleUpdatePlanItem(idx, 'description', e.target.value)}
                            placeholder="Milestone release condition (e.g. Payable upon demo inspection)"
                            className="w-full px-2 py-0.5 bg-slate-50/70 border border-slate-200 rounded text-[11px] text-slate-600"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddPlanItem}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Step</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAutoDistributePercent}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Split className="w-3 h-3" />
                          <span>Balance to 100%</span>
                        </button>
                      </div>

                      {(() => {
                        const totalPct = installmentPlan.reduce((s, p) => s + (Number(p.percent) || 0), 0);
                        return (
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            totalPct === 100
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            Total: {totalPct}% {totalPct !== 100 && '(Must = 100%)'}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (shown on Flipkart grid card)
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key features, deliverables, technology stack..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>

              <ImageUploadCompressor
                label="Service Card Thumbnail Image"
                initialImageUrl={imageUrl}
                onImageReady={(dataUrl) => setImageUrl(dataUrl)}
                targetMaxKB={50}
                aspectDesc="Banner or card format (auto-compressed ≤ 50KB)"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E86A17] focus:ring-[#E86A17] cursor-pointer"
                />
                <label htmlFor="active" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Show active in catalog
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {editingService ? 'Save Changes in Database' : 'Create Service in Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
