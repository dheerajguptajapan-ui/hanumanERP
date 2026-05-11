import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Group, 
  Button, 
  ActionIcon, 
  TextInput, 
  Select, 
  Grid, 
  Stack, 
  Divider, 
  Table, 
  NumberInput, 
  Paper,
  Textarea,
  Modal,
  Badge,
  Checkbox
} from '@mantine/core';
import { 
  X, 
  ChevronDown, 
  Search, 
  Plus, 
  Trash, 
  Settings,
  History,
  Upload,
  Eye,
  Scan,
  Sparkles,
  Edit
} from 'lucide-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ItemDetail } from './ItemDetail';
import { useProducts } from '../hooks/useProducts';
import { usePartners } from '../hooks/usePartners';
import { GstService } from '../services/gst.service';

interface NewInvoiceProps {
  onClose: () => void;
  editingId?: number;
  isCloning?: boolean;
  salesOrderId?: number;
}

export function NewInvoice({ onClose, editingId, isCloning, salesOrderId }: NewInvoiceProps) {
  const customers = usePartners('customer');
  const products = useProducts();
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [viewItemId, setViewItemId] = useState<number | null>(null);

  const formatAddress = (p: any, type: 'billing' | 'shipping') => {
    if (!p) return 'No Address Provided';
    const prefix = type === 'billing' ? 'billing' : 'shipping';
    const lines = [
      p[`${prefix}Line1`],
      p[`${prefix}Line2`],
      [p[`${prefix}City`], p[`${prefix}State`], p[`${prefix}Pincode`]].filter(Boolean).join(', '),
      p[`${prefix}Country`]
    ];
    return lines.filter(Boolean).join('\n');
  };

  const form = useForm({
    initialValues: {
      customerId: '',
      customerName: '',
      invoiceNumber: '',
      orderNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentTerms: 'Due on Receipt',
      salesperson: '',
      subject: '',
      items: [
        { productId: '', productName: '', description: '', ordered: 0, invoiced: 0, packed: 0, quantity: 1, rate: 0, tax: 'gst18', amount: 0, hsnCode: '' }
      ],
      discount: 0,
      discountType: '%',
      shippingCharges: 0,
      adjustment: 0,
      customerNotes: 'Thanks for your business.',
      termsConditions: '',
    },
    validate: {
      customerId: (value) => (!value ? 'Customer is required' : null),
      items: {
        productId: (value) => (!value ? 'Required' : null),
        quantity: (value) => (value <= 0 ? 'Invalid' : null),
      }
    }
  });

  useEffect(() => {
    const loadData = async () => {
      if (editingId) {
        const inv = await db.invoices.get(editingId);
        if (inv) {
          form.setValues({
            ...inv,
            customerId: inv.customerId.toString(),
            invoiceDate: new Date(inv.date).toISOString().split('T')[0],
            dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
            invoiceNumber: isCloning ? '' : inv.invoiceNumber,
            items: inv.items.map(i => ({
              productId: i.productId.toString(),
              productName: i.productName,
              description: '',
              quantity: i.quantity,
              rate: i.price,
              tax: i.gstRate ? (inv.igst > 0 ? `igst${i.gstRate}` : `gst${i.gstRate}`) : 'gst18',
              amount: i.total,
              hsnCode: i.hsnCode
            }))
          } as any);
        }
      } else if (salesOrderId) {
        const so = await db.salesOrders.get(salesOrderId);
        if (so) {
          form.setValues({
            customerId: so.customerId.toString(),
            customerName: so.partnerName,
            orderNumber: so.orderNumber,
            items: so.items.map(i => ({
              productId: i.productId.toString(),
              productName: i.productName,
              description: '',
              ordered: i.quantity,
              invoiced: 0,
              packed: 0,
              quantity: i.quantity,
              rate: i.price,
              tax: i.gstRate ? (so.igst > 0 ? `igst${i.gstRate}` : `gst${i.gstRate}`) : 'gst18',
              amount: i.total,
              hsnCode: i.hsnCode || ''
            })),
            discount: (so as any).discount || 0,
            discountType: (so as any).discountType || '%',
            shippingCharges: (so as any).shippingCharges || 0,
            adjustment: (so as any).adjustment || 0,
            customerNotes: (so as any).customerNotes || 'Thanks for your business.',
            termsConditions: (so as any).termsConditions || '',
          } as any);
        }
      }
      
      if (!editingId || isCloning) {
        const { generateDocNumber } = await import('../utils/numberSeries');
        const nextNum = await generateDocNumber('invoice');
        form.setFieldValue('invoiceNumber', nextNum);
      }
    };
    loadData();
  }, [editingId, isCloning, salesOrderId]);

  const selectedCustomer = customers?.find(c => c.id === Number(form.values.customerId));
  const subtotal = form.values.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);

  // Professional GST calculation logic
  const result = GstService.calculateTotals(
    form.values.items.map(i => ({ 
      quantity: i.quantity, 
      price: i.rate, 
      gstRate: parseInt(i.tax.replace(/\D/g, '')) || 0 
    })),
    settings?.shopState || 'Delhi',
    selectedCustomer?.billingState || 'Delhi',
    form.values.discountType === '%' ? (subtotal * form.values.discount / 100) : form.values.discount,
    form.values.adjustment
  );

  const { totalCgst, totalSgst, totalIgst, totalTax, total } = {
    totalCgst: result.cgst,
    totalSgst: result.sgst,
    totalIgst: result.igst,
    totalTax: result.totalGst,
    total: result.total + form.values.shippingCharges
  };

  const discountAmount = form.values.discountType === '%' ? (subtotal * form.values.discount / 100) : form.values.discount;

  const TAX_OPTIONS = [
    { label: 'GST 5% (CGST 2.5% + SGST 2.5%)', value: 'gst5' },
    { label: 'GST 12% (CGST 6% + SGST 6%)', value: 'gst12' },
    { label: 'GST 18% (CGST 9% + SGST 9%)', value: 'gst18' },
    { label: 'GST 28% (CGST 14% + SGST 14%)', value: 'gst28' },
    { label: 'IGST 5%', value: 'igst5' },
    { label: 'IGST 12%', value: 'igst12' },
    { label: 'IGST 18%', value: 'igst18' },
    { label: 'IGST 28%', value: 'igst28' },
    { label: 'Non-Taxable', value: 'gst0' },
  ];

  const handleSave = async (values: typeof form.values, status: any = 'unpaid') => {
    try {
      const invoiceData = {
        invoiceNumber: values.invoiceNumber,
        orderNumber: values.orderNumber,
        customerId: Number(values.customerId),
        customerName: values.customerName,
        date: new Date(values.invoiceDate),
        dueDate: new Date(values.dueDate),
        paymentTerms: values.paymentTerms,
        salesperson: values.salesperson,
        subject: values.subject,
        items: values.items.map((i, idx) => {
          const itemResult = result.items[idx];
          return {
            productId: Number(i.productId),
            productName: i.productName,
            hsnCode: i.hsnCode,
            quantity: i.quantity,
            price: i.rate,
            gstRate: itemResult.gstRate,
            gstAmount: itemResult.cgst + itemResult.sgst + itemResult.igst,
            total: itemResult.total,
          };
        }),
        subtotal,
        totalGst: totalTax,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        discount: values.discount,
        discountType: values.discountType as any,
        shippingCharges: values.shippingCharges,
        adjustment: values.adjustment,
        total,
        amountPaid: 0,
        status,
        customerNotes: values.customerNotes,
        termsConditions: values.termsConditions,
      };

      if (editingId && !isCloning) {
        // EDIT: update invoice, NO stock changes
        await db.invoices.update(editingId, invoiceData);
        notifications.show({ title: 'Success', message: 'Invoice updated', color: 'green' });
      } else {
        // NEW INVOICE
        await db.invoices.add(invoiceData);

        // Stock deduction ONLY for accounting mode AND only for fresh invoices.
        // When converting from a Sales Order (salesOrderId present), stock was NOT
        // deducted at SO creation (Option A policy), so we DO deduct here.
        const isAccountingMode = !settings?.stockTrackingMode || settings.stockTrackingMode === 'accounting';
        if (isAccountingMode) {
          const lowStockItems: string[] = [];
          for (const item of values.items) {
            const product = await db.products.get(Number(item.productId));
            if (product) {
              if (product.stock < item.quantity) {
                lowStockItems.push(item.productName);
              }
              await db.products.update(Number(item.productId), {
                stock: (product.stock || 0) - item.quantity
              });
            }
          }
          if (lowStockItems.length > 0) {
            notifications.show({
              title: '⚠️ Stock Warning',
              message: `Insufficient stock for: ${lowStockItems.join(', ')}. Invoice saved — items are on backorder.`,
              color: 'orange',
              autoClose: 6000,
            });
          } else {
            notifications.show({ title: 'Success', message: 'Invoice created and stock updated', color: 'green' });
          }
        } else {
          notifications.show({ title: 'Success', message: 'Invoice created', color: 'green' });
        }

        if (salesOrderId) {
          await db.salesOrders.update(salesOrderId, { status: 'invoiced' });
        }
      }
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: 'Failed to save invoice', color: 'red' });
    }
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <Group justify="space-between">
          <Group gap="xs">
            <History size={20} color="#adb5bd" style={{ cursor: 'pointer' }} />
            <Title order={3} fw={500}>{editingId ? 'Edit Invoice' : 'New Invoice'}</Title>
          </Group>
          <Group gap="sm">
            <ActionIcon variant="subtle" color="gray"><Settings size={20} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p="xl">
        <Box maw={1200} mx="auto">
          <form onSubmit={form.onSubmit((vals) => handleSave(vals, 'unpaid'))}>
            <Stack gap="xl">
              {/* Customer Section */}
              <Box>
                <Grid align="flex-start">
                  <Grid.Col span={2} pt="sm"><Text size="sm" c="red">Customer Name*</Text></Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap="md">
                      <Group gap={0}>
                        <Select 
                          placeholder="Select or add a customer" 
                          data={customers?.map(c => ({ value: c.id!.toString(), label: c.name })) || []}
                          searchable
                          style={{ flex: 1 }}
                          styles={{ input: { borderRadius: '4px 0 0 4px', borderColor: '#3b82f6' } }}
                          {...form.getInputProps('customerId')}
                          onChange={(val) => {
                            const c = customers?.find(cust => cust.id === Number(val));
                            if (c) {
                              form.setFieldValue('customerId', val!);
                              form.setFieldValue('customerName', c.name);
                            }
                          }}
                        />
                        <ActionIcon size="lg" color="blue" variant="filled" style={{ borderRadius: '0 4px 4px 0' }}>
                          <Search size={18} />
                        </ActionIcon>
                      </Group>

                      {selectedCustomer && (
                        <Group align="flex-start" gap="xl">
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text size="xs" fw={700} c="dimmed">BILLING ADDRESS</Text>
                            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{formatAddress(selectedCustomer, 'billing')}</Text>
                            <Button variant="subtle" size="xs" p={0} h="auto" leftSection={<Edit size={12} />}>Edit Address</Button>
                          </Stack>
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text size="xs" fw={700} c="dimmed">SHIPPING ADDRESS</Text>
                            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{formatAddress(selectedCustomer, 'shipping')}</Text>
                            <Button variant="subtle" size="xs" p={0} h="auto" leftSection={<Edit size={12} />}>Edit Address</Button>
                          </Stack>
                        </Group>
                      )}
                    </Stack>
                  </Grid.Col>
                  {selectedCustomer?.currency && (
                    <Grid.Col span={4}>
                       <Badge variant="light" color="green" leftSection={<Sparkles size={10} />}>{selectedCustomer.currency}</Badge>
                    </Grid.Col>
                  )}
                </Grid>
              </Box>

              <Divider />

              {/* Invoice Info */}
              <Grid gutter="xl">
                <Grid.Col span={6}>
                  <Stack gap="sm">
                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm" c="red">Invoice#*</Text></Grid.Col>
                      <Grid.Col span={8}>
                        <TextInput 
                          {...form.getInputProps('invoiceNumber')} 
                          rightSection={<ActionIcon variant="subtle" size="sm"><Settings size={14}/></ActionIcon>}
                        />
                      </Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm">Order Number</Text></Grid.Col>
                      <Grid.Col span={8}><TextInput {...form.getInputProps('orderNumber')} /></Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm" c="red">Invoice Date*</Text></Grid.Col>
                      <Grid.Col span={8}><TextInput type="date" {...form.getInputProps('invoiceDate')} /></Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm">Terms</Text></Grid.Col>
                      <Grid.Col span={3}>
                        <Select 
                          data={['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60']} 
                          {...form.getInputProps('paymentTerms')} 
                        />
                      </Grid.Col>
                      <Grid.Col span={2}><Text size="sm" ta="right">Due Date</Text></Grid.Col>
                      <Grid.Col span={3}><TextInput type="date" {...form.getInputProps('dueDate')} /></Grid.Col>
                    </Grid>
                    
                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm">Salesperson</Text></Grid.Col>
                      <Grid.Col span={8}>
                        <Select 
                          placeholder="Select or Add Salesperson" 
                          data={['Admin', 'Sales Manager', 'Field Agent']} 
                          {...form.getInputProps('salesperson')} 
                        />
                      </Grid.Col>
                    </Grid>
                    
                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm">Subject</Text></Grid.Col>
                      <Grid.Col span={8}>
                        <Textarea 
                          placeholder="Let your customer know what this invoice is for" 
                          rows={2} 
                          {...form.getInputProps('subject')} 
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Grid.Col>
              </Grid>

              {/* Items Table */}
              <Box>
                <Paper withBorder radius="md" p={0}>
                  <Table verticalSpacing="sm" highlightOnHover withColumnBorders>
                    <Table.Thead bg="gray.0">
                      <Table.Tr>
                        <Table.Th w={40} />
                        <Table.Th>ITEM DETAILS</Table.Th>
                        <Table.Th w={80} ta="right">ORDERED</Table.Th>
                        <Table.Th w={80} ta="right">INVOICED</Table.Th>
                        <Table.Th w={80} ta="right">PACKED</Table.Th>
                        <Table.Th w={100}>QUANTITY</Table.Th>
                        <Table.Th w={150}>RATE</Table.Th>
                        <Table.Th w={150}>TAX</Table.Th>
                        <Table.Th w={150} ta="right">AMOUNT</Table.Th>
                        <Table.Th w={50} />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {form.values.items.map((item, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>
                            <ActionIcon variant="subtle" color="gray"><ChevronDown size={14} /></ActionIcon>
                          </Table.Td>
                          <Table.Td>
                            <Select 
                              placeholder="Type or click to select an item."
                              data={products?.map(p => ({ value: p.id!.toString(), label: p.name })) || []}
                              searchable
                              variant="unstyled"
                              {...form.getInputProps(`items.${index}.productId`)}
                              onChange={(val) => {
                                const p = products?.find(prod => prod.id === Number(val));
                                if (p) {
                                  form.setFieldValue(`items.${index}.productId`, val!);
                                  form.setFieldValue(`items.${index}.productName`, p.name);
                                  form.setFieldValue(`items.${index}.rate`, p.price);
                                  form.setFieldValue(`items.${index}.hsnCode`, p.hsnCode);
                                }
                              }}
                            />
                            <TextInput placeholder="Add a description to your item" variant="unstyled" size="xs" {...form.getInputProps(`items.${index}.description`)} />
                          </Table.Td>
                          <Table.Td ta="right"><Text size="sm">{item.ordered || 0}</Text></Table.Td>
                          <Table.Td ta="right"><Text size="sm">{item.invoiced || 0}</Text></Table.Td>
                          <Table.Td ta="right"><Text size="sm">{item.packed || 0}</Text></Table.Td>
                          <Table.Td>
                            <NumberInput hideControls variant="unstyled" {...form.getInputProps(`items.${index}.quantity`)} />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput hideControls variant="unstyled" prefix="₹" {...form.getInputProps(`items.${index}.rate`)} />
                          </Table.Td>
                          <Table.Td>
                            <Select 
                              variant="unstyled"
                              data={TAX_OPTIONS}
                              {...form.getInputProps(`items.${index}.tax`)}
                            />
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text fw={600}>₹{(item.quantity * item.rate).toLocaleString()}</Text>
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon color="red" variant="subtle" onClick={() => form.removeListItem('items', index)}>
                              <Trash size={16} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  <Box p="md" style={{ borderTop: '1px solid #e2e8f0' }}>
                    <Group justify="space-between">
                      <Group>
                        <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={() => form.insertListItem('items', { productId: '', productName: '', description: '', quantity: 1, rate: 0, tax: 'gst18', amount: 0, hsnCode: '' })}>
                          Add New Row
                        </Button>
                        <Button variant="subtle" size="xs" leftSection={<Plus size={14} />}>Add Items in Bulk</Button>
                      </Group>
                      <Group>
                        <Button variant="subtle" size="xs" leftSection={<Scan size={14} />}>Scan Item</Button>
                      </Group>
                    </Group>
                  </Box>
                </Paper>
              </Box>

              {/* Totals Section */}
              <Grid gutter="xl">
                <Grid.Col span={6}>
                  <Stack gap="md">
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Customer Notes</Text>
                      <Textarea placeholder="Thanks for your business." rows={3} {...form.getInputProps('customerNotes')} />
                    </Box>
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Terms & Conditions</Text>
                      <Textarea placeholder="Enter terms and conditions..." rows={3} {...form.getInputProps('termsConditions')} />
                    </Box>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper withBorder p="md" bg="gray.0">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm">Sub Total</Text>
                        <Text size="sm" fw={600}>₹{subtotal.toLocaleString()}</Text>
                      </Group>
                      
                      <Grid align="center" gutter="xs">
                        <Grid.Col span={4}><Text size="sm">Discount</Text></Grid.Col>
                        <Grid.Col span={4}>
                          <TextInput label="Bank Name" {...form.getInputProps('bankName')} />
                        </Grid.Col>
                        <Grid.Col span={2}>
                          <Select size="xs" data={['%', '₹']} {...form.getInputProps('discountType')} />
                        </Grid.Col>
                        <Grid.Col span={2} ta="right">
                          <Text size="sm">-₹{discountAmount.toLocaleString()}</Text>
                        </Grid.Col>
                      </Grid>

                      {totalCgst > 0 && (
                        <Group justify="space-between">
                          <Text size="sm">CGST</Text>
                          <Text size="sm">₹{totalCgst.toLocaleString()}</Text>
                        </Group>
                      )}
                      {totalSgst > 0 && (
                        <Group justify="space-between">
                          <Text size="sm">SGST</Text>
                          <Text size="sm">₹{totalSgst.toLocaleString()}</Text>
                        </Group>
                      )}
                      {totalIgst > 0 && (
                        <Group justify="space-between">
                          <Text size="sm">IGST</Text>
                          <Text size="sm">₹{totalIgst.toLocaleString()}</Text>
                        </Group>
                      )}

                      <Grid align="center" gutter="xs">
                        <Grid.Col span={6}><Text size="sm">Shipping Charges</Text></Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput size="xs" {...form.getInputProps('shippingCharges')} />
                        </Grid.Col>
                        <Grid.Col span={2} ta="right">
                          <Text size="sm">₹{form.values.shippingCharges.toLocaleString()}</Text>
                        </Grid.Col>
                      </Grid>

                      <Grid align="center" gutter="xs">
                        <Grid.Col span={6}>
                          <Group gap={4}>
                            <Text size="sm">Adjustment</Text>
                            <ChevronDown size={12} />
                          </Group>
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput size="xs" {...form.getInputProps('adjustment')} />
                        </Grid.Col>
                        <Grid.Col span={2} ta="right">
                          <Text size="sm">₹{form.values.adjustment.toLocaleString()}</Text>
                        </Grid.Col>
                      </Grid>

                      <Divider my="sm" />
                      <Group justify="space-between">
                        <Title order={4}>Total ( ₹ )</Title>
                        <Title order={4} c="indigo">₹{total.toLocaleString()}</Title>
                      </Group>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>

              {/* Attachments Section */}
              <Box>
                <Text size="sm" mb="xs">Attach File(s) to Invoice</Text>
                <Button variant="outline" color="gray" leftSection={<Upload size={14} />} rightSection={<ChevronDown size={14} />}>
                  Upload File
                </Button>
                <Text size="xs" c="dimmed" mt="xs">You can upload a maximum of 10 files, 10MB each</Text>
              </Box>

              <Divider />

              {/* Additional Options */}
              <Stack gap="md">
                <Checkbox label={<Text size="sm" fw={600}>I have received the payment</Text>} />
                
                <Box>
                  <Text size="sm" fw={600} mb="xs">Email Communications</Text>
                  <Paper withBorder p="xs" radius="sm" bg="gray.0">
                    <Group gap="xl">
                       <Button variant="subtle" size="xs" leftSection={<Plus size={14} />}>Add New</Button>
                       <Group gap="xs">
                          <Checkbox checked readOnly />
                          <Text size="sm">{selectedCustomer?.name || 'Customer'} &lt;{selectedCustomer?.email || 'email@example.com'}&gt;</Text>
                       </Group>
                    </Group>
                  </Paper>
                </Box>
              </Stack>
            </Stack>

            {/* Footer Buttons */}
            <Box py="md" mt="xl" style={{ borderTop: '1px solid #e2e8f0' }}>
              <Group>
                <Button variant="outline" color="gray" onClick={() => handleSave(form.values, 'draft')}>Save as Draft</Button>
                <Group gap={0}>
                  <Button color="indigo" type="submit" style={{ borderRadius: '4px 0 0 4px' }}>Save and Send</Button>
                  <ActionIcon color="indigo" size={36} variant="filled" style={{ borderRadius: '0 4px 4px 0', borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
                    <ChevronDown size={16} />
                  </ActionIcon>
                </Group>
                <Button variant="outline" color="gray" onClick={onClose}>Cancel</Button>
              </Group>
            </Box>
          </form>
        </Box>
      </Box>

      {/* Item Detail Modal */}
      <Modal opened={!!viewItemId} onClose={() => setViewItemId(null)} size="80%" padding={0} withCloseButton={false}>
        {viewItemId && <ItemDetail itemId={viewItemId} onClose={() => setViewItemId(null)} onEdit={() => {}} />}
      </Modal>
    </Box>
  );
}
