import React, { useState, useRef } from 'react';
import { Building2, Upload, Trash2, ArrowRight, Store, Image as ImageIcon } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessSetupModalProps {
  isOpen: boolean;
  initialProfile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const BusinessSetupModal: React.FC<BusinessSetupModalProps> = ({
  isOpen,
  initialProfile,
  onSave,
  onClose,
  isInitialSetup = false,
}) => {
  const [businessName, setBusinessName] = useState(initialProfile.businessName || '');
  const [businessLogo, setBusinessLogo] = useState(initialProfile.businessLogo || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size should be less than 2MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBusinessLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBusinessLogo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }

    onSave({
      businessName: businessName.trim(),
      businessLogo,
    });
  };

  // Quick sample business fill for fast testing
  const handleSampleFill = () => {
    setBusinessName('Apex Trends & Apparel');
    // Clean SVG sample monogram logo
    const sampleSvgLogo = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40"><rect width="100" height="40" rx="4" fill="%23000"/><text x="50" y="25" fill="%23fff" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">APEX</text></svg>`;
    setBusinessLogo(sampleSvgLogo);
    setError('');
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {isInitialSetup ? 'Business Profile Setup' : 'Edit Business Details'}
            </h2>
            <p className="text-xs text-neutral-500">
              Apne business ka name aur logo dalein
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 mb-5 leading-relaxed">
          Your business name and logo will automatically appear at the top of all generated courier packaging labels.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name Input */}
          <div>
            <label
              htmlFor="bizNameInput"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1"
            >
              1. Business Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="bizNameInput"
                type="text"
                autoFocus
                placeholder="e.g. Krishna Fashion, TechNest, Apex Retail"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 font-medium"
              />
              <Building2 className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Business Logo Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              2. Business Logo Image <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>

            {businessLogo ? (
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-10 bg-white border border-neutral-200 rounded flex items-center justify-center p-1 overflow-hidden">
                    <img
                      src={businessLogo}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-800 block">Logo Uploaded</span>
                    <span className="text-[11px] text-neutral-500">Ready for label header</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Remove logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-50 rounded-lg p-4 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto mb-1.5">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-neutral-800">
                  Click to upload business logo
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  PNG, JPG, SVG or WebP (Max 2MB)
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">
              {error}
            </p>
          )}

          {/* Quick sample filler */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleSampleFill}
              className="text-neutral-500 hover:text-neutral-900 underline underline-offset-2 cursor-pointer"
            >
              Fill Sample Business Info
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {!isInitialSetup && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Continue to Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
