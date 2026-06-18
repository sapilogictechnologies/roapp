// Central API registry — imports all endpoint modules to ensure registration
// then re-exports all hooks for use throughout the app

import './authApi';
import './productApi';
import './orderApi';
import './pricingApi';
import './paymentApi';
import './billingApi';
import './jarApi';
import './subscriptionApi';
import './eventApi';
import './notificationApi';
import './settingsApi';
import './reportApi';
import './customerApi';
import './messageApi';

export * from './authApi';
export * from './productApi';
export * from './orderApi';
export * from './pricingApi';
export * from './paymentApi';
export * from './billingApi';
export * from './jarApi';
export * from './subscriptionApi';
export * from './eventApi';
export * from './notificationApi';
export * from './settingsApi';
export * from './reportApi';
export * from './customerApi';
export * from './messageApi';
