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
  ScrollArea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, Search, Image as ImageIcon, Upload, Plus, Trash2, ChevronDown, Settings, Package } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';

interface NewPurchaseOrderProps {
  onClose: () => void;
  editingId?: number;
}

export function NewPurchaseOrder({ onClose, editingId }: NewPurchaseOrderProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([
    { productId: '', account: '', quantity: 1, rate: 0, tax: '0', amount: 0 }
  ]);

  const form = useForm({
    initialValues: {
      vendorId: '',
      deliveryDestination: 'organization',
      deliveryAddress: '',
      purchaseOrderNumber: 'PO-00001',
      reference: '',
      date: new Date(),
      deliveryDate: null as Date | null,
      paymentTerms: 'Due on Receipt',
      shipmentPreference: '',
      taxPreference: 'exclusive',
      discount: 0,
      discountType: '%' as '%' | 'fixed',
      adjustment: 0,
      notes: '',
      termsConditions: '',
      attachments: [] as { name: string, base64: string }[],
    },
    validate: {
      vendorId: (val) => (!val ? 'Vendor is required' : null),
      purchaseOrderNumber: (val) => (!val ? 'PO Number is required' : null),
    }
  });

  useEffect(() => {
    const loadData = async () => {
      const v = await db.partners.filter(p => p.type === 'supplier' || p.type === 'both').toArray();
      setVendors(v);

      const p = await db.products.toArray();
      setProducts(p);

      if (editingId) {
        const po = await db.purchaseOrders.get(editingId);
        if (po) {
          form.setValues({
            vendorId: po.vendorId.toString(),
            deliveryDestination: po.deliveryDestination,
            deliveryAddress: po.deliveryAddress,
            purchaseOrderNumber: po.purchaseOrderNumber,
            reference: po.reference || '',
            date: new Date(po.date),
            deliveryDate: po.deliveryDate ? new Date(po.deliveryDate) : null,
            paymentTerms: po.paymentTerms,
            shipmentPreference: po.shipmentPreference || '',
            taxPreference: 'exclusive', // or determine from data
            discount: po.discount,
            discountType: po.discountType,
            adjustment: po.adjustment,
            notes: po.notes || '',
            termsConditions: po.termsConditions || '',
            attachments: po.attachments || [],
          });
          setItems(po.items.length > 0 ? po.items : [{ productId: '', account: '', quantity: 1, rate: 0, tax: '0', amount: 0 }]);
        }
      } else {
        // Auto-generate PO Number
        const count = await db.purchaseOrders.count();
        const { generateDocNumber } = await import('../utils/numberSeries');
        form.setFieldValue('purchaseOrderNumber', await generateDocNumber('purchaseOrder'));
      }
    };
    loadData();
  }, [editingId]);

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

  const handleSave = async (status: 'draft' | 'issued' = 'draft') => {
    if (form.validate().hasErrors) return;

    const vendor = vendors.find(v => v.id.toString() === form.values.vendorId);

    const data = {
      purchaseOrderNumber: form.values.purchaseOrderNumber,
      vendorId: Number(form.values.vendorId),
      vendorName: vendor ? vendor.name : 'Unknown Vendor',
      deliveryDestination: form.values.deliveryDestination as any,
      deliveryAddress: form.values.deliveryAddress,
      date: form.values.date,
      deliveryDate: form.values.deliveryDate || undefined,
      paymentTerms: form.values.paymentTerms,
      reference: form.values.reference,
      shipmentPreference: form.values.shipmentPreference,
      items: items.map(item => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
      subtotal,
      totalGst: totalTax, // Simplified tax handling for now
      cgst: 0,
      sgst: 0,
      igst: 0,
      discount: form.values.discount,
      discountType: form.values.discountType,
      adjustment: Number(form.values.adjustment),
      total,
      status,
      notes: form.values.notes,
      termsConditions: form.values.termsConditions,
      attachments: form.values.attachments
    };

    try {
      if (editingId) {
        await db.purchaseOrders.update(editingId, data);
        notifications.show({ title: 'Success', message: 'Purchase Order updated', color: 'green' });
      } else {
        await db.purchaseOrders.add(data as any);
        notifications.show({ title: 'Success', message: 'Purchase Order created', color: 'green' });
      }
      onClose();
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Failed to save Purchase Order', color: 'red' });
    }
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <Group justify="space-between">
          <Group gap="sm">
             <Package size={20} color="#64748b" />
             <Title order={3} fw={500}>{editingId ? 'Edit Purchase Order' : 'New Purchase Order'}</Title>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Form Content */}
      <ScrollArea style={{ flex: 1 }}>
        <Box p="xl" bg="#f8f9fa" style={{ minHeight: '100%' }}>
          <Paper withBorder p="xl" radius="md" bg="white" maw={1000} mx="auto">
            <Stack gap={rem(30)}>
              
              {/* Header Details */}
              <Grid gutter="xl">
                <Grid.Col span={12}>
                  <Grid align="center">
                    <Grid.Col span={2}><Text size="sm" c="red">Vendor Name*</Text></Grid.Col>
                    <Grid.Col span={10}>
                      <Stack gap="xs">
                        <Group gap="xs" wrap="nowrap">
                          <Select 
                            placeholder="Select a Vendor"
                            data={vendors.map(v => ({ value: v.id.toString(), label: v.name }))}
                            searchable
                            {...form.getInputProps('vendorId')}
                            maw={400}
                          />
                          <ActionIcon color="blue" variant="filled" size="lg"><Search size={16} /></ActionIcon>
                        </Group>
                        {form.values.vendorId && (() => {
                          const vendor = vendors.find(v => v.id.toString() === form.values.vendorId);
                          if (!vendor) return null;
                          return (
                            <Grid mt="xs" maw={600}>
                              <Grid.Col span={6}>
                                <Text size="xs" fw={600} c="dimmed" mb={5}>BILLING ADDRESS</Text>
                                <Text size="sm">{vendor.billingLine1}</Text>
                                {vendor.billingLine2 && <Text size="sm">{vendor.billingLine2}</Text>}
                                <Text size="sm">{vendor.billingCity}</Text>
                                <Text size="sm">{vendor.billingState} {vendor.billingPincode}</Text>
                                <Text size="sm">{vendor.billingCountry}</Text>
                                {vendor.phone && <Text size="sm" mt={4}>Phone: {vendor.phone}</Text>}
                              </Grid.Col>
                              <Grid.Col span={6}>
                                <Text size="xs" fw={600} c="dimmed" mb={5}>SHIPPING ADDRESS</Text>
                                <Text size="sm">{vendor.shippingLine1}</Text>
                                {vendor.shippingLine2 && <Text size="sm">{vendor.shippingLine2}</Text>}
                                <Text size="sm">{vendor.shippingCity}</Text>
                                <Text size="sm">{vendor.shippingState} {vendor.shippingPincode}</Text>
                                <Text size="sm">{vendor.shippingCountry}</Text>
                                {vendor.phone && <Text size="sm" mt={4}>Phone: {vendor.phone}</Text>}
                              </Grid.Col>
                            </Grid>
                          );
                        })()}
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Grid align="flex-start">
                    <Grid.Col span={2} pt={8}><Text size="sm" c="red">Delivery Address*</Text></Grid.Col>
                    <Grid.Col span={10}>
                       <Radio.Group {...form.getInputProps('deliveryDestination')} mb="sm">
                          <Group>
                             <Radio value="organization" label="Organization" />
                             <Radio value="customer" label="Customer" />
                          </Group>
                       </Radio.Group>
                       <Textarea 
                         placeholder="Enter delivery address" 
                         minRows={3} 
                         maw={400} 
                         {...form.getInputProps('deliveryAddress')}
                       />
                       <Text size="xs" c="blue" mt={4} style={{ cursor: 'pointer' }}>Change destination to deliver</Text>
                    </Grid.Col>
                  </Grid>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Grid align="center">
                    <Grid.Col span={2}><Text size="sm" c="red">Purchase Order#*</Text></Grid.Col>
                    <Grid.Col span={10}>
                      <Group gap="xs">
                         <TextInput {...form.getInputProps('purchaseOrderNumber')} maw={250} />
                         <ActionIcon variant="subtle" color="blue"><Settings size={16} /></ActionIcon>
                      </Group>
                    </Grid.Col>
                  </Grid>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Grid align="center">
                    <Grid.Col span={2}><Text size="sm">Reference#</Text></Grid.Col>
                    <Grid.Col span={10}>
                      <TextInput {...form.getInputProps('reference')} maw={250} />
                    </Grid.Col>
                  </Grid>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Grid align="center">
                    <Grid.Col span={2}><Text size="sm" c="red">Date*</Text></Grid.Col>
                    <Grid.Col span={10}>
                      <DateInput valueFormat="YYYY/MM/DD" {...form.getInputProps('date')} maw={250} />
                    </Grid.Col>
                  </Grid>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Grid align="center">
                    <Grid.Col span={2}><Text size="sm">Delivery Date</Text></Grid.Col>
                    <Grid.Col span={4}>
                      <DateInput placeholder="yyyy/MM/dd" valueFormat="YYYY/MM/DD" {...form.getInputProps('deliveryDate')} />
                    </Grid.Col>
                    <Grid.Col span={2}><Text size="sm">Payment Terms</Text></Grid.Col>
                    <Grid.Col span={4}>
                      <Select 
                         data={['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due end of the month']} 
                         {...form.getInputProps('paymentTerms')} 
                      />
                    </Grid.Col>
                  </Grid>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Grid align="center">
                    <Grid.Col span={2}><Text size="sm">Shipment Preference</Text></Grid.Col>
                    <Grid.Col span={10}>
                      <Select 
                         placeholder="Choose the shipment preference or type to add" 
                         data={['Air', 'Ocean', 'Ground']} 
                         searchable 
                         maw={400} 
                         {...form.getInputProps('shipmentPreference')}
                      />
                    </Grid.Col>
                  </Grid>
                </Grid.Col>
              </Grid>

              <Divider my="sm" />

              {/* Item Table Area */}
              <Box>
                 {/* Table Toolbar */}
                 <Group justify="space-between" mb="xs" bg="#f8fafc" p="xs" style={{ borderRadius: '4px' }}>
                    <Group gap="xs">
                       <Select 
                         size="xs" 
                         data={['Tax Exclusive', 'Tax Inclusive']} 
                         {...form.getInputProps('taxPreference')}
                         variant="unstyled"
                         w={120}
                         styles={{ input: { fontWeight: 500 } }}
                       />
                       <Divider orientation="vertical" />
                       <Group gap={4}>
                          <ActionIcon size="sm" variant="transparent" c="gray.6"><Settings size={14} /></ActionIcon>
                          <Text size="xs" fw={500} c="gray.7">At Transaction Level</Text>
                       </Group>
                    </Group>
                 </Group>

                 <Paper withBorder>
                    <Table>
                       <Table.Thead bg="#f8f9fa">
                          <Table.Tr>
                             <Table.Th style={{ width: 400 }}>ITEM DETAILS</Table.Th>
                             <Table.Th>ACCOUNT</Table.Th>
                             <Table.Th style={{ width: 100 }}>QUANTITY</Table.Th>
                             <Table.Th style={{ width: 120 }}>RATE</Table.Th>
                             <Table.Th style={{ width: 120 }}>TAX</Table.Th>
                             <Table.Th ta="right" style={{ width: 120 }}>AMOUNT</Table.Th>
                             <Table.Th style={{ width: 40 }} />
                          </Table.Tr>
                       </Table.Thead>
                       <Table.Tbody>
                          {items.map((item, index) => (
                             <Table.Tr key={index}>
                                <Table.Td>
                                   <Group wrap="nowrap" gap="xs">
                                      <ActionIcon variant="light" color="gray" size="lg"><ImageIcon size={16} /></ActionIcon>
                                      <Select 
                                        placeholder="Type or click to select an item."
                                        data={products.map(p => ({ value: p.id.toString(), label: p.name }))}
                                        searchable
                                        variant="unstyled"
                                        w="100%"
                                        value={item.productId}
                                        onChange={(val) => {
                                           const product = products.find(p => p.id.toString() === val);
                                           const newItems = [...items];
                                           newItems[index] = { ...item, productId: val, rate: product?.purchasePrice || product?.price || 0 };
                                           setItems(newItems);
                                        }}
                                      />
                                   </Group>
                                </Table.Td>
                                <Table.Td>
                                   <Select 
                                     placeholder="Select an account" 
                                     data={['Cost of Goods Sold', 'Inventory Asset', 'Office Supplies']}
                                     variant="unstyled"
                                     value={item.account}
                                     onChange={(val) => {
                                        const newItems = [...items];
                                        newItems[index].account = val;
                                        setItems(newItems);
                                     }}
                                   />
                                </Table.Td>
                                <Table.Td>
                                   <NumberInput 
                                     value={item.quantity} 
                                     onChange={(val) => {
                                        const newItems = [...items];
                                        newItems[index].quantity = Number(val);
                                        setItems(newItems);
                                     }}
                                     min={1}
                                     variant="unstyled"
                                   />
                                </Table.Td>
                                <Table.Td>
                                   <NumberInput 
                                     value={item.rate} 
                                     onChange={(val) => {
                                        const newItems = [...items];
                                        newItems[index].rate = Number(val);
                                        setItems(newItems);
                                     }}
                                     min={0}
                                     variant="unstyled"
                                     decimalScale={2}
                                   />
                                </Table.Td>
                                <Table.Td>
                                   <Select 
                                     placeholder="Select a Tax" 
                                     data={[
                                        { value: '0', label: 'GST0 (0%)' },
                                        { value: '5', label: 'GST5 (5%)' },
                                        { value: '12', label: 'GST12 (12%)' },
                                        { value: '18', label: 'GST18 (18%)' }
                                     ]}
                                     value={item.tax}
                                     onChange={(val) => {
                                        const newItems = [...items];
                                        newItems[index].tax = val;
                                        setItems(newItems);
                                     }}
                                     variant="unstyled"
                                   />
                                </Table.Td>
                                <Table.Td ta="right">
                                   <Text size="sm" fw={500}>{(item.quantity * item.rate).toFixed(2)}</Text>
                                </Table.Td>
                                <Table.Td>
                                   <ActionIcon color="red" variant="subtle" onClick={() => {
                                      if (items.length > 1) {
                                         setItems(items.filter((_, i) => i !== index));
                                      }
                                   }}>
                                      <Trash2 size={16} />
                                   </ActionIcon>
                                </Table.Td>
                             </Table.Tr>
                          ))}
                       </Table.Tbody>
                    </Table>
                 </Paper>
                 
                 <Group mt="md" gap="sm">
                    <Button variant="default" size="xs" leftSection={<Plus size={14} />} onClick={() => setItems([...items, { productId: '', account: '', quantity: 1, rate: 0, tax: '0', amount: 0 }])}>
                       Add New Row
                    </Button>
                    <Button variant="default" size="xs" leftSection={<Plus size={14} />}>Add Items in Bulk</Button>
                 </Group>
              </Box>

              {/* Totals & Notes Section */}
              <Grid>
                 <Grid.Col span={6}>
                    <Stack gap="xl">
                       <Box>
                          <Text size="sm" fw={500} mb={4}>Notes</Text>
                          <Textarea 
                            placeholder="Will be displayed on purchase order" 
                            minRows={3} 
                            {...form.getInputProps('notes')}
                          />
                       </Box>
                       <Box>
                          <Text size="sm" fw={500} mb={4}>Terms & Conditions</Text>
                          <Textarea 
                            placeholder="Enter the terms and conditions of your business to be displayed in your transaction" 
                            minRows={3}
                            {...form.getInputProps('termsConditions')}
                          />
                       </Box>
                    </Stack>
                 </Grid.Col>

                 <Grid.Col span={5} offset={1}>
                    <Paper withBorder p="md" bg="#f8fafc" radius="md">
                       <Stack gap="md">
                          <Group justify="space-between">
                             <Text size="sm">Sub Total</Text>
                             <Text size="sm" fw={500}>{subtotal.toFixed(2)}</Text>
                          </Group>
                          
                          <Group justify="space-between" align="center">
                             <Text size="sm">Discount</Text>
                             <Group gap={0}>
                                <NumberInput w={100} size="xs" {...form.getInputProps('discount')} styles={{ input: { borderRadius: '4px 0 0 4px' } }} />
                                <Select data={['%', '₹']} w={60} size="xs" {...form.getInputProps('discountType')} styles={{ input: { borderRadius: '0 4px 4px 0', borderLeft: 0 } }} />
                             </Group>
                             <Text size="sm" fw={500}>{discountAmount.toFixed(2)}</Text>
                          </Group>

                          {totalTax > 0 && (
                            <Group justify="space-between">
                               <Text size="sm">Tax</Text>
                               <Text size="sm" fw={500}>{totalTax.toFixed(2)}</Text>
                            </Group>
                          )}

                          <Group justify="space-between" align="center">
                             <Text size="sm">Adjustment</Text>
                             <NumberInput w={100} size="xs" {...form.getInputProps('adjustment')} />
                             <Text size="sm" fw={500}>{Number(form.values.adjustment || 0).toFixed(2)}</Text>
                          </Group>
                          
                          <Divider />
                          
                          <Group justify="space-between">
                             <Title order={5}>Total (₹)</Title>
                             <Title order={5}>{total.toFixed(2)}</Title>
                          </Group>
                       </Stack>
                    </Paper>

                    <Box mt="xl">
                       <Text size="sm" fw={500} mb="xs">Attach File(s) to Purchase Order</Text>
                       <Box 
                         style={{ border: '1px dashed #ced4da', borderRadius: '4px', padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                         onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.onchange = (e: any) => {
                               const files = Array.from(e.target.files) as File[];
                               files.forEach(file => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                     form.setFieldValue('attachments', [
                                        ...form.values.attachments, 
                                        { name: file.name, base64: event.target?.result as string }
                                     ]);
                                  };
                                  reader.readAsDataURL(file);
                               });
                            };
                            input.click();
                         }}
                       >
                          {form.values.attachments.length > 0 ? (
                             <Text size="sm" fw={500}>{form.values.attachments.length} file(s) attached</Text>
                          ) : (
                             <>
                                <Group justify="center" gap="xs">
                                   <Upload size={16} />
                                   <Text size="sm" fw={500}>Upload File</Text>
                                </Group>
                                <Text size="xs" c="dimmed" mt={4}>You can upload a maximum of 10 files, 10MB each</Text>
                             </>
                          )}
                       </Box>
                    </Box>
                 </Grid.Col>
              </Grid>

            </Stack>
          </Paper>

          {/* Bottom Action Bar */}
          <Box mt="xl" py="md" style={{ borderTop: '1px solid #e2e8f0' }}>
             <Group justify="space-between" maw={1000} mx="auto">
                <Group gap="sm">
                   <Button variant="default" onClick={() => handleSave('draft')}>Save as Draft</Button>
                   <Button color="blue" onClick={() => handleSave('issued')}>Save and Send</Button>
                   <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
                </Group>
                <Group gap="xs">
                   <Text size="xs" c="dimmed">PDF Template: 'Standard Template'</Text>
                   <Text size="xs" c="blue" style={{ cursor: 'pointer' }}>Change</Text>
                </Group>
             </Group>
          </Box>
        </Box>
      </ScrollArea>
    </Box>
  );
}
