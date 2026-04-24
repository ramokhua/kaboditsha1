// frontend/src/utils/constants.js

export const ROLES = {
  APPLICANT: 'APPLICANT',
  STAFF: 'STAFF',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
};

export const SETTLEMENT_TYPES = {
  CITY: 'CITY',
  TOWN: 'TOWN',
  VILLAGE: 'VILLAGE',
  FARM: 'FARM'
};

export const APPLICATION_STATUS = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  DOCUMENTS_VERIFIED: 'DOCUMENTS_VERIFIED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

export const REGIONS = [
  'Central',
  'North-West',
  'Kgatleng',
  'Kweneng',
  'Southern',
  'South-East',
  'Kgalagadi',
  'Ghanzi',
  'North-East'
];

export const DOCUMENT_TYPES = [
  'Omang',
  'Marriage Certificate',
  'Proof of Residence',
  'Pay Slip',
  'Passport Photo',
  'Declaration Form'
];

export const STATUS_COLORS = {
  [APPLICATION_STATUS.SUBMITTED]: 'badge-info',
  [APPLICATION_STATUS.UNDER_REVIEW]: 'badge-warning',
  [APPLICATION_STATUS.DOCUMENTS_VERIFIED]: 'badge-success',
  [APPLICATION_STATUS.APPROVED]: 'badge-success',
  [APPLICATION_STATUS.REJECTED]: 'badge-error',
  [APPLICATION_STATUS.WITHDRAWN]: 'badge-error'
};

export const BOTSWANA_PHONE_PREFIXES = {
  Gaborone: '3',
  Francistown: '2',
  Maun: '6',
  Mochudi: '5',
  Molepolole: '5',
  Kanye: '5',
  Ramotswa: '5',
  Kasane: '6',
  Tsabong: '6',
  Ghanzi: '6',
  Masunga: '2',
  Serowe: '4',
  Palapye: '4',
  Mahalapye: '4',
  Bobonong: '2',
  Jwaneng: '5'
};