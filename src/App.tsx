import React, { useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import { Layout } from './components/Layout';
import { SetupWizard } from './components/SetupWizard';
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
import { db } from './db';
import { persistStorage } from './utils/backup';

const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
  cursorType: 'pointer',
});

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [isCloning, setIsCloning] = useState(false);
  const [convertingPoId, setConvertingPoId] = useState<number | undefined>(undefined);
  const [setupOpen, setSetupOpen] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await persistStorage();

        // Check if the app has been configured (settings exist)
        const settingsCount = await db.settings.count();
        const isFirstRun = settingsCount === 0;

        setSetupOpen(isFirstRun);
        setAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppReady(true); // Show app anyway so user isn't locked out
      }
    };
    initApp();
  }, []);

  const handleSetupComplete = () => {
    setSetupOpen(false);
  };

  const handleViewChange = (view: string, id?: number, clone = false, poId?: number, _extra?: any) => {
    setActiveView(view);
    setEditingId(id);
    setIsCloning(clone);
    setConvertingPoId(poId);
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
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  if (!appReady) {
    return (
      <MantineProvider theme={theme}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, sans-serif',
          flexDirection: 'column',
          gap: 16,
          color: '#495057',
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #e9ecef',
            borderTop: '4px solid #1971C2',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ margin: 0, fontSize: 14 }}>Loading Inventory System...</p>
        </div>
      </MantineProvider>
    );
  }

  if (activeView === 'settings') {
    return (
      <MantineProvider theme={theme}>
        <PermissionsProvider>
          <Notifications />
          <SetupWizard opened={setupOpen} onComplete={handleSetupComplete} />
          <Settings onBack={() => handleViewChange('dashboard')} />
        </PermissionsProvider>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={theme}>
      <PermissionsProvider>
        <Notifications />
        <SetupWizard opened={setupOpen} onComplete={handleSetupComplete} />
        <Layout activeView={activeView} onViewChange={handleViewChange}>
          {renderView()}
        </Layout>
      </PermissionsProvider>
    </MantineProvider>
  );
}

export default App;
