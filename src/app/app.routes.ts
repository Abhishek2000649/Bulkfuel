import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Profile } from './pages/user/profile/profile';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { Dashboard as DeliveryDashboard } from './pages/delivery/dashboard/dashboard';
import { guardGuard } from './core/guards/guard-guard';
import { SignUp } from './pages/auth/sign-up/sign-up';
import { Login } from './pages/auth/login/login';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomeProduct } from './pages/admin/product/home-product/home-product';
import { AddProduct } from './pages/admin/product/add-product/add-product';
import { EditProduct } from './pages/admin/product/edit-product/edit-product';
import { HomeCategory } from './pages/admin/category/home-category/home-category';
import { AddCategory } from './pages/admin/category/add-category/add-category';
import { EditCategory } from './pages/admin/category/edit-category/edit-category';
import { HomeStock } from './pages/admin/stock/home-stock/home-stock';
import { AddStock } from './pages/admin/stock/add-stock/add-stock';
import { EditStock } from './pages/admin/stock/edit-stock/edit-stock';
import { HomeWarehouse } from './pages/admin/warehouse/home-warehouse/home-warehouse';
import { AddWarehouse } from './pages/admin/warehouse/add-warehouse/add-warehouse';
import { EditWarehouse } from './pages/admin/warehouse/edit-warehouse/edit-warehouse';
import { HomeUserManagement } from './pages/admin/userManagement/home-user-management/home-user-management';
import { AddUserManagement } from './pages/admin/userManagement/add-user-management/add-user-management';
import { EditUserManagement } from './pages/admin/userManagement/edit-user-management/edit-user-management';
import { HomeOrder } from './pages/admin/order/home-order/home-order';
import { Cart } from './pages/user/cart/cart';
import { Checkout } from './pages/user/checkout/checkout';
import { Orders } from './pages/user/orders/orders';
import { Orders as DeliveryOrders } from './pages/delivery/orders/orders';
import { Available } from './pages/delivery/available/available';
import { OrderHistory } from './pages/admin/order/order-history/order-history';
import { Profile as ProfileUpdate } from './shared/profile/profile';
import { Settlement } from './pages/admin/settlement/settlement/settlement';
import { VerifyOtp } from './pages/auth/verify-otp/verify-otp';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { About } from './shared/about/about';
import { Privacy } from './shared/privacy/privacy';
import { Address } from './pages/user/address/address';
import { Terms } from './shared/terms/terms';
import { UserContact } from './pages/user/user-contact/user-contact';
import { AdminContact } from './pages/admin/admin-contact/admin-contact';
import { DeliveryContact } from './pages/delivery/delivery-contact/delivery-contact';

export const routes: Routes = [

  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Profile },
      { path: 'about-us', component: About },
      { path: 'privacy-policy', component: Privacy },
      { path: 'terms', component: Terms },

      {
        path: 'profile-update',
        component: ProfileUpdate,
        canActivate: [authGuard(['ADMIN', 'USER', 'delivery_agent'])],
      },
      {
        path: 'admin',
        canActivate: [authGuard(['ADMIN'])],
        children: [
          { path: '', component: Dashboard },
          {
            path: 'product', children: [
              { path: '', component: HomeProduct },
              { path: 'add', component: AddProduct },
              { path: 'edit/:id', component: EditProduct },
            ]
          },
          {
            path: 'category', children: [
              { path: '', component: HomeCategory },
              { path: 'add', component: AddCategory },
              { path: 'edit/:id', component: EditCategory },
            ]
          },
          {
            path: 'stock', children: [
              { path: '', component: HomeStock },
              { path: 'add', component: AddStock },
              { path: 'edit/:id', component: EditStock },
            ]
          },
          {
            path: 'warehouse', children: [
              { path: '', component: HomeWarehouse },
              { path: 'add', component: AddWarehouse },
              { path: 'edit/:id', component: EditWarehouse },
            ]
          },
          {
            path: 'userManagement', children: [
              { path: '', component: HomeUserManagement },
              { path: 'add', component: AddUserManagement },
              { path: 'edit/:id', component: EditUserManagement },
            ]
          },
          { path: 'order', component: HomeOrder },
          { path: 'order-history', component: OrderHistory },
          { path: 'settlement', component: Settlement },
          { path: 'contact', component: AdminContact },

        ],
      },
      {
        path: 'user',
        canActivate: [authGuard(['USER'])],
        children: [{ path: '', component: Profile },
        { path: 'cart', component: Cart },
        { path: 'checkout', component: Checkout },
        { path: 'orders', component: Orders },
        { path: 'address', component: Address },
        { path: 'contact', component: UserContact },


        ],
      },
      {
        path: 'delivery',
        canActivate: [authGuard(['delivery_agent'])],
        children: [{ path: '', component: DeliveryDashboard },
        { path: 'available', component: Available },
        { path: 'orders', component: DeliveryOrders },
        { path: 'contact', component: DeliveryContact },

        ],
      },
    ],
  },
  {
    path: '',
    component: AuthLayout,
    children: [

      { path: 'login', component: Login, canActivate: [guardGuard] },
      { path: 'signUp', component: SignUp, canActivate: [guardGuard] },
      { path: 'verify-otp', component: VerifyOtp, canActivate: [guardGuard] },
      { path: 'forgot-password', component: ForgotPassword, canActivate: [guardGuard] },


    ],
  },
  // { path: '**', redirectTo: '' },
  {
    path: '**',
    canActivate: [guardGuard],
    component: Login, // dummy component
  },

];
