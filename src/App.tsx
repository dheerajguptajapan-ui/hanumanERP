import React, { useState } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { NewSale } from './views/NewSale';
import { Invoices } from './views/Invoices';
import { Settings } from './views/Settings';
import { Customers } from './views/Customers';
import { Vendors } from './views/Vendors';
import { Quotations } from './views/Quotations';
import { SalesOrders } from './views/SalesOrders';
import { Deliveries } from './views/Deliveries';
import { PurchaseOrders } from './views/PurchaseOrders';
import { NewPurchaseOrder } from './views/NewPurchaseOrder';
import { Reports } from './views/Reports';
import { NewItem } from './views/NewItem';
import { NewCustomer } from './views/NewCustomer';
import { NewVendor } from './views/NewVendor';
import { Expenses } from './views/Expenses';
import { NewExpense } from './views/NewExpense';
import { NewSalesOrder } from './views/NewSalesOrder';
import { NewInvoice } from './views/NewInvoice';
import { AdjustStock } from './views/AdjustStock';
import { SalesReceipts } from './views/SalesReceipts';
import { NewSalesReceipt } from './views/NewSalesReceipt';
import { PaymentsReceived } from './views/PaymentsReceived';
import { NewPayment } from './views/NewPayment';

import { Bills } from './views/Bills';
import { NewBill } from './views/NewBill';
import { PaymentsMade } from './views/PaymentsMade';
import { VendorCredits } from './views/VendorCredits';
import { NewVendorCredit } from './views/NewVendorCredit';
import { InventoryAdjustments } from './views/InventoryAdjustments';
import { Packages } from './views/Packages';
import { Shipments } from './views/Shipments';
import { MoveOrders } from './views/MoveOrders';
import { Putaways } from './views/Putaways';
import { SalesReturns } from './views/SalesReturns';
import { CreditNotes } from './views/CreditNotes';
import { PermissionsProvider } from './hooks/usePermissions';

const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
  cursorType: 'pointer',
});

import { seedSampleData } from './utils/sampleData';
import { db } from './db';
import { persistStorage } from './utils/backup';
import { seedNumberSeries } from './utils/numberSeries';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [isCloning, setIsCloning] = useState(false);
  const [convertingPoId, setConvertingPoId] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    const initData = async () => {
      try {
        console.log('Initializing Hanuman ERP...');
        const productCount = await db.products.count();
        console.log('Current product count:', productCount);
        if (productCount === 0) {
          console.log('Seeding initial hardware data...');
          await seedSampleData();
        }
        
        // RBAC Initialization
        const roleCount = await db.roles.count();
        if (roleCount === 0) {
          const adminRoleId = await db.roles.add({
            name: 'Admin',
            description: 'Unrestricted access to all modules.',
            permissions: {} // Admin logic in usePermissions handles empty perms
          });
          
          await db.users.add({
            name: 'Dheeraj Gupta',
            email: 'djindosakura@zohomail.jp',
            roleId: adminRoleId as number,
            status: 'active'
          });
        }

        // Number Series Initialization
        await seedNumberSeries();

        await persistStorage();
        console.log('Initialization complete.');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    initData();
  }, []);

  const handleViewChange = (view: string, id?: number, clone = false, poId?: number, extra?: any) => {
    setActiveView(view);
    setEditingId(id);
    setIsCloning(clone);
    setConvertingPoId(poId);
    if (extra?.filter) {
      // Logic for filters if needed, or pass via state
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'inventory':
        return <Inventory onViewChange={handleViewChange} />;
      case 'purchase-orders':
        return <PurchaseOrders onViewChange={handleViewChange} />;
      case 'new-purchase-order':
        return <NewPurchaseOrder editingId={editingId} onClose={() => handleViewChange('purchase-orders')} />;
      case 'bills':
        return <Bills onViewChange={handleViewChange} />;
      case 'new-bill':
        return <NewBill editingId={editingId} convertingPoId={convertingPoId} onClose={() => handleViewChange('bills')} />;
      case 'customers':
        return <Customers onViewChange={handleViewChange} />;
      case 'vendors':
        return <Vendors onViewChange={handleViewChange} />;
      case 'new-vendor':
        return <NewVendor editingId={editingId} onClose={() => handleViewChange('vendors')} />;
      case 'expenses':
        return <Expenses onViewChange={handleViewChange} />;
      case 'new-expense':
        return <NewExpense editingId={editingId} onClose={() => handleViewChange('expenses')} />;
      case 'quotations':
        return <Quotations />;
      case 'sales_orders':
        return <SalesOrders onViewChange={handleViewChange} />;
      case 'deliveries':
        return <Deliveries />;
      case 'new-sales-order':
        return <NewSalesOrder editingId={editingId} isCloning={isCloning} onClose={() => handleViewChange('sales_orders')} />;
      case 'sales':
        return <NewSale editingId={editingId} isCloning={isCloning} onClose={() => handleViewChange('sales_orders')} />;
      case 'new-sale':
        return <NewSale editingId={editingId} isCloning={isCloning} onClose={() => handleViewChange('sales_orders')} />;
      case 'invoices':
        return <Invoices onViewChange={handleViewChange} />;
      case 'new-invoice':
        return <NewInvoice editingId={editingId} isCloning={isCloning} onClose={() => handleViewChange('invoices')} />;
      case 'convert-to-invoice':
        return <NewInvoice salesOrderId={editingId} onClose={() => handleViewChange('invoices')} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings onBack={() => handleViewChange('dashboard')} />;
      case 'new-item':
        return <NewItem editingId={editingId} isCloning={isCloning} onClose={() => handleViewChange('inventory')} />;
      case 'new-customer':
        return <NewCustomer editingId={editingId} onClose={() => handleViewChange('customers')} />;
      case 'adjust-stock':
        return <AdjustStock itemId={editingId!} onClose={() => handleViewChange('inventory')} />;
      case 'sales-receipts':
        return <SalesReceipts onViewChange={handleViewChange} />;
      case 'new-sales-receipt':
        return <NewSalesReceipt editingId={editingId} onClose={() => handleViewChange('sales-receipts')} />;
      case 'payments-made':
        return <PaymentsMade onViewChange={handleViewChange} />;
      case 'vendor-credits':
        return <VendorCredits onViewChange={handleViewChange} />;
      case 'new-vendor-credit':
        return <NewVendorCredit editingId={editingId} onClose={() => handleViewChange('vendor-credits')} />;
      case 'new-payment':
        return <NewPayment opened={true} onClose={() => handleViewChange('invoices')} />;
      case 'inventory-adjustments':
        return <InventoryAdjustments onViewChange={handleViewChange} />;
      case 'packages':
        return <Packages onViewChange={handleViewChange} />;
      case 'shipments':
        return <Shipments />;
      case 'move-orders':
        return <MoveOrders />;
      case 'putaways':
        return <Putaways />;
      case 'payments-received':
        return <PaymentsReceived />;
      case 'sales-returns':
        return <SalesReturns onViewChange={handleViewChange} />;
      case 'credit-notes':
        return <CreditNotes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MantineProvider theme={theme}>
      <PermissionsProvider>
        <Notifications />
        <Layout activeView={activeView} onViewChange={handleViewChange}>
          {renderView()}
        </Layout>
      </PermissionsProvider>
    </MantineProvider>
  );
}

export default App;
