import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Stack, 
  Text, 
  TextInput,
  ActionIcon,
  Button,
  Box,
  ScrollArea,
  rem,
  UnstyledButton,
  Grid,
  Menu,
  ThemeIcon,
  Center,
  Badge
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  Search, 
  Star, 
  ChevronDown, 
  Plus, 
  MoreVertical,
  Home,
  Users,
  Folder,
  Activity,
  Zap,
  Settings,
  Share2,
  Calendar,
  Package,
  Calculator,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  History,
  TrendingUp,
  BarChart2,
  ArrowLeft,
  Filter,
  Download,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface ReportDefinition {
  id: string;
  name: string;
  category: string;
  createdBy: string;
  lastVisited: string;
  isFavorite: boolean;
}

const REPORT_CATEGORIES = [
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'valuation', label: 'Inventory Valuation', icon: Calculator },
  { id: 'receivables', label: 'Receivables', icon: ArrowUpRight },
  { id: 'payments_received', label: 'Payments Received', icon: CreditCard },
  { id: 'payables', label: 'Payables', icon: ArrowDownLeft },
  { id: 'purchases', label: 'Purchases and Expenses', icon: BarChart2 },
  { id: 'activity', label: 'Activity', icon: History },
  { id: 'automation', label: 'Automation', icon: Zap },
];

