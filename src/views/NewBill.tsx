import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Button, 
  TextInput, 
  Stack,
  Text,
  Select,
  Box,
  Radio,
  ActionIcon,
  rem,
  Grid,
  Textarea,
  NumberInput,
  Menu,
  Divider,
  ScrollArea,
  Badge
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, Search, Image as ImageIcon, Upload, Plus, Trash2, ChevronDown, Settings, Package, Link, Edit } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { AlertCircle } from 'lucide-react';
import { DateInput } from '@mantine/dates';

interface NewBillProps {
  onClose: () => void;
  editingId?: number;
  convertingPoId?: number;
}

export function NewBill({ onClose, editingId, convertingPoId }: NewBillProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [openPOs, setOpenPOs] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([
    { productId: '', account: 'Inventory Asset', quantity: 1, received: 0, rate: 0, discount: 0, tax: '0', customerId: '', amount: 0 }
  ]);
  const [grnData, setGrnData] = useState<Record<number, number>>({});

  const form = useForm({
    initialValues: {
      supplierId: '',
      billNumber: 'BILL-00001',
      orderNumber: '',
      date: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)), // Default Net 15
      paymentTerms: 'Net 15',
      subject: '',
      taxPreference: 'exclusive',
      discount: 0,
      discountType: '%' as '%' | 'fixed',
      adjustment: 0,
      notes: '',
      termsConditions: '',
      attachments: [] as { name: string, base64: string }[],
    },
    validate: {
      supplierId: (val) => (!val ? 'Vendor is required' : null),
      billNumber: (val) => (!val ? 'Bill Number is required' : null),
    }
  });

  useEffect(() => {
    const loadData = async () => {
      const v = await db.partners.filter(p => p.type === 'supplier' || p.type === 'both').toArray();
      setVendors(v);

      const c = await db.partners.filter(p => p.type === 'customer' || p.type === 'both').toArray();
      setCustomers(c);

      const p = await db.products.toArray();
      setProducts(p);

      const { generateDocNumber } = await import('../utils/numberSeries');
      const nextBillNo = await generateDocNumber('bill');

      if (editingId) {
        const bill = await db.purchaseBills.get(editingId);
        if (bill) {
          form.setValues({
            supplierId: bill.supplierId.toString(),
            billNumber: bill.billNumber,
            orderNumber: bill.orderNumber || '',
            date: new Date(bill.date),
            dueDate: new Date(bill.dueDate),
            paymentTerms: bill.paymentTerms,
            subject: bill.subject || '',
            taxPreference: 'exclusive',
            discount: bill.discount || 0,
            discountType: bill.discountType || '%',
            adjustment: bill.adjustment || 0,
            notes: (bill as any).notes || '',
            termsConditions: (bill as any).termsConditions || '',
            attachments: (bill as any).attachments || [],
          });
          setItems(bill.items.length > 0 ? bill.items : [{ productId: '', account: 'Inventory Asset', quantity: 1, rate: 0, discount: 0, tax: '0', customerId: '', amount: 0 }]);
        }
      } else if (convertingPoId) {
        const po = await db.purchaseOrders.get(convertingPoId);
        if (po) {
          form.setValues({
            supplierId: po.vendorId.toString(),
            billNumber: nextBillNo,
            orderNumber: po.purchaseOrderNumber,
            date: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
            paymentTerms: po.paymentTerms,
            subject: po.reference || '',
            taxPreference: 'exclusive',
            discount: po.discount || 0,
            discountType: po.discountType || '%',
            adjustment: po.adjustment || 0,
            notes: po.notes || '',
            termsConditions: po.termsConditions || '',
            attachments: po.attachments || [],
          });
          const newItems = po.items.map((item: any) => ({
             ...item,
             account: 'Inventory Asset',
             customerId: '',
             discount: 0
          }));
          setItems(newItems.length > 0 ? newItems : [{ productId: '', account: 'Inventory Asset', quantity: 1, rate: 0, discount: 0, tax: '0', customerId: '', amount: 0 }]);
          
          notifications.show({ title: 'PO Converted', message: `Pre-filled data from ${po.purchaseOrderNumber}`, color: 'blue' });
        }
      } else {
        form.setFieldValue('billNumber', nextBillNo);
      }
    };
    loadData();
  }, [editingId, convertingPoId]);

  // Fetch GRN totals for 3-way match
  const fetchGRNTotals = async (poId: number) => {
    const grns = await db.goodsReceipts.where('purchaseOrderId').equals(poId).toArray();
    const totals: Record<number, number> = {};
    grns.forEach(grn => {
      grn.items.forEach(item => {
        totals[item.productId] = (totals[item.productId] || 0) + item.receivedQuantity;
      });
    });
    setGrnData(totals);
    return totals;
  };

  // Handle Vendor Change to fetch open POs
  useEffect(() => {
    const fetchOpenPOs = async () => {
      if (form.values.supplierId) {
        const pos = await db.purchaseOrders.filter(po => 
          po.vendorId.toString() === form.values.supplierId && 
          (po.status === 'issued' || po.status === 'received')
        ).toArray();
        setOpenPOs(pos);
      } else {
        setOpenPOs([]);
      }
    };
    fetchOpenPOs();
  }, [form.values.supplierId]);

  const handleIncludeOpenPO = async () => {
    if (openPOs.length > 0) {
      const po = openPOs[0];
      const receivedTotals = await fetchGRNTotals(po.id!);
      form.setFieldValue('orderNumber', po.purchaseOrderNumber);
      
      const newItems = po.items.map((item: any) => ({
        ...item,
        account: 'Inventory Asset',
        received: receivedTotals[item.productId] || 0,
        customerId: '',
        discount: 0
      }));
      setItems(newItems);
      notifications.show({ title: 'Items Imported', message: `Imported ${newItems.length} items with GRN verification.`, color: 'green' });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.rate * (Number(item.tax) / 100)), 0);
  };

  const subtotal = calculateSubtotal();
  const totalTax = calculateTotalTax();
  const discountAmount = form.values.discountType === '%' 
    ? (subtotal * (form.values.discount / 100)) 
    : form.values.discount;
  
  const total = subtotal - discountAmount + totalTax + Number(form.values.adjustment);

  const handleSave = async (status: 'draft' | 'open' = 'draft') => {
    if (form.validate().hasErrors) return;

    const vendor = vendors.find(v => v.id.toString() === form.values.supplierId);

    const data = {
      billNumber: form.values.billNumber,
      orderNumber: form.values.orderNumber,
      supplierId: Number(form.values.supplierId),
      supplierName: vendor ? vendor.name : 'Unknown Vendor',
      date: form.values.date,
      dueDate: form.values.dueDate,
      paymentTerms: form.values.paymentTerms,
      subject: form.values.subject,
      items: items.map(item => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
      subtotal,
      totalGst: totalTax,
      cgst: 0,
      sgst: 0,
      igst: 0,
      discount: form.values.discount,
      discountType: form.values.discountType,
      adjustment: Number(form.values.adjustment),
      total,
      amountPaid: 0,
      status,
      notes: form.values.notes,
      termsConditions: form.values.termsConditions,
      attachments: form.values.attachments,
    };

    if (editingId) {
      await db.purchaseBills.update(editingId, data);
      notifications.show({ title: 'Success', message: 'Bill updated successfully', color: 'green' });
    } else {
      await db.purchaseBills.add(data as any);
      
      // Update Stock in Accounting Mode
      const settings = await db.settings.toCollection().first();
      const isAccountingMode = !settings?.stockTrackingMode || settings.stockTrackingMode === 'accounting';
      
      if (isAccountingMode) {
        for (const item of items) {
          if (item.productId) {
            const product = await db.products.get(Number(item.productId));
            if (product) {
              await db.products.update(Number(item.productId), {
                stock: (product.stock || 0) + item.quantity
              });
            }
          }
        }
        notifications.show({ title: 'Success', message: 'Bill created and stock updated', color: 'green' });
      } else {
        notifications.show({ title: 'Success', message: 'Bill created successfully', color: 'green' });
      }
    }
    onClose();
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    
    if (field === 'productId') {
      const product = products.find(p => p.id.toString() === value);
      if (product) {
        newItems[index] = { 
          ...newItems[index], 
          productId: value, 
          rate: product.costPrice || product.price,
          tax: product.gstRate ? product.gstRate.toString() : '0'
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    setItems(newItems);
  };

  return (
    <Box h="100%" bg="#f8f9fa" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title order={4} fw={500}>{editingId ? 'Edit Bill' : 'New Bill'}</Title>
        <ActionIcon variant="subtle" onClick={onClose}><X size={20} /></ActionIcon>
      </Box>

      {/* Main Form Content */}
      <ScrollArea style={{ flex: 1 }} p="xl">
        <Paper p="xl" radius="md" shadow="sm" maw={1000} mx="auto">
          {/* Vendor Details */}
          <Grid mb="xl">
            <Grid.Col span={8}>
              <Select
                label="Vendor Name"
                placeholder="Select Vendor"
                searchable
                data={vendors.map(v => ({ value: v.id.toString(), label: v.name }))}
                {...form.getInputProps('supplierId')}
                withAsterisk
                mb="sm"
              />
              {form.values.supplierId && (
                <Box mt="xs">
                  <Text size="xs" fw={600} c="dimmed">BILLING ADDRESS <ActionIcon size="xs" variant="transparent"><Edit size={12}/></ActionIcon></Text>
                  <Text size="sm">{vendors.find(v => v.id.toString() === form.values.supplierId)?.billingLine1}</Text>
                  <Text size="sm">{vendors.find(v => v.id.toString() === form.values.supplierId)?.billingCity}</Text>
                  <Text size="sm">{vendors.find(v => v.id.toString() === form.values.supplierId)?.billingState}</Text>
                  <Text size="sm">{vendors.find(v => v.id.toString() === form.values.supplierId)?.billingCountry}</Text>
                </Box>
              )}
            </Grid.Col>
            <Grid.Col span={4}>
              <Group justify="flex-end">
                <Badge variant="outline" color="blue" size="lg">INR</Badge>
              </Group>
            </Grid.Col>
          </Grid>

          <Divider mb="xl" />

          {/* Bill Details */}
          <Grid mb="xl">
            <Grid.Col span={6}>
              <TextInput
                label="Bill#"
                {...form.getInputProps('billNumber')}
                withAsterisk
                mb="sm"
              />
              <TextInput
                label="Order Number"
                {...form.getInputProps('orderNumber')}
                mb="sm"
              />
              <DateInput
                label="Bill Date"
                {...form.getInputProps('date')}
                withAsterisk
                mb="sm"
              />
              <Group grow mb="sm">
                <DateInput
                  label="Due Date"
                  {...form.getInputProps('dueDate')}
                  withAsterisk
                />
                <Select
                  label="Payment Terms"
                  data={['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60']}
                  {...form.getInputProps('paymentTerms')}
                />
              </Group>
            </Grid.Col>
          </Grid>

          <Divider mb="xl" />

          {/* Subject */}
          <Textarea
            label="Subject"
            placeholder="Enter a subject within 250 characters"
            {...form.getInputProps('subject')}
            maxLength={250}
            mb="xl"
            w="50%"
          />

          <Divider mb="xl" />

          {/* Tax Pref */}
          <Group mb="md" justify="space-between">
            <Group gap="xl">
              <Select
                value={form.values.taxPreference}
                onChange={(val) => form.setFieldValue('taxPreference', val || 'exclusive')}
                data={[
                  { value: 'exclusive', label: 'Tax Exclusive' },
                  { value: 'inclusive', label: 'Tax Inclusive' }
                ]}
                variant="unstyled"
                fw={500}
                w={150}
              />
              <Select
                value="At Line Item Level"
                data={['At Line Item Level']}
                variant="unstyled"
                fw={500}
                w={150}
              />
            </Group>
            <Text size="sm" c="blue" style={{ cursor: 'pointer' }}>Bulk Actions</Text>
          </Group>

          {/* Items Table */}
          <Box style={{ border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }} mb="md">
            <Table>
              <Table.Thead bg="#f8f9fa">
                <Table.Tr>
                  <Table.Th w={250}>ITEM DETAILS</Table.Th>
                  <Table.Th w={150}>ACCOUNT</Table.Th>
                  {form.values.orderNumber && <Table.Th w={80} ta="right">RECEIVED</Table.Th>}
                  <Table.Th w={100} ta="right">BILL QTY</Table.Th>
                  <Table.Th w={100} ta="right">RATE</Table.Th>
                  <Table.Th w={80} ta="right">DISC</Table.Th>
                  <Table.Th w={100}>TAX</Table.Th>
                  <Table.Th w={120}>CUSTOMER</Table.Th>
                  <Table.Th w={120} ta="right">AMOUNT</Table.Th>
                  <Table.Th w={40} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Select
                        placeholder="Type or click to select an item."
                        data={products.map(p => ({ value: p.id.toString(), label: p.name }))}
                        value={item.productId ? item.productId.toString() : ''}
                        onChange={(val) => updateItem(index, 'productId', val)}
                        searchable
                        leftSection={<ImageIcon size={14} color="gray" />}
                        variant="unstyled"
                      />
                    </Table.Td>
                     <Table.Td>
                        <TextInput
                         placeholder="Select account"
                         value={item.account || 'Cost of Goods Sold'}
                         onChange={(e) => updateItem(index, 'account', e.target.value)}
                         variant="unstyled"
                       />
                    </Table.Td>
                    {form.values.orderNumber && (
                      <Table.Td ta="right">
                        <Text size="sm" fw={600} c={item.received === 0 ? 'red' : 'green'}>{item.received || 0}</Text>
                      </Table.Td>
                    )}
                    <Table.Td>
                      <Stack gap={0}>
                        <NumberInput
                          value={item.quantity}
                          onChange={(val) => updateItem(index, 'quantity', Number(val))}
                          min={1}
                          variant="unstyled"
                          ta="right"
                          styles={{ input: { textAlign: 'right', color: (form.values.orderNumber && item.quantity > (item.received || 0)) ? 'red' : 'inherit' } }}
                          rightSection={(form.values.orderNumber && item.quantity > (item.received || 0)) ? <AlertCircle size={14} color="red" /> : null}
                        />
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.rate}
                        onChange={(val) => updateItem(index, 'rate', Number(val))}
                        min={0}
                        variant="unstyled"
                        ta="right"
                        styles={{ input: { textAlign: 'right' } }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.discount}
                        onChange={(val) => updateItem(index, 'discount', Number(val))}
                        min={0}
                        variant="unstyled"
                        ta="right"
                        styles={{ input: { textAlign: 'right' } }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        data={['0', '5', '12', '18', '28']}
                        value={item.tax}
                        onChange={(val) => updateItem(index, 'tax', val)}
                        placeholder="Tax"
                        variant="unstyled"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        placeholder="Customer"
                        data={customers.map(c => ({ value: c.id.toString(), label: c.name }))}
                        value={item.customerId}
                        onChange={(val) => updateItem(index, 'customerId', val)}
                        variant="unstyled"
                      />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm">{(item.quantity * item.rate).toFixed(2)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon color="red" variant="subtle" onClick={() => {
                        const newItems = items.filter((_, i) => i !== index);
                        if (newItems.length === 0) {
                          newItems.push({ productId: '', account: 'Inventory Asset', quantity: 1, rate: 0, discount: 0, tax: '0', customerId: '', amount: 0 });
                        }
                        setItems(newItems);
                      }}>
                        <Trash2 size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>

          <Group justify="space-between" mb="xl">
            <Group>
               <Button 
                 variant="subtle" 
                 leftSection={<Plus size={14} />} 
                 onClick={() => setItems([...items, { productId: '', account: 'Inventory Asset', quantity: 1, rate: 0, discount: 0, tax: '0', customerId: '', amount: 0 }])}
               >
                 Add New Row
               </Button>
               {openPOs.length > 0 && (
                 <Button variant="light" color="orange" leftSection={<Link size={14} />} onClick={handleIncludeOpenPO}>
                   Include {openPOs.length} Open Purchase Orders
                 </Button>
               )}
            </Group>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              {/* Additional Notes */}
              <Textarea
                label="Notes"
                placeholder="It will not be shown in PDF"
                {...form.getInputProps('notes')}
                minRows={3}
                mb="md"
              />
              <Box>
                <Text size="sm" fw={500} mb="xs">Attach File(s) to Bill</Text>
                <Button variant="default" leftSection={<Upload size={14} />}>Upload File</Button>
                <Text size="xs" c="dimmed" mt={4}>You can upload a maximum of 5 files, 10MB each</Text>
              </Box>
            </Grid.Col>
            <Grid.Col span={6}>
              {/* Totals Box */}
              <Box bg="#f8f9fa" p="md" style={{ borderRadius: '4px' }}>
                <Group justify="space-between" mb="sm">
                  <Text size="sm">Sub Total</Text>
                  <Text size="sm" fw={500}>{subtotal.toFixed(2)}</Text>
                </Group>

                <Group justify="space-between" mb="sm">
                  <Text size="sm">Adjustment</Text>
                  <NumberInput
                     value={form.values.adjustment}
                     onChange={(val) => form.setFieldValue('adjustment', Number(val))}
                     w={100}
                     size="xs"
                  />
                </Group>

                <Divider my="md" />

                <Group justify="space-between">
                  <Title order={4}>Total ( ₹ )</Title>
                  <Title order={4}>{total.toFixed(2)}</Title>
                </Group>
              </Box>
            </Grid.Col>
          </Grid>
        </Paper>
      </ScrollArea>

      {/* Footer sticky bar */}
      <Box p="md" bg="white" style={{ borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <Group>
          <Button variant="default" onClick={() => handleSave('draft')}>Save as Draft</Button>
          <Button color="blue" onClick={() => handleSave('open')}>Save as Open</Button>
          <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
        </Group>
      </Box>
    </Box>
  );
}
