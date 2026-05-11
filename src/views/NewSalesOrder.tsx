import React, { useState } from 'react';
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
  rem,
  UnstyledButton,
  Grid,
  Divider,
  Table,
  Textarea,
  Checkbox,
  Menu,
  Modal,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, HelpCircle, Plus, Search, Settings, History, Info, Trash, ChevronDown, MoreHorizontal, Upload, Edit, Sparkles } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { useLiveQuery } from 'dexie-react-hooks';
import { ItemDetail } from './ItemDetail';
import { Eye } from 'lucide-react';

interface NewSalesOrderProps {
  onClose: () => void;
  editingId?: number;
  isCloning?: boolean;
}

export function NewSalesOrder({ onClose, editingId, isCloning }: NewSalesOrderProps) {
  const customers = useLiveQuery(() => db.partners.filter(p => p.type === 'customer' || p.type === 'both').toArray());
  const products = useLiveQuery(() => db.products.toArray());
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
      orderNumber: '',
      reference: '',
      orderDate: new Date().toISOString().split('T')[0],
      shipmentDate: '',
      paymentTerms: 'Due on Receipt',
      deliveryMethod: '',
      salesperson: '',
      items: [
        { productId: '', productName: '', description: '', quantity: 1, rate: 0, tax: 'gst18', amount: 0 }
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
        quantity: (value) => (value <= 0 ? 'Invalid' : null),
      }
    }
  });

  React.useEffect(() => {
    const loadData = async () => {
      if (editingId) {
        const order = await db.salesOrders.get(editingId);
        if (order) {
          form.setValues({
            ...order,
            customerId: order.customerId.toString(),
            orderDate: new Date(order.date).toISOString().split('T')[0],
            shipmentDate: order.shipmentDate ? new Date(order.shipmentDate).toISOString().split('T')[0] : '',
            orderNumber: isCloning ? '' : order.orderNumber,
          });
        }
      }
      
      if (!editingId || isCloning) {
        const count = await db.salesOrders.count();
        const { generateDocNumber } = await import('../utils/numberSeries');
        form.setFieldValue('orderNumber', await generateDocNumber('salesOrder'));
      }
    };
    loadData();
  }, [editingId, isCloning]);

  const selectedCustomer = customers?.find(c => c.id === Number(form.values.customerId));
  const isInterState = selectedCustomer && settings && selectedCustomer.billingState !== settings.shopState;

  // Auto-switch taxes when customer or settings change
  React.useEffect(() => {
    if (!selectedCustomer || !settings) return;
    
    const customerIsInterState = selectedCustomer.billingState !== settings.shopState;
    const updatedItems = form.values.items.map(item => {
      let tax = item.tax;
      if (customerIsInterState && tax.startsWith('gst')) {
        tax = tax.replace('gst', 'igst');
      } else if (!customerIsInterState && tax.startsWith('igst')) {
        tax = tax.replace('igst', 'gst');
      }
      return { ...item, tax };
    });
    
    // Only update if something actually changed to avoid infinite loops
    const hasChanged = updatedItems.some((item, idx) => item.tax !== form.values.items[idx].tax);
    if (hasChanged) {
      form.setFieldValue('items', updatedItems);
    }
  }, [form.values.customerId, settings, selectedCustomer]);

  const addItemRow = () => {
    form.insertListItem('items', { productId: '', productName: '', description: '', quantity: 1, rate: 0, tax: 'gst18', amount: 0 });
  };


  const calculateGST = (subtotal: number, taxType: string) => {
    const rate = parseInt(taxType.replace(/\D/g, '')) || 0;
    const totalGst = (subtotal * rate) / 100;
    
    if (taxType.startsWith('igst')) {
      return { cgst: 0, sgst: 0, igst: totalGst };
    } else {
      return { cgst: totalGst / 2, sgst: totalGst / 2, igst: 0 };
    }
  };

  const itemGSTs = form.values.items.map(item => calculateGST(item.quantity * item.rate, item.tax));
  
  const subtotal = form.values.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const totalCgst = itemGSTs.reduce((acc, g) => acc + g.cgst, 0);
  const totalSgst = itemGSTs.reduce((acc, g) => acc + g.sgst, 0);
  const totalIgst = itemGSTs.reduce((acc, g) => acc + g.igst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;

  const total = subtotal + totalTax + form.values.shippingCharges + form.values.adjustment - (form.values.discountType === '%' ? (subtotal * form.values.discount / 100) : form.values.discount);

  const TAX_OPTIONS = [
    { label: 'GST 5% (CGST 2.5% + SGST 2.5%)', value: 'gst5' },
    { label: 'GST 12% (CGST 6% + SGST 6%)', value: 'gst12' },
    { label: 'GST 18% (CGST 9% + SGST 9%)', value: 'gst18' },
    { label: 'GST 28% (CGST 14% + SGST 14%)', value: 'gst28' },
    { label: 'IGST 5%', value: 'igst5' },
    { label: 'IGST 12%', value: 'igst12' },
    { label: 'IGST 18%', value: 'igst18' },
    { label: 'IGST 28%', value: 'igst28' },
    { label: 'Non-Taxable', value: 'none' },
  ];

  const handleSave = async (values: typeof form.values, status: 'draft' | 'confirmed' | 'pending' = 'pending') => {
    try {
      const orderData = {
        orderNumber: values.orderNumber,
        reference: values.reference,
        customerId: Number(values.customerId),
        partnerName: values.customerName,
        date: new Date(values.orderDate),
        shipmentDate: values.shipmentDate ? new Date(values.shipmentDate) : undefined,
        paymentTerms: values.paymentTerms,
        deliveryMethod: values.deliveryMethod,
        salesperson: values.salesperson,
        items: values.items.map((i, idx) => ({
          productId: Number(i.productId),
          productName: i.productName,
          quantity: i.quantity,
          price: i.rate,
          total: i.quantity * i.rate + itemGSTs[idx].cgst + itemGSTs[idx].sgst + itemGSTs[idx].igst,
          gstRate: parseInt(i.tax.replace(/\D/g, '')) || 0,
          cgst: itemGSTs[idx].cgst,
          sgst: itemGSTs[idx].sgst,
          igst: itemGSTs[idx].igst,
        })),
        subtotal: subtotal,
        totalGst: totalTax,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        discount: values.discount,
        discountType: values.discountType,
        shippingCharges: values.shippingCharges,
        adjustment: values.adjustment,
        total: total,
        totalAmount: total,
        status: status,
        customerNotes: values.customerNotes,
        termsConditions: values.termsConditions,
      };

      if (editingId && !isCloning) {
        await db.salesOrders.update(editingId, orderData);
        notifications.show({ title: 'Success', message: 'Sales Order updated', color: 'green' });
      } else {
        await db.salesOrders.add(orderData);
        notifications.show({ title: 'Success', message: 'Sales Order created', color: 'green' });
      }
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: 'Failed to save order', color: 'red' });
    }
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <Group justify="space-between">
          <Group gap="xs">
            <History size={20} color="#adb5bd" style={{ cursor: 'pointer' }} />
            <Title order={3} fw={500}>New Sales Order</Title>
          </Group>
          <Group gap="sm">
            <ActionIcon variant="subtle" color="gray">
              <Settings size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <X size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p="xl">
        <Box maw={1200} mx="auto">
          <form onSubmit={form.onSubmit((vals) => handleSave(vals, 'pending'))}>
            <Stack gap="xl">
              {/* Customer Section */}
              <Box>
                <Grid align="center">
                  <Grid.Col span={2} pt="sm">
                    <Text size="sm" c="red">Customer Name*</Text>
                  </Grid.Col>
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

              {/* Order Details Section */}
              <Box>
                <Grid align="center" mb="sm">
                  <Grid.Col span={2}>
                    <Text size="sm" c="red">Sales Order#*</Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput 
                      {...form.getInputProps('orderNumber')} 
                      rightSection={<Settings size={14} color="#3b82f6" style={{ cursor: 'pointer' }} />}
                    />
                  </Grid.Col>
                </Grid>

                <Grid align="center" mb="sm">
                  <Grid.Col span={2}>
                    <Group gap="xs">
                      <Text size="sm">Reference#</Text>
                      <HelpCircle size={14} color="#adb5bd" />
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput {...form.getInputProps('reference')} />
                  </Grid.Col>
                </Grid>

                <Grid align="center" mb="sm">
                  <Grid.Col span={2}>
                    <Text size="sm" c="red">Sales Order Date*</Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput type="date" {...form.getInputProps('orderDate')} />
                  </Grid.Col>
                </Grid>

                <Grid align="center" mb="sm">
                  <Grid.Col span={2}>
                    <Text size="sm">Expected Shipment Date</Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput type="date" placeholder="yyyy/MM/dd" {...form.getInputProps('shipmentDate')} />
                  </Grid.Col>
                </Grid>

                <Grid align="center" mb="sm">
                  <Grid.Col span={2}>
                    <Text size="sm">Payment Terms</Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Select 
                      data={['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60']} 
                      {...form.getInputProps('paymentTerms')} 
                    />
                  </Grid.Col>
                </Grid>

                <Grid align="center" mb="sm">
                  <Grid.Col span={2}>
                    <Text size="sm">Delivery Method</Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Select 
                      placeholder="Select a delivery method" 
                      data={['DHL', 'FedEx', 'UPS', 'Local Courier']} 
                      searchable 
                      {...form.getInputProps('deliveryMethod')} 
                    />
                  </Grid.Col>
                </Grid>

                <Grid align="center" mb="sm">
                  <Grid.Col span={2}>
                    <Text size="sm">Salesperson</Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Select 
                      placeholder="Select Salesperson" 
                      data={[]} 
                      searchable 
                      {...form.getInputProps('salesperson')} 
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              {/* Item Table Section */}
              <Box>
                <Paper withBorder radius="md" bg="#f8f9fa">
                  <Table withColumnBorders verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr bg="white">
                        <Table.Th style={{ width: '40%' }}>ITEM DETAILS</Table.Th>
                        <Table.Th style={{ width: '15%' }}>QUANTITY</Table.Th>
                        <Table.Th style={{ width: '15%' }}>
                          <Group gap="xs">
                            <Text size="xs" fw={700}>RATE</Text>
                            <Box style={{ border: '1px solid #dee2e6', borderRadius: '4px', padding: '2px' }}>
                              <Settings size={10} color="#adb5bd" />
                            </Box>
                          </Group>
                        </Table.Th>
                        <Table.Th style={{ width: '15%' }}>TAX</Table.Th>
                        <Table.Th style={{ width: '15%', textAlign: 'right' }}>AMOUNT</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {form.values.items.map((item, index) => (
                        <Table.Tr key={index} bg="white">
                          <Table.Td>
                            <Stack gap="xs">
                              <Select 
                                placeholder="Type or click to select an item." 
                                data={products?.map(p => ({ value: p.id!.toString(), label: p.name })) || []}
                                searchable
                                styles={{ input: { border: 'none', backgroundColor: 'transparent' } }}
                                onChange={(val) => {
                                  const p = products?.find(prod => prod.id === Number(val));
                                  if (p) {
                                    form.setFieldValue(`items.${index}.productId`, val!);
                                    form.setFieldValue(`items.${index}.productName`, p.name);
                                    form.setFieldValue(`items.${index}.rate`, p.price);
                                    
                                    // Default tax from product
                                    let tax = p.taxType || 'gst18';
                                    
                                    // Auto-switch to IGST for inter-state customers
                                    if (isInterState && tax.startsWith('gst')) {
                                      tax = tax.replace('gst', 'igst');
                                    } else if (!isInterState && tax.startsWith('igst')) {
                                      tax = tax.replace('igst', 'gst');
                                    }
                                    
                                    form.setFieldValue(`items.${index}.tax`, tax);
                                  }
                                }}
                              />
                              <Textarea 
                                placeholder="Add a description to your item" 
                                autosize 
                                minRows={1} 
                                styles={{ input: { border: 'none', backgroundColor: 'transparent', fontSize: rem(12) } }}
                                {...form.getInputProps(`items.${index}.description`)}
                              />
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Stack gap={0} align="center">
                              <NumberInput 
                                styles={{ input: { border: 'none', backgroundColor: 'transparent', textAlign: 'center' } }}
                                {...form.getInputProps(`items.${index}.quantity`)}
                              />
                              <Text size="xs" c="dimmed">Stock on Hand:</Text>
                              <Text size="xs" c="red">0 pcs <Info size={10} /></Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Stack gap={0} align="center">
                              <NumberInput 
                                styles={{ input: { border: 'none', backgroundColor: 'transparent', textAlign: 'center' } }}
                                {...form.getInputProps(`items.${index}.rate`)}
                              />
                              <Text size="xs" c="blue" style={{ cursor: 'pointer' }}>Recent Transactions</Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Select 
                              placeholder="Select a Tax" 
                              data={TAX_OPTIONS}
                              styles={{ input: { border: 'none', backgroundColor: 'transparent' } }}
                              {...form.getInputProps(`items.${index}.tax`)}
                            />
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Group justify="flex-end" gap="xs">
                              <Text fw={500}>{(item.quantity * item.rate).toLocaleString()}</Text>
                              {form.values.items.length > 1 && (
                                <ActionIcon variant="subtle" color="red" onClick={() => form.removeListItem('items', index)}>
                                  <Trash size={14} />
                                </ActionIcon>
                              )}
                              <ActionIcon 
                                variant="subtle" 
                                color="blue" 
                                onClick={() => setViewItemId(Number(item.productId))}
                                disabled={!item.productId}
                              >
                                <Eye size={14} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Paper>

                <Group mt="md" justify="space-between">
                  <Group>
                    <Button variant="subtle" leftSection={<Plus size={14} />} color="blue" onClick={addItemRow}>
                      Add New Row
                    </Button>
                    <Button variant="subtle" leftSection={<Plus size={14} />} color="blue">
                      Add Items in Bulk
                    </Button>
                  </Group>
                  <Group>
                    <UnstyledButton>
                      <Group gap="xs">
                        <Box bg="blue" p={2} style={{ borderRadius: '4px' }}><Plus size={10} color="white" /></Box>
                        <Text size="sm" c="blue" fw={500}>Reporting Tags</Text>
                        <ChevronDown size={14} color="#3b82f6" />
                      </Group>
                    </UnstyledButton>
                  </Group>
                </Group>
              </Box>

              {/* Summary Section */}
              <Box>
                <Grid gutter="xl">
                  <Grid.Col span={6}>
                    <Stack gap="md">
                      <Box>
                        <Text size="sm" mb="xs">Customer Notes</Text>
                        <Textarea placeholder="Enter any notes to be displayed in your transaction" rows={3} {...form.getInputProps('customerNotes')} />
                      </Box>
                      <Box>
                        <Text size="sm" mb="xs">Terms & Conditions</Text>
                        <Textarea placeholder="Enter the terms and conditions of your business to be displayed in your transaction" rows={4} {...form.getInputProps('termsConditions')} />
                      </Box>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper withBorder p="md" radius="md" bg="#f8f9fa">
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>Sub Total</Text>
                          <Text size="sm" fw={500}>{subtotal.toLocaleString()}</Text>
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm">Discount</Text>
                          <Group gap={0}>
                            <NumberInput w={100} styles={{ input: { borderRadius: '4px 0 0 4px' } }} {...form.getInputProps('discount')} />
                            <Select data={['%', 'Fixed']} w={80} defaultValue="%" styles={{ input: { borderRadius: '0 4px 4px 0', borderLeft: 'none' } }} />
                          </Group>
                        </Group>

                        {totalCgst > 0 && (
                          <Group justify="space-between">
                            <Text size="sm">CGST</Text>
                            <Text size="sm">{totalCgst.toLocaleString()}</Text>
                          </Group>
                        )}
                        {totalSgst > 0 && (
                          <Group justify="space-between">
                            <Text size="sm">SGST</Text>
                            <Text size="sm">{totalSgst.toLocaleString()}</Text>
                          </Group>
                        )}
                        {totalIgst > 0 && (
                          <Group justify="space-between">
                            <Text size="sm">IGST</Text>
                            <Text size="sm">{totalIgst.toLocaleString()}</Text>
                          </Group>
                        )}

                        <Group justify="space-between">
                          <Group gap="xs">
                            <Text size="sm">Shipping Charges</Text>
                            <HelpCircle size={14} color="#adb5bd" />
                          </Group>
                          <NumberInput {...form.getInputProps('shippingCharges')} />
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <TextInput 
                              placeholder="Adjustment" 
                              styles={{ input: { border: 'none', backgroundColor: 'transparent', padding: 0, fontWeight: 500, fontSize: rem(14) } }} 
                              w={100}
                            />
                            <HelpCircle size={14} color="#adb5bd" />
                          </Group>
                          <NumberInput {...form.getInputProps('adjustment')} />
                        </Group>

                        <Divider my="sm" />

                        <Group justify="space-between">
                          <Title order={4}>Total ( ₹ )</Title>
                          <Title order={4}>{total.toLocaleString()}</Title>
                        </Group>
                      </Stack>
                    </Paper>

                    <Box mt="xl">
                      <Text size="sm" mb="xs">Attach File(s) to Sales Order</Text>
                      <Button variant="outline" color="gray" leftSection={<Upload size={14} />} rightSection={<ChevronDown size={14} />}>
                        Upload File
                      </Button>
                      <Text size="xs" c="dimmed" mt="xs">You can upload a maximum of 10 files, 5MB each</Text>
                    </Box>
                  </Grid.Col>
                </Grid>
              </Box>
            </Stack>

            {/* Sticky Footer Actions */}
            <Box py="md" mt="xl" style={{ borderTop: '1px solid #e2e8f0' }}>
              <Group justify="space-between">
                <Group>
                  <Button variant="outline" color="gray" radius="md" onClick={() => handleSave(form.values, 'draft')}>Save as Draft</Button>
                  <Group gap={0}>
                    <Button color="indigo" radius="md" style={{ borderRadius: '4px 0 0 4px' }} type="submit">Save and Send</Button>
                    <ActionIcon color="indigo" size={36} variant="filled" style={{ borderRadius: '0 4px 4px 0', borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
                      <ChevronDown size={16} />
                    </ActionIcon>
                  </Group>
                  <Button variant="outline" color="gray" radius="md" onClick={onClose}>Cancel</Button>
                </Group>
                
                <Box style={{ position: 'fixed', bottom: 20, right: 20, textAlign: 'right' }} visibleFrom="md">
                  <Text size="xs" fw={700}>Total Amount: ₹ {total.toLocaleString()}</Text>
                  <Text size="xs" c="dimmed">Total Quantity: {form.values.items.reduce((acc, i) => acc + i.quantity, 0)}</Text>
                </Box>
              </Group>
            </Box>
          </form>
        </Box>
      </Box>

      <Modal 
        opened={!!viewItemId} 
        onClose={() => setViewItemId(null)} 
        size="80%" 
        padding={0} 
        withCloseButton={false}
      >
        {viewItemId && (
          <ItemDetail 
            itemId={viewItemId} 
            onClose={() => setViewItemId(null)} 
            onEdit={(id) => {
              setViewItemId(null);
              // Handle edit? Maybe not needed from here
            }}
          />
        )}
      </Modal>
    </Box>
  );
}
