import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import CustomerLayout from '../components/layout/CustomerLayout';

// Public
const Home = lazy(() => import('../pages/public/Home'));
const Products = lazy(() => import('../pages/public/Products'));
const Cart = lazy(() => import('../pages/public/Cart'));
const Checkout = Cart; // Cart handles all checkout steps
const ServiceArea = lazy(() => import('../pages/public/ServiceArea'));
const EventBooking = lazy(() => import('../pages/public/EventBooking'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Privacy = lazy(() => import('../pages/public/Privacy'));
const RefundPolicy = lazy(() => import('../pages/public/RefundPolicy'));
const DeliveryPolicy = lazy(() => import('../pages/public/DeliveryPolicy'));
const JarReturnPolicy = lazy(() => import('../pages/public/JarReturnPolicy'));
const PaymentHelp = lazy(() => import('../pages/public/PaymentHelp'));

// Auth
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

// Customer
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const MyOrders = lazy(() => import('../pages/customer/MyOrders'));
const OrderDetail = lazy(() => import('../pages/customer/OrderDetail'));
const MyBills = lazy(() => import('../pages/customer/MyBills'));
const MyPayments = lazy(() => import('../pages/customer/MyPayments'));
const SubmitPayment = lazy(() => import('../pages/customer/SubmitPayment'));
const JarStatus = lazy(() => import('../pages/customer/JarStatus'));
const MySubscriptions = lazy(() => import('../pages/customer/MySubscriptions'));
const MyEvents = lazy(() => import('../pages/customer/MyEvents'));
const SavedAddresses = lazy(() => import('../pages/customer/SavedAddresses'));
const MyNotifications = lazy(() => import('../pages/customer/MyNotifications'));
const CustomerMessages = lazy(() => import('../pages/customer/Messages'));
const Profile = lazy(() => import('../pages/customer/Profile'));

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminCustomers = lazy(() => import('../pages/admin/Customers'));
const AdminProducts = lazy(() => import('../pages/admin/Products'));
const AdminCategories = lazy(() => import('../pages/admin/Categories'));
const AdminOrders = lazy(() => import('../pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('../pages/admin/OrderDetail'));
const AdminPricing = lazy(() => import('../pages/admin/Pricing'));
const AdminTimeSlots = lazy(() => import('../pages/admin/TimeSlots'));
const AdminPayments = lazy(() => import('../pages/admin/Payments'));
const AdminBills = lazy(() => import('../pages/admin/Bills'));
const AdminJars = lazy(() => import('../pages/admin/Jars'));
const AdminSubscriptions = lazy(() => import('../pages/admin/Subscriptions'));
const AdminEvents = lazy(() => import('../pages/admin/Events'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));
const AdminCoupons = lazy(() => import('../pages/admin/Coupons'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const AdminServiceAreas = lazy(() => import('../pages/admin/ServiceAreas'));
const AdminLogs = lazy(() => import('../pages/admin/Logs'));
const AdminMessages = lazy(() => import('../pages/admin/Messages'));

const Loader = () => <div className="p-8 text-center text-gray-500">Loading...</div>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/service-area" element={<ServiceArea />} />
          <Route path="/event-booking" element={<EventBooking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/delivery-policy" element={<DeliveryPolicy />} />
          <Route path="/jar-return-policy" element={<JarReturnPolicy />} />
          <Route path="/payment-help" element={<PaymentHelp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected public-style pages — require login */}
        <Route element={<ProtectedRoute><PublicLayout /></ProtectedRoute>}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Cart />} />
        </Route>

        {/* Customer routes - both /dashboard and /customer/dashboard work */}
        <Route element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/bills" element={<MyBills />} />
          <Route path="/payments" element={<MyPayments />} />
          <Route path="/payments/submit" element={<SubmitPayment />} />
          <Route path="/jars" element={<JarStatus />} />
          <Route path="/subscriptions" element={<MySubscriptions />} />
          <Route path="/events" element={<MyEvents />} />
          <Route path="/customer/events" element={<MyEvents />} />
          <Route path="/addresses" element={<SavedAddresses />} />
          <Route path="/notifications" element={<MyNotifications />} />
          <Route path="/messages" element={<CustomerMessages />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin routes - both /admin and /admin/dashboard work */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/time-slots" element={<AdminTimeSlots />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/bills" element={<AdminBills />} />
          <Route path="/admin/jars" element={<AdminJars />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/service-areas" element={<AdminServiceAreas />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