const INITIAL_REPORTS: ReportDefinition[] = [
  { id: '1', name: 'Sales by Customer', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '2', name: 'Sales by Item', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '3', name: 'Order Fulfillment By Item', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '4', name: 'Sales Return History', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '5', name: 'Sales by Category', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '6', name: 'Sales by Sales Person', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '7', name: 'Sales Summary', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '8', name: 'Profit By Item', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '9', name: 'Sales Channel Integrations Sync Summary', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '10', name: 'Inventory Summary', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '11', name: 'Committed Stock Details', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '12', name: 'Inventory Aging Summary', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '13', name: 'Stock Summary', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '14', name: 'Inventory Adjustment Summary', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '15', name: 'Inventory Adjustment Details', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '16', name: 'Packing History', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '17', name: 'Shipment Details', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '18', name: 'Inventory Turnover By Quantity', category: 'Inventory', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '19', name: 'Inventory Valuation Summary', category: 'Inventory Valuation', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '20', name: 'FIFO Cost Lot Tracking', category: 'Inventory Valuation', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '21', name: 'ABC classification', category: 'Inventory Valuation', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '22', name: 'Inventory Turnover By Amount', category: 'Inventory Valuation', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '23', name: 'Weighted Average Costing Summary', category: 'Inventory Valuation', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '24', name: 'Invoice Details', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '25', name: 'Sales Order Details', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '26', name: 'Customer Balance Summary', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '27', name: 'Receivable Summary', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '28', name: 'Receivable Details', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '29', name: 'Payments Received', category: 'Payments Received', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '30', name: 'Credit Note Details', category: 'Payments Received', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '31', name: 'Refund History', category: 'Payments Received', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '32', name: 'Vendor Balance Summary', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '33', name: 'Bill Details', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '34', name: 'Vendor Credit Details', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '35', name: 'Payments Made', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '36', name: 'Purchase Order Details', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '37', name: 'Purchase Orders by Vendor', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '38', name: 'Payable Summary', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '39', name: 'Payable Details', category: 'Payables', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '40', name: 'Active Purchase Orders Report', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '41', name: 'Purchases by Item', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '42', name: 'Purchases by Category', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '43', name: 'Receives History', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '44', name: 'Expense Details', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '45', name: 'Expenses by Category', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '46', name: 'System Mails', category: 'Activity', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  { id: '47', name: 'Activity Logs', category: 'Activity', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
];

export function Reports() {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const favoriteIds = settings?.favoriteReports || [];

  const reports = INITIAL_REPORTS.map(r => ({
    ...r,
    isFavorite: favoriteIds.includes(r.id)
  }));

  const toggleFavorite = async (id: string) => {
    if (!settings?.id) return;
    const currentFavs = settings.favoriteReports || [];
    const newFavs = currentFavs.includes(id) 
      ? currentFavs.filter(fid => fid !== id) 
      : [...currentFavs, id];
    
    await db.settings.update(settings.id, { favoriteReports: newFavs });
    notifications.show({
      title: 'Favorites Updated',
      message: currentFavs.includes(id) ? 'Removed from favorites' : 'Added to favorites',
      color: 'blue',
      icon: <Star size={16} />
    });
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // --- REPORT DATA FETCHING ---
  const reportData = useLiveQuery(async () => {
    if (!selectedReportId) return null;

    const report = reports.find(r => r.id === selectedReportId);
    if (!report) return null;

    if (report.name === 'Inventory Summary') {
      const products = await db.products.toArray();
      return products.map(p => ({
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        unit: p.unit,
        value: p.stock * p.costPrice
      }));
    }

    if (report.name === 'Sales by Customer') {
      const invoices = await db.invoices.toArray();
      const customerTotals: Record<string, number> = {};
      invoices.forEach(inv => {
        customerTotals[inv.customerName] = (customerTotals[inv.customerName] || 0) + inv.total;
      });
      return Object.entries(customerTotals).map(([name, total]) => ({ name, total }));
    }

    if (report.name === 'Inventory Valuation Summary') {
      const products = await db.products.toArray();
      return products.map(p => ({
        name: p.name,
        category: p.category,
        stock: p.stock,
        cost: p.costPrice,
        valuation: p.stock * p.costPrice
      }));
    }

    if (report.name === 'Invoice Details') {
      return await db.invoices.toArray();
    }

    if (report.name === 'Customer Balance Summary') {
      const invoices = await db.invoices.toArray();
      const balances: Record<string, { total: number, paid: number }> = {};
      invoices.forEach(inv => {
        if (!balances[inv.customerName]) {
          balances[inv.customerName] = { total: 0, paid: 0 };
        }
        balances[inv.customerName].total += inv.total;
        balances[inv.customerName].paid += inv.amountPaid;
      });
      return Object.entries(balances).map(([name, data]) => ({
        name,
        total: data.total,
        paid: data.paid,
        balance: data.total - data.paid
      }));
    }

    if (report.name === 'Sales by Item') {
      const invoices = await db.invoices.toArray();
      const itemTotals: Record<string, { qty: number, total: number }> = {};
      invoices.forEach(inv => {
        inv.items.forEach(item => {
          if (!itemTotals[item.productName]) {
            itemTotals[item.productName] = { qty: 0, total: 0 };
          }
          itemTotals[item.productName].qty += item.quantity;
          itemTotals[item.productName].total += item.total;
        });
      });
      return Object.entries(itemTotals).map(([name, data]) => ({ name, qty: data.qty, total: data.total }));
    }

    if (report.name === 'Inventory Adjustment Summary') {
      return await db.adjustments.toArray();
    }

    if (report.name === 'Payments Made') {
      return await db.payments.where('type').equals('outbound').toArray();
    }

    if (report.name === 'Purchase Order Details') {
      return await db.purchaseOrders.toArray();
    }

    if (report.name === 'Expense Details') {
      return await db.expenses.toArray();
    }

    if (report.name === 'Vendor Balance Summary') {
      const bills = await db.purchaseBills.toArray();
      const balances: Record<string, { total: number, paid: number }> = {};
      bills.forEach(bill => {
        if (!balances[bill.supplierName]) {
          balances[bill.supplierName] = { total: 0, paid: 0 };
        }
        balances[bill.supplierName].total += bill.total;
        balances[bill.supplierName].paid += (bill.amountPaid || 0);
      });
      return Object.entries(balances).map(([name, data]) => ({
        name,
        total: data.total,
        paid: data.paid,
        balance: data.total - data.paid
      }));
    }

    return [];
  }, [selectedReportId]);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'home') return matchesSearch;
    if (activeTab === 'favorites') return r.isFavorite && matchesSearch;
    
    const category = REPORT_CATEGORIES.find(c => c.id === activeTab);
    if (category) {
      return r.category === category.label && matchesSearch;
    }
    
    return matchesSearch;
  });

  const exportToCSV = () => {
    if (!reportData || !selectedReport) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add Headers based on report type
    const headers = selectedReport.name === 'Inventory Summary' ? ["Item Name", "SKU", "Stock", "Unit", "Value"] :
                    selectedReport.name === 'Sales by Customer' ? ["Customer Name", "Total Sales"] :
                    selectedReport.name === 'Invoice Details' ? ["Date", "Invoice #", "Customer", "Status", "Amount"] :
                    selectedReport.name === 'Customer Balance Summary' ? ["Customer Name", "Total", "Paid", "Balance"] :
                    ["Data"];
    
    csvContent += `${headers.join(",")}\n`;
    
    // Add Rows
    reportData.forEach((row: any) => {
      let rowData: any[] = [];
      if (selectedReport.name === 'Inventory Summary') rowData = [row.name, row.sku, row.stock, row.unit, row.value];
      else if (selectedReport.name === 'Sales by Customer') rowData = [row.name, row.total];
      else if (selectedReport.name === 'Invoice Details') rowData = [row.date, row.invoiceNumber, row.customerName, row.status, row.total];
      else if (selectedReport.name === 'Customer Balance Summary') rowData = [row.name, row.total, row.paid, row.balance];
      
      csvContent += `${rowData.join(",")}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReport.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderReportView = () => {
    if (!selectedReport) return null;

    return (
      <Box h="100%" display="flex" style={{ flexDirection: 'column' }}>
        <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
            <Group gap="md">
              <ActionIcon variant="light" color="blue" onClick={() => setSelectedReportId(null)}>
                <ArrowLeft size={18} />
              </ActionIcon>
              <div>
                <Title order={4}>{selectedReport.name}</Title>
                <Text size="xs" c="dimmed">{selectedReport.category} Report • Hanuman Enterprise Solution</Text>
              </div>
            </Group>
            <Group gap="sm">
              <Button variant="default" size="xs" leftSection={<Filter size={14} />}>Customize</Button>
              <Button variant="default" size="xs" leftSection={<Printer size={14} />} onClick={handlePrint}>Print</Button>
              <Button variant="default" size="xs" leftSection={<FileSpreadsheet size={14} />} onClick={exportToCSV}>Export</Button>
            </Group>
          </Group>
        </Box>

        <Box p="xl" style={{ flex: 1, overflow: 'auto' }}>
          <Paper withBorder p="xl" radius="md" bg="white" shadow="xs">
            <Stack align="center" mb="xl">
               <Title order={3}>Hanuman Enterprise Solution</Title>
               <Title order={4} c="dimmed">{selectedReport.name}</Title>
               <Text size="sm">Basis: Accrual • As of {new Date().toLocaleDateString()}</Text>
            </Stack>

            <Table verticalSpacing="sm" highlightOnHover withTableBorder>
              <Table.Thead bg="#f8f9fa">
                {selectedReport.name === 'Inventory Summary' && (
                  <Table.Tr>
                    <Table.Th>ITEM NAME</Table.Th>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th ta="right">STOCK ON HAND</Table.Th>
                    <Table.Th ta="right">STOCK VALUE</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Sales by Customer' && (
                  <Table.Tr>
                    <Table.Th>CUSTOMER NAME</Table.Th>
                    <Table.Th ta="right">TOTAL SALES (₹)</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Invoice Details' && (
                  <Table.Tr>
                    <Table.Th>DATE</Table.Th>
                    <Table.Th>INVOICE #</Table.Th>
                    <Table.Th>CUSTOMER</Table.Th>
                    <Table.Th>STATUS</Table.Th>
                    <Table.Th ta="right">AMOUNT</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Customer Balance Summary' && (
                  <Table.Tr>
                    <Table.Th>CUSTOMER NAME</Table.Th>
                    <Table.Th ta="right">INVOICED AMOUNT</Table.Th>
                    <Table.Th ta="right">AMOUNT PAID</Table.Th>
                    <Table.Th ta="right">BALANCE DUE</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Sales by Item' && (
                  <Table.Tr>
                    <Table.Th>ITEM NAME</Table.Th>
                    <Table.Th ta="right">QUANTITY SOLD</Table.Th>
                    <Table.Th ta="right">TOTAL SALES (₹)</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Inventory Adjustment Summary' && (
                  <Table.Tr>
                    <Table.Th>DATE</Table.Th>
                    <Table.Th>ITEM</Table.Th>
                    <Table.Th>REASON</Table.Th>
                    <Table.Th ta="right">ADJUSTED</Table.Th>
                    <Table.Th>STATUS</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Payments Made' && (
                  <Table.Tr>
                    <Table.Th>DATE</Table.Th>
                    <Table.Th>PAYMENT #</Table.Th>
                    <Table.Th>VENDOR</Table.Th>
                    <Table.Th>MODE</Table.Th>
                    <Table.Th ta="right">AMOUNT</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Purchase Order Details' && (
                  <Table.Tr>
                    <Table.Th>DATE</Table.Th>
                    <Table.Th>PO #</Table.Th>
                    <Table.Th>VENDOR</Table.Th>
                    <Table.Th>STATUS</Table.Th>
                    <Table.Th ta="right">AMOUNT</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Expense Details' && (
                  <Table.Tr>
                    <Table.Th>DATE</Table.Th>
                    <Table.Th>CATEGORY</Table.Th>
                    <Table.Th>REFERENCE</Table.Th>
                    <Table.Th ta="right">AMOUNT</Table.Th>
                  </Table.Tr>
                )}
                {selectedReport.name === 'Vendor Balance Summary' && (
                  <Table.Tr>
                    <Table.Th>VENDOR NAME</Table.Th>
                    <Table.Th ta="right">BILLED AMOUNT</Table.Th>
                    <Table.Th ta="right">AMOUNT PAID</Table.Th>
                    <Table.Th ta="right">BALANCE DUE</Table.Th>
                  </Table.Tr>
                )}
                {!['Inventory Summary', 'Sales by Customer', 'Invoice Details', 'Customer Balance Summary', 'Sales by Item', 'Inventory Adjustment Summary', 'Payments Made', 'Purchase Order Details', 'Expense Details', 'Vendor Balance Summary'].includes(selectedReport.name) && (
                   <Table.Tr><Table.Th>No data structure defined for this report yet.</Table.Th></Table.Tr>
                )}
              </Table.Thead>
              <Table.Tbody>
                {reportData?.map((row: any, i: number) => (
                  <Table.Tr key={i}>
                    {selectedReport.name === 'Inventory Summary' && (
                      <>
                        <Table.Td>{row.name}</Table.Td>
                        <Table.Td>{row.sku}</Table.Td>
                        <Table.Td ta="right">{row.stock} {row.unit}</Table.Td>
                        <Table.Td ta="right">₹{row.value.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Sales by Customer' && (
                      <>
                        <Table.Td fw={500} c="blue.7">{row.name}</Table.Td>
                        <Table.Td ta="right">₹{row.total.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Invoice Details' && (
                      <>
                        <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
                        <Table.Td fw={500}>{row.invoiceNumber}</Table.Td>
                        <Table.Td>{row.customerName}</Table.Td>
                        <Table.Td>
                           <Badge size="xs" color={row.status === 'paid' ? 'green' : 'orange'}>{row.status}</Badge>
                        </Table.Td>
                        <Table.Td ta="right">₹{row.total.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Customer Balance Summary' && (
                      <>
                        <Table.Td fw={500}>{row.name}</Table.Td>
                        <Table.Td ta="right">₹{row.total.toLocaleString()}</Table.Td>
                        <Table.Td ta="right">₹{row.paid.toLocaleString()}</Table.Td>
                        <Table.Td ta="right" fw={700} c="red">₹{row.balance.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Sales by Item' && (
                      <>
                        <Table.Td fw={500}>{row.name}</Table.Td>
                        <Table.Td ta="right">{row.qty}</Table.Td>
                        <Table.Td ta="right">₹{row.total.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Inventory Adjustment Summary' && (
                      <>
                        <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
                        <Table.Td fw={500}>{row.productName}</Table.Td>
                        <Table.Td>{row.reason}</Table.Td>
                        <Table.Td ta="right" c={row.adjustmentType === 'add' ? 'green' : 'red'}>
                          {row.adjustmentType === 'add' ? '+' : '-'}{row.quantityAdjusted}
                        </Table.Td>
                        <Table.Td>
                          <Badge size="xs" color="blue">{row.status}</Badge>
                        </Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Payments Made' && (
                      <>
                        <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
                        <Table.Td fw={500}>{row.paymentNumber}</Table.Td>
                        <Table.Td>{row.customerName}</Table.Td>
                        <Table.Td>{row.paymentMode}</Table.Td>
                        <Table.Td ta="right">₹{row.amount.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Purchase Order Details' && (
                      <>
                        <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
                        <Table.Td fw={500}>{row.purchaseOrderNumber}</Table.Td>
                        <Table.Td>{row.vendorName}</Table.Td>
                        <Table.Td>
                           <Badge size="xs" color="blue">{row.status}</Badge>
                        </Table.Td>
                        <Table.Td ta="right">₹{row.total.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Expense Details' && (
                      <>
                        <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
                        <Table.Td fw={500}>{row.category}</Table.Td>
                        <Table.Td>{row.reference || '-'}</Table.Td>
                        <Table.Td ta="right">₹{row.amount.toLocaleString()}</Table.Td>
                      </>
                    )}
                    {selectedReport.name === 'Vendor Balance Summary' && (
                      <>
                        <Table.Td fw={500}>{row.name}</Table.Td>
                        <Table.Td ta="right">₹{row.total.toLocaleString()}</Table.Td>
                        <Table.Td ta="right">₹{row.paid.toLocaleString()}</Table.Td>
                        <Table.Td ta="right" fw={700} c="orange">₹{row.balance.toLocaleString()}</Table.Td>
                      </>
                    )}
                  </Table.Tr>
                ))}
                {(!reportData || reportData.length === 0) && (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Center py="xl">
                        <Stack align="center" gap="xs">
                          <Activity size={30} color="gray" />
                          <Text c="dimmed" size="sm">No transaction data available for this report.</Text>
                        </Stack>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Box>
      </Box>
    );
  };

  const renderSidebarItem = (id: string, label: string, icon: any) => {
    const isActive = activeTab === id;
    const Icon = icon;
    return (
      <UnstyledButton
        key={id}
        onClick={() => setActiveTab(id)}
        style={{
          width: '100%',
          padding: `${rem(10)} ${rem(16)}`,
          borderRadius: rem(4),
          backgroundColor: isActive ? '#edf2ff' : 'transparent',
          color: isActive ? '#364fc7' : '#495057',
        }}
      >
        <Group gap="sm">
          <Icon size={18} strokeWidth={1.5} />
          <Text size="sm" fw={isActive ? 600 : 400}>{label}</Text>
        </Group>
      </UnstyledButton>
    );
  };

  return (
    <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Title order={4} fw={600} c="gray.8">Reports Center</Title>
          <Group gap="md">
            <TextInput
              placeholder="Search reports"
              leftSection={<Search size={16} color="gray" />}
              size="sm"
              w={400}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              styles={{
                input: { backgroundColor: '#f1f3f5', border: 'none' }
              }}
            />
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button 
                  color="blue" 
                  size="sm" 
                  rightSection={<ChevronDown size={16} />}
                >
                  Create New Report
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<TrendingUp size={14} />}>Sales Report</Menu.Item>
                <Menu.Item leftSection={<Package size={14} />}>Inventory Report</Menu.Item>
                <Menu.Item leftSection={<ArrowUpRight size={14} />}>Receivables Report</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon variant="default" size="lg"><MoreVertical size={20} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content Area */}
      <Grid gutter={0} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Grid.Col span={2.5} bg="white" style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <ScrollArea style={{ flex: 1 }} p="md">
            <Stack gap={4}>
              {renderSidebarItem('home', 'Home', Home)}
              {renderSidebarItem('favorites', 'Favorites', Star)}
              {renderSidebarItem('shared', 'Shared Reports', Share2)}
              {renderSidebarItem('my_reports', 'My Reports', Users)}
              {renderSidebarItem('scheduled', 'Scheduled Reports', Calendar)}
              
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="xl" mb="xs" px="md">Report Category</Text>
              
              {REPORT_CATEGORIES.map(cat => renderSidebarItem(cat.id, cat.label, Folder))}
            </Stack>

            {/* Analytics Card */}
            <Paper p="md" radius="md" mt="xl" bg="#fff5f5" style={{ border: '1px solid #ffe3e3' }}>
              <Stack gap="xs">
                <Group gap="xs">
                   <Box p={5} bg="white" style={{ borderRadius: '4px', border: '1px solid #ffc9c9' }}>
                      <TrendingUp size={16} color="#fa5252" />
                   </Box>
                   <Stack gap={0}>
                      <Text size="xs" fw={700}>Advanced Financial</Text>
                      <Text size="xs" fw={700}>Analytics</Text>
                   </Stack>
                </Group>
                <Text size="xs" c="dimmed">Get deep insights with automated financial analytics.</Text>
                <UnstyledButton>
                   <Text size="xs" fw={700} c="blue">Try Analytics Engine &gt;</Text>
                </UnstyledButton>
              </Stack>
            </Paper>
          </ScrollArea>
        </Grid.Col>

        {/* Report List Area */}
        <Grid.Col span={9.5} style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedReportId ? renderReportView() : (
            <Box p="xl" style={{ flex: 1, position: 'relative' }}>
              {/* Background Pattern Hint */}
              <Box style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: 200, 
                opacity: 0.05, 
                pointerEvents: 'none',
                backgroundImage: 'radial-gradient(#4c6ef5 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />

              <Paper withBorder radius="md" bg="white" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <Group gap="xs">
                    <Title order={5} fw={600}>
                      {activeTab === 'home' ? 'All Reports' : 
                       activeTab === 'favorites' ? 'Favorites' : 
                       REPORT_CATEGORIES.find(c => c.id === activeTab)?.label || 'Reports'}
                    </Title>
                    <Badge variant="filled" color="blue" size="sm" radius="xl">
                      {filteredReports.length}
                    </Badge>
                  </Group>
                </Box>

                <ScrollArea style={{ flex: 1 }}>
                  <Table verticalSpacing="md" horizontalSpacing="xl" highlightOnHover>
                    <Table.Thead bg="#f8f9fa">
                      <Table.Tr>
                        <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>REPORT NAME</Table.Th>
                        <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>REPORT CATEGORY</Table.Th>
                        <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>CREATED BY</Table.Th>
                        <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>LAST VISITED</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredReports.map((report) => (
                        <Table.Tr key={report.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedReportId(report.id)}>
                          <Table.Td>
                            <Group gap="sm">
                              <ActionIcon 
                                variant="subtle" 
                                color={report.isFavorite ? 'yellow' : 'gray'} 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(report.id);
                                }}
                              >
                                <Star size={16} fill={report.isFavorite ? 'currentColor' : 'none'} />
                              </ActionIcon>
                              <Text size="sm" fw={500} c="blue.7">{report.name}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="gray.7">{report.category}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="gray.7">{report.createdBy}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="gray.6">{report.lastVisited}</Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      {filteredReports.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={4}>
                            <Center py="xl">
                              <Stack align="center" gap="xs">
                                <Search size={40} color="#e2e8f0" />
                                <Text c="dimmed" size="sm">No reports found for this category.</Text>
                              </Stack>
                            </Center>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </Box>
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
}
