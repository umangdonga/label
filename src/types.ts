export type PaymentStatus = 'Paid' | 'COD';

export interface BusinessProfile {
  businessName: string;
  businessLogo: string; // Base64 data URL or image path
}

export interface OrderFormData {
  // Business details
  businessName: string;
  businessLogo: string;

  // Recipient / Ship To
  fullName: string;
  mobileNumber: string;
  houseFlatNo: string;
  societyStreet: string;
  areaLocality: string;
  city: string;
  state: string;
  pincode: string;

  // Product & Order Breakdown
  productName: string;
  quantity: string | number;
  unitPrice: string | number;
  totalPrice?: string | number;

  // Dispatch & Payment
  payment: PaymentStatus;
  courierDispatchedDate: string;
}

export type FormErrors = Partial<Record<keyof OrderFormData, string>>;
