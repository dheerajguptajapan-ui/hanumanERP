import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Button, 
  TextInput, 
  NumberInput,
  Stack,
  ActionIcon,
  Text,
  Box,
  Divider,
  Select,
  Textarea,
  rem,
  Tooltip,
  FileButton,
  ScrollArea
} from '@mantine/core';
import { 
  X, 
  Plus, 
  Trash2, 
  Settings, 
  Search,
  Upload,
  Info
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

interface NewVendorCreditProps {
  editingId?: number;
  onClose: () => void;
}

export function NewVendorCredit({ editingId, onClose }: NewVendorCreditProps) {
  const partners = useLiveQuery(() => db.partners.toArray());
  const vendors = partners?.filter(p => p.type === 'supplier' || p.type === 'both') || [];
  const products = useLiveQuery(() => db.products.toArray());

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [creditNoteNumber, setCreditNoteNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0, account: 'Cost of Goods Sold' }]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);

  useEffect(() => {
    if (editingId) {
      const loadCredit = async () => {
        const credit = await db.vendorCredits.get(editingId);
        if (credit) {
          setVendorId(credit.vendorId.toString());
          setCreditNoteNumber(credit.creditNoteNumber);
          setOrderNumber(credit.orderNumber || '');
          setDate(credit.date);
          setSubject(credit.subject || '');
          setItems(credit.items);
          setNotes(credit.notes || '');
          setDiscount(credit.discount || 0);
          setAdjustment(credit.adjustment || 0);
        }
      };
      loadCredit();
    } else {
      const generateNumber = async () => {
        const { generateDocNumber } = await import('../utils/numberSeries');
        setCreditNoteNumber(await generateDocNumber('vendorCredit'));
      };
      generateNumber();
    }
  }, [editingId]);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0, account: 'Cost of Goods Sold' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    if (field === 'productId') {
      const product = products?.find(p => p.id === Number(value));
      if (product) {
        newItems[index].price = product.costPrice || 0;
      }
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const total = subtotal - (subtotal * discount / 100) + adjustment;

  const handleSave = async (status: 'draft' | 'open') => {
    if (!vendorId) {
      notifications.show({ title: 'Error', message: 'Please select a vendor', color: 'red' });
      return;
    }

    const vendor = vendors?.find(v => v.id === Number(vendorId));
    const creditData = {
      vendorId: Number(vendorId),
      vendorName: vendor?.name || '',
      creditNoteNumber,
      orderNumber,
      date,
      subject,
      items,
      notes,
      discount,
      adjustment,
      subtotal,
      total,
      balance: total,
      status,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await db.vendorCredits.update(editingId, creditData);
      } else {
        await db.vendorCredits.add(creditData);
      }
      notifications.show({ title: 'Success', message: `Vendor Credit ${status === 'draft' ? 'saved as draft' : 'recorded'}`, color: 'green' });
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: 'Failed to save vendor credit', color: 'red' });
    }
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="xs">
             <Box p={5} bg="gray.1" style={{ borderRadius: '4px' }}>
                <Settings size={20} color="gray" />
             </Box>
             <Title order={4} fw={600}>{editingId ? 'Edit Vendor Credit' : 'New Vendor Credit'}</Title>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
        </Group>
      </Box>

      {/* Form Content */}
      <ScrollArea style={{ flex: 1 }} p="xl">
        <Stack gap="xl" maw={1000} mx="auto">
          {/* Main Info */}
          <Paper withBorder p="xl" radius="md">
            <Stack gap="lg">
              <Group grow align="flex-start">
                <Select
                  label={<Text size="xs" fw={700} c="red.7">Vendor Name*</Text>}
                  placeholder="Select a Vendor"
                  data={vendors?.map(v => ({ value: v.id!.toString(), label: v.name })) || []}
                  value={vendorId}
                  onChange={setVendorId}
                  searchable
                  rightSection={<ActionIcon variant="filled" size="sm" color="blue"><Search size={14} /></ActionIcon>}
                />
                <Box />
              </Group>

              <Group grow align="flex-start">
                <TextInput
                  label={<Text size="xs" fw={700} c="red.7">Credit Note#*</Text>}
                  value={creditNoteNumber}
                  onChange={(e) => setCreditNoteNumber(e.target.value)}
                  rightSection={<ActionIcon variant="subtle" size="xs" color="blue"><Settings size={14} /></ActionIcon>}
                />
                <TextInput
                  label={<Text size="xs" fw={700} c="gray.6">Order Number</Text>}
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </Group>

              <Group grow align="flex-start">
                <TextInput
                  label={<Text size="xs" fw={700} c="gray.6">Vendor Credit Date</Text>}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Box />
              </Group>

              <TextInput
                label={
                  <Group gap={4}>
                    <Text size="xs" fw={700} c="gray.6">Subject</Text>
                    <Tooltip label="Enter a subject within 250 characters"><Info size={14} color="gray" /></Tooltip>
                  </Group>
                }
                placeholder="Enter a subject within 250 characters"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Stack>
          </Paper>

          {/* Item Table */}
          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Box p="xs" bg="#f8f9fa" style={{ borderBottom: '1px solid #e2e8f0' }}>
               <Group justify="space-between">
                  <Text size="xs" fw={700} c="gray.7" tt="uppercase">Item Table</Text>
                  <Button variant="subtle" size="xs" leftSection={<Settings size={14} />}>Bulk Actions</Button>
               </Group>
            </Box>
            <Table verticalSpacing="sm">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '40%' }}>ITEM DETAILS</Table.Th>
                  <Table.Th>ACCOUNT</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>QUANTITY</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>RATE</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>TAX</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>AMOUNT</Table.Th>
                  <Table.Th style={{ width: 50 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Select
                        placeholder="Type or click to select an item."
                        data={products?.map(p => ({ value: p.id!.toString(), label: p.name })) || []}
                        value={item.productId}
                        onChange={(val) => updateItem(index, 'productId', val)}
                        searchable
                        size="xs"
                        variant="unstyled"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        data={['Cost of Goods Sold', 'Inventory Asset', 'Purchase Discount']}
                        value={item.account}
                        onChange={(val) => updateItem(index, 'account', val)}
                        size="xs"
                        variant="unstyled"
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.quantity}
                        onChange={(val) => updateItem(index, 'quantity', Number(val))}
                        size="xs"
                        variant="unstyled"
                        ta="right"
                        min={1}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.price}
                        onChange={(val) => updateItem(index, 'price', Number(val))}
                        size="xs"
                        variant="unstyled"
                        ta="right"
                        prefix="₹"
                      />
                    </Table.Td>
                    <Table.Td ta="right"><Text size="xs">Select a Tax</Text></Table.Td>
                    <Table.Td ta="right"><Text size="sm" fw={500}>{(item.quantity * item.price).toFixed(2)}</Text></Table.Td>
                    <Table.Td>
                      <ActionIcon variant="subtle" color="red" onClick={() => removeItem(index)} disabled={items.length === 1}>
                        <Trash2 size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Box p="md" style={{ borderTop: '1px solid #e2e8f0' }}>
               <Group gap="md">
                  <Button variant="filled" size="xs" color="blue" radius="sm" leftSection={<Plus size={14} />} onClick={addItem}>Add New Row</Button>
                  <Button variant="outline" size="xs" color="blue" radius="sm" leftSection={<Plus size={14} />}>Add Items in Bulk</Button>
               </Group>
            </Box>
          </Paper>

          {/* Footer Totals */}
          <Group align="flex-start" justify="space-between" mb={100}>
            <Stack gap="xl" style={{ flex: 1 }}>
               <Stack gap="xs">
                  <Text size="xs" fw={700} c="gray.6">Notes</Text>
                  <Textarea 
                    placeholder="Enter notes..." 
                    rows={4} 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
               </Stack>
               <Stack gap="xs">
                  <Text size="xs" fw={700} c="gray.6">Attach File(s) to Vendor Credits</Text>
                  <Box p="xl" style={{ border: '1px dashed #ced4da', borderRadius: '4px', textAlign: 'center' }}>
                     <FileButton onChange={() => {}} multiple>
                        {(props) => (
                           <Button {...props} variant="subtle" leftSection={<Upload size={16} />}>Upload File</Button>
                        )}
                     </FileButton>
                     <Text size="xs" c="dimmed" mt="xs">You can upload a maximum of 5 files, 10MB each</Text>
                  </Box>
               </Stack>
            </Stack>

            <Paper withBorder p="xl" radius="md" bg="gray.0" w={450}>
               <Stack gap="md">
                  <Group justify="space-between">
                     <Text size="sm">Sub Total</Text>
                     <Text size="sm">{subtotal.toFixed(2)}</Text>
                  </Group>
                  <Group justify="space-between">
                     <Group gap="xs">
                        <Text size="sm">Discount</Text>
                        <NumberInput w={80} size="xs" value={discount} onChange={(val) => setDiscount(Number(val))} suffix="%" />
                     </Group>
                     <Text size="sm">{(subtotal * discount / 100).toFixed(2)}</Text>
                  </Group>
                  <Group justify="space-between">
                     <Group gap="xs">
                        <TextInput placeholder="Adjustment" size="xs" w={120} />
                        <NumberInput w={100} size="xs" value={adjustment} onChange={(val) => setAdjustment(Number(val))} />
                        <Tooltip label="Adjust the final amount"><Info size={14} color="gray" /></Tooltip>
                     </Group>
                     <Text size="sm">{adjustment.toFixed(2)}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                     <Text fw={700} size="lg">Total ( ₹ )</Text>
                     <Text fw={700} size="lg">{total.toFixed(2)}</Text>
                  </Group>
               </Stack>
            </Paper>
          </Group>
        </Stack>
      </ScrollArea>

      {/* Action Bar */}
      <Box p="md" bg="gray.0" style={{ borderTop: '1px solid #e2e8f0' }}>
         <Group gap="sm">
            <Button color="blue" size="sm" onClick={() => handleSave('draft')} variant="outline">Save as Draft</Button>
            <Button color="blue" size="sm" onClick={() => handleSave('open')}>Save as Open</Button>
            <Button variant="default" size="sm" onClick={onClose}>Cancel</Button>
         </Group>
      </Box>
    </Box>
  );
}
