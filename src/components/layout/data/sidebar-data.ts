import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Warehouse,
  Package,
  Truck,
  ShoppingCart,
  Command,
  Layers,
  CreditCard,
  Nfc,
  Boxes,
  Library,
  TicketPercent,
  ClipboardList,
  TrendingUp,
  BarChart3,
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
    {
      title: 'Catalog',
      items: [
        {
          title: 'Card Frameworks',
          url: '/admin/card-frameworks',
          icon: Layers,
        },
        {
          title: 'Card Templates',
          url: '/admin/cards',
          icon: CreditCard,
        },
        {
          title: 'NFC Products',
          url: '/admin/nfc',
          icon: Nfc,
        },
      ],
    },
    {
      title: 'Commerce',
      items: [
        {
          title: 'Products',
          url: '/admin/products',
          icon: Boxes,
        },
        {
          title: 'Collections',
          url: '/admin/collections',
          icon: Library,
        },
        {
          title: 'Vouchers',
          url: '/admin/vouchers',
          icon: TicketPercent,
        },
        {
          title: 'Orders',
          url: '/admin/orders',
          icon: ClipboardList,
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          title: 'Revenue',
          url: '/admin/revenue',
          icon: TrendingUp,
        },
        {
          title: 'Analytics',
          url: '/admin/analytics',
          icon: BarChart3,
        },
      ],
    },
  ],
}
