import React, { forwardRef } from 'react';
import { OrderFormData } from '../types';

interface ShippingLabelProps {
  data: OrderFormData;
}

/**
 * Professional Black & White Shipping Label / Courier Packaging Sticker
 * Custom branded with Business Name & Logo, "SHIP TO:" format, immediate address,
 * itemized order table (Product, Qty, Price, Total), Payment & Courier Date.
 * Strictly without barcode as requested.
 */
export const ShippingLabel = forwardRef<HTMLDivElement, ShippingLabelProps>(
  ({ data }, ref) => {
    // Format dispatch date nicely (e.g. DD/MM/YYYY)
    const formattedDate = data.courierDispatchedDate
      ? (() => {
          try {
            const parts = data.courierDispatchedDate.split('-');
            if (parts.length === 3) {
              return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return data.courierDispatchedDate;
          } catch {
            return data.courierDispatchedDate;
          }
        })()
      : '—';

    const unitPriceNum = Number(data.unitPrice) || 0;
    const qtyNum = Number(data.quantity) || 1;
    const calculatedTotal = (unitPriceNum * qtyNum).toLocaleString('en-IN');
    const displayUnitPrice = unitPriceNum > 0 ? unitPriceNum.toLocaleString('en-IN') : '—';

    return (
      <div
        ref={ref}
        id="printable-shipping-label"
        className="printable-shipping-sticker bg-white text-black font-sans w-full max-w-[420px] mx-auto border-2 border-black selection:bg-neutral-200 select-text"
        style={{
          boxSizing: 'border-box',
          lineHeight: 1.35,
        }}
      >
        {/* TOP HEADER: BUSINESS NAME & BUSINESS LOGO (REPLACES "SHIPPING LABEL" & PRIORITY TAG) */}
        <div className="border-b-2 border-black px-4 py-3 bg-white flex items-center justify-between gap-3 min-h-[64px]">
          {/* Left: Business Name */}
          <div className="flex-1">
            <h1 className="text-xl font-black tracking-tight uppercase text-black m-0 leading-tight break-words">
              {data.businessName || 'YOUR BUSINESS NAME'}
            </h1>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-600 block mt-0.5">
              Packaging &amp; Delivery Sticker
            </span>
          </div>

          {/* Right: Business Logo (Replaces priority badge) */}
          <div className="shrink-0 flex items-center justify-end">
            {data.businessLogo ? (
              <img
                src={data.businessLogo}
                alt="Business Logo"
                className="max-h-12 max-w-[110px] object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="border-2 border-dashed border-neutral-400 rounded px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">
                LOGO
              </div>
            )}
          </div>
        </div>

        {/* SHIP TO SECTION: IMMEDIATELY FOLLOWED BY CUSTOMER NAME, MOBILE & ADDRESS */}
        <div className="p-3.5 border-b-2 border-black">
          <div className="flex items-center justify-between mb-1 border-b border-black pb-1">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              SHIP TO:
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-600">
              RECIPIENT
            </span>
          </div>

          {/* Customer Name & Mobile */}
          <div className="mt-1.5">
            <span className="block text-lg font-black tracking-tight text-black break-words leading-tight">
              {data.fullName || '—'}
            </span>
            <span className="block text-sm font-extrabold font-mono tracking-wide text-black mt-0.5">
              Mobile: {data.mobileNumber || '—'}
            </span>
          </div>

          {/* Immediate Delivery Address */}
          <div className="mt-2 pt-2 border-t border-dotted border-neutral-400 text-sm font-semibold text-black space-y-0.5 leading-snug break-words">
            {data.houseFlatNo && <p className="m-0">{data.houseFlatNo}</p>}
            {data.societyStreet && <p className="m-0">{data.societyStreet}</p>}
            {data.areaLocality && <p className="m-0">{data.areaLocality}</p>}
            <p className="m-0 font-bold text-[15px] pt-1">
              {[data.city, data.state].filter(Boolean).join(', ')}
              {data.pincode ? ` - ${data.pincode}` : ''}
            </p>
          </div>
        </div>

        {/* ORDER DETAILS TABLE: PRODUCT NAME, QUANTITY, PRICE, TOTAL PRICE (SMALL / COMPACT) */}
        <div className="border-b-2 border-black">
          <div className="px-3.5 py-1.5 bg-neutral-100 border-b border-black flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-black">
              ORDER ITEMS &amp; DETAILS
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black text-[10px] font-black uppercase tracking-wider bg-white">
                <th className="py-1.5 px-3 border-r border-black">Product Name</th>
                <th className="py-1.5 px-2.5 text-center border-r border-black w-12">Qty</th>
                <th className="py-1.5 px-2.5 text-right border-r border-black w-20">Price</th>
                <th className="py-1.5 px-3 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black font-semibold">
                <td className="py-2.5 px-3 border-r border-black break-words leading-snug">
                  <span className="font-bold text-xs text-black block">
                    {data.productName || '—'}
                  </span>
                </td>
                <td className="py-2.5 px-2.5 text-center border-r border-black font-mono font-bold text-sm">
                  {data.quantity || '1'}
                </td>
                <td className="py-2.5 px-2.5 text-right border-r border-black font-mono font-medium">
                  {unitPriceNum > 0 ? `₹${displayUnitPrice}` : '—'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-sm">
                  {unitPriceNum > 0 ? `₹${calculatedTotal}` : '—'}
                </td>
              </tr>
            </tbody>
            {unitPriceNum > 0 && (
              <tfoot>
                <tr className="bg-neutral-50 font-black text-xs">
                  <td colSpan={3} className="py-1.5 px-3 text-right uppercase border-r border-black tracking-wider text-[11px]">
                    Total Amount:
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono text-sm font-black">
                    ₹{calculatedTotal}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAYMENT MODE & COURIER DISPATCHED DATE (SIDE BY SIDE) */}
        <div className="grid grid-cols-2 divide-x-2 divide-black">
          {/* Payment */}
          <div className="p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-black">
              Payment:
            </span>
            <div className="mt-1">
              {data.payment === 'COD' ? (
                <div className="border-2 border-black bg-black text-white px-2 py-1 text-center font-black text-xs tracking-wider uppercase">
                  COD (Collect Cash)
                </div>
              ) : (
                <div className="border-2 border-black px-2 py-1 text-center font-black text-xs tracking-wider uppercase">
                  PAID (Prepaid)
                </div>
              )}
            </div>
          </div>

          {/* Courier Dispatched */}
          <div className="p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-black">
              Courier Dispatched:
            </span>
            <span className="block text-sm font-extrabold font-mono tracking-wide text-black mt-1">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ShippingLabel.displayName = 'ShippingLabel';
