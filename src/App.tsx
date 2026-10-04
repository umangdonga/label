import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Store,
  Copy,
  Check,
  Edit2,
} from 'lucide-react';
import { OrderFormData, FormErrors, PaymentStatus, BusinessProfile } from './types';
import { ShippingLabel } from './components/ShippingLabel';
import { Header } from './components/Header';
import { BusinessSetupModal } from './components/BusinessSetupModal';
import { generateAndDownloadPdf } from './utils/pdfGenerator';

const STORAGE_KEY_BIZ = 'pkg_label_business_profile';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const DEFAULT_BUSINESS: BusinessProfile = {
  businessName: '',
  businessLogo: '',
};

export default function App() {
  // Business Profile State
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BIZ);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BUSINESS;
  });

  const [isBizModalOpen, setIsBizModalOpen] = useState<boolean>(() => {
    // If user hasn't set business name yet, open modal automatically on first open
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BIZ);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !parsed.businessName;
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  });

  const [isInitialSetup, setIsInitialSetup] = useState<boolean>(!businessProfile.businessName);

  // Form State
  const [formData, setFormData] = useState<OrderFormData>({
    businessName: businessProfile.businessName,
    businessLogo: businessProfile.businessLogo,
    fullName: '',
    mobileNumber: '',
    houseFlatNo: '',
    societyStreet: '',
    areaLocality: '',
    city: '',
    state: '',
    pincode: '',
    productName: '',
    quantity: '1',
    unitPrice: '',
    payment: 'Paid',
    courierDispatchedDate: getTodayDateString(),
  });

  const [generatedLabel, setGeneratedLabel] = useState<OrderFormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const labelRef = useRef<HTMLDivElement>(null);

  // Sync business profile changes to formData and generatedLabel
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      businessName: businessProfile.businessName,
      businessLogo: businessProfile.businessLogo,
    }));
    if (generatedLabel) {
      setGeneratedLabel((prev) =>
        prev
          ? {
              ...prev,
              businessName: businessProfile.businessName,
              businessLogo: businessProfile.businessLogo,
            }
          : null
      );
    }
  }, [businessProfile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSaveBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    try {
      localStorage.setItem(STORAGE_KEY_BIZ, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    setIsBizModalOpen(false);
    setIsInitialSetup(false);
    showToast('Business details saved! Now fill the customer order below.');
  };

  const handleInputChange = (
    field: keyof OrderFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const [downloadResult, setDownloadResult] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    }

    const hasAnyAddress =
      Boolean(formData.houseFlatNo.trim()) ||
      Boolean(formData.societyStreet.trim()) ||
      Boolean(formData.areaLocality.trim());
    if (!hasAnyAddress) {
      newErrors.houseFlatNo = 'Address / Street detail is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    }
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product Name is required';
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (!formData.courierDispatchedDate) {
      newErrors.courierDispatchedDate = 'Dispatched Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateLabel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!businessProfile.businessName.trim()) {
      setIsBizModalOpen(true);
      showToast('Please enter your business name first.');
      return;
    }

    if (!validateForm()) {
      showToast('Please fill all required recipient & product fields.');
      return;
    }

    const payload: OrderFormData = {
      ...formData,
      businessName: businessProfile.businessName,
      businessLogo: businessProfile.businessLogo,
    };
    setGeneratedLabel(payload);
    showToast('Shipping label generated successfully!');
  };

  const handleClearForm = () => {
    setFormData({
      businessName: businessProfile.businessName,
      businessLogo: businessProfile.businessLogo,
      fullName: '',
      mobileNumber: '',
      houseFlatNo: '',
      societyStreet: '',
      areaLocality: '',
      city: '',
      state: '',
      pincode: '',
      productName: '',
      quantity: '1',
      unitPrice: '',
      payment: 'Paid',
      courierDispatchedDate: getTodayDateString(),
    });
    setGeneratedLabel(null);
    setErrors({});
    showToast('Form cleared.');
  };

  const handleLoadSample = () => {
    const sampleBizName = businessProfile.businessName || 'Shree Ganesh Traders';
    // Sample logo if none
    const sampleLogo =
      businessProfile.businessLogo ||
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="40" viewBox="0 0 90 40"><rect width="90" height="40" rx="4" fill="%23000"/><text x="45" y="25" fill="%23fff" font-family="sans-serif" font-weight="900" font-size="14" text-anchor="middle">STORE</text></svg>`;

    const newBiz: BusinessProfile = {
      businessName: sampleBizName,
      businessLogo: sampleLogo,
    };
    setBusinessProfile(newBiz);
    try {
      localStorage.setItem(STORAGE_KEY_BIZ, JSON.stringify(newBiz));
    } catch (e) {
      console.error(e);
    }

    const sampleOrder: OrderFormData = {
      businessName: sampleBizName,
      businessLogo: sampleLogo,
      fullName: 'Vikramaditya Solanki',
      mobileNumber: '+91 98250 12345',
      houseFlatNo: 'B-304, Shivam Residency',
      societyStreet: 'Near Silver Oak Club, S.G. Highway',
      areaLocality: 'Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
      productName: 'Handcrafted Pure Cotton Kurta Set (Size L)',
      quantity: '2',
      unitPrice: '899',
      payment: 'COD',
      courierDispatchedDate: getTodayDateString(),
    };

    setFormData(sampleOrder);
    setGeneratedLabel(sampleOrder);
    setErrors({});
    showToast('Sample order loaded & label preview ready!');
  };

  const handlePrint = () => {
    if (!generatedLabel) {
      if (validateForm()) {
        const payload: OrderFormData = {
          ...formData,
          businessName: businessProfile.businessName || 'MY BUSINESS',
          businessLogo: businessProfile.businessLogo,
        };
        setGeneratedLabel(payload);
        setTimeout(() => {
          window.print();
        }, 150);
        return;
      } else {
        showToast('Please generate the label before printing.');
        return;
      }
    }
    window.print();
  };

  const handleDownloadPdf = async () => {
    let currentLabel = generatedLabel;
    if (!currentLabel) {
      if (validateForm()) {
        currentLabel = {
          ...formData,
          businessName: businessProfile.businessName || 'MY BUSINESS',
          businessLogo: businessProfile.businessLogo,
        };
        setGeneratedLabel(currentLabel);
      } else {
        showToast('Please fill required recipient & product details before downloading PDF.');
        return;
      }
    }

    try {
      setIsGeneratingPdf(true);
      const res = await generateAndDownloadPdf(currentLabel);
      setDownloadResult({
        url: res.blobUrl,
        filename: res.filename,
      });
      showToast('PDF generated! Direct download started.');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('Failed to generate PDF. Please verify details.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopySummary = () => {
    const activeData = generatedLabel || formData;
    const summary = `${activeData.businessName || 'BUSINESS'}
SHIP TO:
${activeData.fullName || '—'}
Mobile: ${activeData.mobileNumber || '—'}
${activeData.houseFlatNo}
${activeData.societyStreet}
${activeData.areaLocality}
${activeData.city}, ${activeData.state} - ${activeData.pincode}

Product: ${activeData.productName || '—'}
Qty: ${activeData.quantity || '—'}
Price: ₹${activeData.unitPrice || '—'}
Payment: ${activeData.payment}
Courier Dispatched: ${activeData.courierDispatchedDate}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    showToast('Order details copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const activeLabelData = generatedLabel || (formData.fullName ? formData : null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Business Setup Modal on First Open or Header Trigger */}
      <BusinessSetupModal
        isOpen={isBizModalOpen}
        initialProfile={businessProfile}
        onSave={handleSaveBusinessProfile}
        onClose={() => setIsBizModalOpen(false)}
        isInitialSetup={isInitialSetup}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-fade-in border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        businessProfile={businessProfile}
        onOpenBusinessSetup={() => setIsBizModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Input Form (Hidden on Print) */}
          <div className="no-print lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recipient &amp; Order Details
                </h2>
                <span className="text-xs text-slate-400">
                  Label generates directly with SHIP TO &amp; Order table
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearForm}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors py-1 px-2 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Form
              </button>
            </div>

            <form onSubmit={handleGenerateLabel} noValidate className="space-y-4">
              {/* SECTION 1: RECIPIENT / SHIP TO */}
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Recipient (SHIP TO) Information
                </span>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Customer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Vikramaditya Solanki"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.fullName
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="mobileNumber"
                    type="tel"
                    placeholder="e.g. +91 98250 12345"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors font-mono ${
                      errors.mobileNumber
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                    }`}
                  />
                  {errors.mobileNumber && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Address fields (Name ke turant baad) */}
                <div className="pt-1 space-y-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Immediate Delivery Address
                  </span>

                  <div>
                    <label
                      htmlFor="houseFlatNo"
                      className="block text-xs text-slate-600 mb-1 font-medium"
                    >
                      House / Flat No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="houseFlatNo"
                      type="text"
                      placeholder="e.g. B-304, Shivam Residency"
                      value={formData.houseFlatNo}
                      onChange={(e) => handleInputChange('houseFlatNo', e.target.value)}
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.houseFlatNo
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                      }`}
                    />
                    {errors.houseFlatNo && (
                      <p className="text-xs text-rose-600 mt-0.5">{errors.houseFlatNo}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="societyStreet"
                      className="block text-xs text-slate-600 mb-1 font-medium"
                    >
                      Society / Street <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="societyStreet"
                      type="text"
                      placeholder="e.g. Near Silver Oak Club, S.G. Highway"
                      value={formData.societyStreet}
                      onChange={(e) => handleInputChange('societyStreet', e.target.value)}
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.societyStreet
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                      }`}
                    />
                    {errors.societyStreet && (
                      <p className="text-xs text-rose-600 mt-0.5">{errors.societyStreet}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="areaLocality"
                      className="block text-xs text-slate-600 mb-1 font-medium"
                    >
                      Area / Locality <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="areaLocality"
                      type="text"
                      placeholder="e.g. Bodakdev"
                      value={formData.areaLocality}
                      onChange={(e) => handleInputChange('areaLocality', e.target.value)}
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.areaLocality
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                      }`}
                    />
                    {errors.areaLocality && (
                      <p className="text-xs text-rose-600 mt-0.5">{errors.areaLocality}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-xs text-slate-600 mb-1 font-medium"
                      >
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="e.g. Ahmedabad"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                          errors.city
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-xs text-rose-600 mt-0.5">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-xs text-slate-600 mb-1 font-medium"
                      >
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="state"
                        type="text"
                        placeholder="e.g. Gujarat"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                          errors.state
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                        }`}
                      />
                      {errors.state && (
                        <p className="text-xs text-rose-600 mt-0.5">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="pincode"
                        className="block text-xs text-slate-600 mb-1 font-medium"
                      >
                        Pincode <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="pincode"
                        type="text"
                        placeholder="e.g. 380054"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors font-mono ${
                          errors.pincode
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-xs text-rose-600 mt-0.5">{errors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRODUCT, QUANTITY & PRICING TABLE */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Product &amp; Pricing Breakdown
                </span>

                <div>
                  <label
                    htmlFor="productName"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    placeholder="e.g. Handcrafted Cotton Kurta Set"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.productName
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                    }`}
                  />
                  {errors.productName && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.productName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors font-mono ${
                        errors.quantity
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                      }`}
                    />
                    {errors.quantity && (
                      <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="unitPrice"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Unit Price (₹) <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2 text-sm font-semibold text-slate-400">
                        ₹
                      </span>
                      <input
                        id="unitPrice"
                        type="number"
                        placeholder="e.g. 899"
                        value={formData.unitPrice}
                        onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Calculated Total Preview */}
                {Number(formData.unitPrice) > 0 && (
                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs">
                    <span className="text-neutral-600 font-medium">Calculated Order Total:</span>
                    <span className="font-bold text-neutral-900 font-mono text-sm">
                      ₹{(Number(formData.unitPrice) * (Number(formData.quantity) || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* SECTION 3: PAYMENT & DISPATCHED DATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label
                    htmlFor="payment"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="payment"
                    value={formData.payment}
                    onChange={(e) =>
                      handleInputChange('payment', e.target.value as PaymentStatus)
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-900 font-medium"
                  >
                    <option value="Paid">Paid (Prepaid)</option>
                    <option value="COD">COD (Cash on Delivery)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="courierDispatchedDate"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Courier Dispatched Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="courierDispatchedDate"
                    type="date"
                    value={formData.courierDispatchedDate}
                    onChange={(e) =>
                      handleInputChange('courierDispatchedDate', e.target.value)
                    }
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors font-mono ${
                      errors.courierDispatchedDate
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                    }`}
                  />
                  {errors.courierDispatchedDate && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.courierDispatchedDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  Generate Label
                </button>

                <button
                  type="button"
                  onClick={handleClearForm}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Form
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Label Preview & Quick Actions */}
          <div className="lg:col-span-6 space-y-4">
            {/* Action Bar Above Preview (Hidden on Print) */}
            <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Label Output Preview
                </span>
                {generatedLabel && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ready
                  </span>
                )}
              </div>

              {/* Action Button: Download PDF */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
                  title="Download label as high-res 4x6 PDF"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>

              {/* Instant direct download links if automatic download is blocked by iframe */}
              {downloadResult && (
                <div className="w-full pt-3 mt-1 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold truncate max-w-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{downloadResult.filename}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={downloadResult.url}
                      download={downloadResult.filename}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save PDF File
                    </a>
                    <a
                      href={downloadResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs transition-colors"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Sticker Canvas Area (Centered) */}
            <div className="print-area-wrapper bg-slate-100 border border-slate-200/80 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px] relative overflow-x-auto">
              {activeLabelData ? (
                <div className="w-full flex justify-center">
                  <ShippingLabel
                    ref={labelRef}
                    data={activeLabelData}
                  />
                </div>
              ) : (
                <div className="no-print text-center max-w-sm py-12 px-4">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">
                    No Shipping Label Generated Yet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter customer order details on the left and click &ldquo;Generate Label&rdquo; to preview and download your packaging sticker.
                  </p>
                </div>
              )}
            </div>

            {/* Helpful Printing Advice / Summary Card */}
            {activeLabelData && (
              <div className="no-print bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between gap-4 shadow-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 block">
                    Custom Packaging Sticker Ready
                  </span>
                  <p className="text-slate-500">
                    Branded with {businessProfile.businessName || 'Business Name'} · SHIP TO formatted · No barcode · 4&quot; × 6&quot; or A4 sheet ready.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 py-4 bg-white text-center text-xs text-slate-500">
        <p>Customer Packaging Label Generator · Custom Business Branding &amp; Delivery Sticker Tool</p>
      </footer>
    </div>
  );
}
