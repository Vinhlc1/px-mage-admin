import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Warehouse,
  Package,
  Truck,
  ShoppingCart,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'PX Mage',
      logo: Command,
      plan: 'Admin Portal',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/admin',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          title: 'Accounts',
          url: '/admin/accounts',
          icon: Users,
        },
        {
          title: 'Roles',
          url: '/admin/roles',
          icon: ShieldCheck,
        },
        {
          title: 'Warehouses',
          url: '/admin/warehouses',
          icon: Warehouse,
        },
        {
          title: 'Inventory',
          url: '/admin/inventory',
          icon: Package,
        },
        {
          title: 'Suppliers',
          url: '/admin/suppliers',
          icon: Truck,
        },
        {
          title: 'Purchase Orders',
          url: '/admin/purchase-orders',
          icon: ShoppingCart,
        },
      ],
    },
  ],
}
