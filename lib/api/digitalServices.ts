import { apiGet } from '@/lib/api/axios';

export interface ApiResponse<T> {
  code: number;
  status: boolean;
  data: T;
}

export type DigitalServiceCategory =
  | 'TELCO'
  | 'DISCO'
  | 'CABLE'
  | 'EDUCATION'
  | 'INSURANCE'
  | 'OTHER_SERVICES';

export function getDigitalServiceCategories() {
  return apiGet<ApiResponse<DigitalServiceCategory[]>>(
    '/api/v1/digital-services/categories'
  );
}

export interface DigitalServiceFormField {
  path: string;
  label: string;
  type: string;
  required: boolean;
  readOnly: boolean;
  value: string | number | boolean | null;
  minimum: number | null;
  maximum: number | null;
  pattern: string | null;
}

export interface DigitalServiceProduct {
  code: string;
  tenantId: string;
  category: DigitalServiceCategory;
  name: string;
  fixedAmountMinor: null | string | number
  minimumMinor: null | string | number
  maximumMinor: null | string | number
  currency: string;
  active: boolean;
  serviceId: string;
  variationCode: null | string | number;
  profile: {
    flow: string;
    selectors: Record<string, unknown>;
    purchasable: boolean;
    unavailableReason: string | null;
    rule: {
      flow: string;
      maxQuantity: number;
      phoneRecipient: boolean;
      serverPriced: boolean;
      fields: Record<string, unknown>;
      version: number;
    };
    allowedFields: string[];
    requiredFields: string[];
  };
  formFields: DigitalServiceFormField[];
  requiredFields: string[];
  allowedFields: string[];
}

export interface DigitalServiceBiller {
  billerCode: string;
  billerName: string;
  tenantId: string;
  category: DigitalServiceCategory;
  products: DigitalServiceProduct[];
}

export function getDigitalServiceCatalogues(category: DigitalServiceCategory, page: number = 0, size: number = 20) {
  return apiGet<ApiResponse<DigitalServiceBiller[]>>(
    `/api/v1/digital-services/catalogue/grouped?category=${category}&page=${page}&size=${size}`
  );
}
