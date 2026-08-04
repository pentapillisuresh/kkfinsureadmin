export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  PAID: 'paid',
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  MATURED: 'matured',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const PARTNER_TYPES = {
  REFERRAL: 'referral',
  AUTHORISED: 'authorised',
  HNI: 'hni',
  NONE: 'none',
};

export const INVESTMENT_STATUS = {
  ACTIVE: 'active',
  MATURED: 'matured',
  CLOSED: 'closed',
};