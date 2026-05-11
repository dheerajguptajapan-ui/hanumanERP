import React from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Button, 
  TextInput, 
  NumberInput,
  Stack,
  Text,
  Select,
  Box,
  ActionIcon,
  Grid,
  Divider,
  Table,
  Textarea,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, Plus, Search, Settings, History, Trash, Scan, Sparkles, Edit } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { useLiveQuery } from 'dexie-react-hooks';

interface NewSalesReceiptProps {
  onClose: () => void;
  editingId?: number;
}

export function NewSalesReceipt({ onClose, editingId }: NewSalesReceiptProps) {
  const customers = useLiveQuery(() => db.partners.filter(p => p.type === 'customer' || p.type === 'both').toArray());
  const products = useLiveQuery(() => db.products.toArray());
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  const form = useForm({
    initialValues: {
      receiptNumber: '',
      customerId: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      salesperson: '',
      paymentMode: 'Cash',
      depositTo: 'Undeposited Funds',
      reference: '',
      items: [
        { productId: '', productName: '', description: '', quantity: 1, rate: 0, tax: 'gst18', amount: 0, hsnCode: '' }
      ],
      discount: 0,
      discountType: '%',
      shippingCharges: 0,
      adjustment: 0,
      customerNotes: '',
      termsConditions: '',
    },
    validate: {
      customerId: (value) => (!value ? 'Customer is required' : null),
      items: {
        productId: (value) => (!value ? 'Required' : null),
      }
    }
  });

  React.useEffect(() => {
    const loadData = async () => {
      if (editingId) {
        const receipt = await db.salesReceipts.get(editingId);
        if (receipt) {
          form.setValues({
            ...receipt,
            customerId: receipt.customerId.toString(),
            date: new Date(receipt.date).toISOString().split('T')[0],
          } as any);
        }
      } else {
        const { generateDocNumber } = await import('../utils/numberSeries');
        form.setFieldValue('receiptNumber', await generateDocNumber('salesReceipt'));
      }
    };
    loadData();
  }, [editingId]);

  const selectedCustomer = customers?.find(c => c.id === Number(form.values.customerId));

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

  const calculateGST = (subtotal: number, taxType: string) => {
    const rate = parseInt(taxType.replace(/\D/g, '')) || 0;
    const totalGst = (subtotal * rate) / 100;
    if (taxType.startsWith('igst')) {
      return { cgst: 0, sgst: 0, igst: totalGst, rate };
    } else {
      return { cgst: totalGst / 2, sgst: totalGst / 2, igst: 0, rate };
    }
  };

  const subtotal = form.values.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const taxDetails = form.values.items.map(item => calculateGST(item.quantity * item.rate, item.tax));
  const totalCgst = taxDetails.reduce((acc, d) => acc + d.cgst, 0);
  const totalSgst = taxDetails.reduce((acc, d) => acc + d.sgst, 0);
  const totalIgst = taxDetails.reduce((acc, d) => acc + d.igst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;

  const discountAmount = form.values.discountType === '%' ? (subtotal * form.values.discount / 100) : form.values.discount;
  const total = subtotal - discountAmount + totalTax + form.values.shippingCharges + form.values.adjustment;

  const handleSave = async (values: typeof form.values) => {
    try {
      const receiptData = {
        receiptNumber: values.receiptNumber,
        customerId: Number(values.customerId),
        customerName: values.customerName,
        date: new Date(values.date),
        salesperson: values.salesperson,
        paymentMode: values.paymentMode,
        depositTo: values.depositTo,
        reference: values.reference,
        items: values.items.map((i, idx) => ({
          productId: Number(i.productId),
          productName: i.productName,
          hsnCode: i.hsnCode,
          quantity: i.quantity,
          price: i.rate,
          gstRate: taxDetails[idx].rate,
          gstAmount: taxDetails[idx].cgst + taxDetails[idx].sgst + taxDetails[idx].igst,
          total: i.quantity * i.rate + (taxDetails[idx].cgst + taxDetails[idx].sgst + taxDetails[idx].igst),
        })),
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
        status: 'saved',
        customerNotes: values.customerNotes,
        termsConditions: values.termsConditions,
      };

      if (editingId) {
        await db.salesReceipts.update(editingId, receiptData as any);
        notifications.show({ title: 'Success', message: 'Sales receipt updated', color: 'green' });
      } else {
        await db.salesReceipts.add(receiptData as any);
        notifications.show({ title: 'Success', message: 'Sales receipt created', color: 'green' });
      }
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: 'Failed to save receipt', color: 'red' });
    }
  };

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

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <Group justify="space-between">
          <Group gap="xs">
            <History size={20} color="#adb5bd" />
            <Title order={3} fw={500}>{editingId ? 'Edit Sales Receipt' : 'New Sales Receipt'}</Title>
          </Group>
          <Group gap="sm">
            <ActionIcon variant="subtle" color="gray"><Settings size={20} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflowY: 'auto' }} p="xl">
        <Box maw={1200} mx="auto">
          <form onSubmit={form.onSubmit(handleSave)}>
            <Stack gap="xl">
              <Box>
                <Grid align="flex-start">
                  <Grid.Col span={2} pt="sm"><Text size="sm" c="red">Customer Name*</Text></Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap="md">
                      <Group gap={0}>
                        <Select 
                          placeholder="Select Customer" 
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
                            <Text size="xs" fw={700} c="dimmed">ADDRESS</Text>
                            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{formatAddress(selectedCustomer, 'billing')}</Text>
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

              <Grid gutter="xl">
                <Grid.Col span={6}>
                  <Stack gap="sm">
                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm" c="red">Receipt Date*</Text></Grid.Col>
                      <Grid.Col span={8}><TextInput type="date" {...form.getInputProps('date')} /></Grid.Col>
                    </Grid>
                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm" c="red">Sales Receipt#*</Text></Grid.Col>
                      <Grid.Col span={8}><TextInput {...form.getInputProps('receiptNumber')} /></Grid.Col>
                    </Grid>
                    <Grid align="center">
                      <Grid.Col span={4}><Text size="sm">Salesperson</Text></Grid.Col>
                      <Grid.Col span={8}><Select placeholder="Select Salesperson" data={['John Doe', 'Jane Smith']} {...form.getInputProps('salesperson')} /></Grid.Col>
                    </Grid>
                  </Stack>
                </Grid.Col>
              </Grid>

              <Paper withBorder>
                <Table withRowBorders>
                  <Table.Thead bg="#f8f9fa">
                    <Table.Tr>
                      <Table.Th style={{ width: '40%' }}>ITEM DETAILS</Table.Th>
                      <Table.Th style={{ width: '10%' }}>QUANTITY</Table.Th>
                      <Table.Th style={{ width: '15%' }}>RATE</Table.Th>
                      <Table.Th style={{ width: '15%' }}>TAX</Table.Th>
                      <Table.Th style={{ width: '15%' }} ta="right">AMOUNT</Table.Th>
                      <Table.Th style={{ width: '5%' }} />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {form.values.items.map((item, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Select 
                            placeholder="Type or click to select an item."
                            variant="unstyled"
                            data={products?.map(p => ({ value: p.id!.toString(), label: p.name })) || []}
                            searchable
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
                  <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={() => form.insertListItem('items', { productId: '', productName: '', description: '', quantity: 1, rate: 0, tax: 'gst18', amount: 0, hsnCode: '' })}>
                    Add New Row
                  </Button>
                </Box>
              </Paper>

              <Grid gutter={40}>
                <Grid.Col span={6}>
                  <Stack gap="md">
                    <Textarea label="Notes" placeholder="Will be displayed on the sales receipt" rows={3} {...form.getInputProps('customerNotes')} />
                    <Textarea label="Terms & Conditions" placeholder="Enter terms and conditions" rows={3} {...form.getInputProps('termsConditions')} />
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper p="md" withBorder bg="#f8f9fa">
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text size="sm">Sub Total</Text>
                        <Text size="sm">₹{subtotal.toLocaleString()}</Text>
                      </Group>

                      <Grid align="center" gutter="xs">
                        <Grid.Col span={4}><Text size="sm">Discount</Text></Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput size="xs" {...form.getInputProps('discount')} />
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
                        <Grid.Col span={6}><Text size="sm">Adjustment</Text></Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput size="xs" {...form.getInputProps('adjustment')} />
                        </Grid.Col>
                        <Grid.Col span={2} ta="right">
                          <Text size="sm">₹{form.values.adjustment.toLocaleString()}</Text>
                        </Grid.Col>
                      </Grid>

                      <Divider />
                      <Group justify="space-between">
                        <Text fw={700} size="lg">Total Paid</Text>
                        <Title order={3} c="blue">₹{total.toLocaleString()}</Title>
                      </Group>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>

              <Divider />
              
              <Box>
                <Title order={5} mb="md">Payment Details</Title>
                <Grid>
                  <Grid.Col span={4}>
                    <Select label="Payment Mode*" data={['Cash', 'Check', 'Credit Card', 'Bank Transfer']} {...form.getInputProps('paymentMode')} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Select label="Deposit To*" data={['Undeposited Funds', 'Petty Cash', 'Bank Account']} {...form.getInputProps('depositTo')} />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput label="Reference#" {...form.getInputProps('reference')} />
                  </Grid.Col>
                </Grid>
              </Box>

              <Group justify="flex-end" p="md" bg="white" style={{ position: 'sticky', bottom: 0, borderTop: '1px solid #e2e8f0', zIndex: 10 }}>
                <Button variant="outline" color="gray" onClick={onClose}>Cancel</Button>
                <Button type="submit" color="blue">Save</Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
