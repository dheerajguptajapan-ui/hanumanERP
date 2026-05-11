import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Button, 
  Group, 
  Text, 
  Stack, 
  TextInput, 
  Select, 
  Radio, 
  Textarea, 
  Box, 
  Table, 
  rem,
  Title,
  Paper,
  NumberInput,
} from '@mantine/core';
import { CheckCircle, Package } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import { useLiveQuery } from 'dexie-react-hooks';

interface NewAdjustmentProps {
  opened: boolean;
  onClose: () => void;
  adjustment?: any; // Data for editing
}

export function NewAdjustment({ opened, onClose, adjustment }: NewAdjustmentProps) {
  const products = useLiveQuery(() => db.products.toArray()) || [];
  
  const [mode, setMode] = useState<'quantity' | 'value'>('quantity');
  const [productId, setProductId] = useState<string>('');
  const [refNumber, setRefNumber] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [account, setAccount] = useState('Cost of Goods Sold');
  const [reason, setReason] = useState('Inventory Revaluation');
  const [description, setDescription] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [qtyAdjusted, setQtyAdjusted] = useState<number>(1);
  const [status, setStatus] = useState<'draft' | 'adjusted'>('draft');

  const selectedProduct = products.find(p => p.id === Number(productId));

  useEffect(() => {
    if (adjustment) {
      setMode(adjustment.type || 'quantity');
      setProductId(adjustment.productId.toString());
      setRefNumber(adjustment.referenceNumber || '');
      setDate(new Date(adjustment.date));
      setAccount(adjustment.account || 'Cost of Goods Sold');
      setReason(adjustment.reason || 'Inventory Revaluation');
      setDescription(adjustment.description || '');
      setAdjustmentType(adjustment.adjustmentType || 'add');
      setQtyAdjusted(adjustment.quantityAdjusted || 0);
      setStatus(adjustment.status || 'draft');
    } else {
      resetForm();
    }
  }, [adjustment, opened]);

  const resetForm = () => {
    setProductId('');
    setRefNumber('');
    setDate(new Date());
    setQtyAdjusted(1);
    setDescription('');
    setStatus('draft');
  };

  const handleSave = async (finalStatus: 'draft' | 'adjusted') => {
    if (!productId) {
      notifications.show({ title: 'Required', message: 'Please select a product', color: 'red' });
      return;
    }

    try {
      const data = {
        productId: Number(productId),
        productName: selectedProduct?.name || '',
        date: date,
        reason,
        type: mode,
        adjustmentType,
        quantityAdjusted: qtyAdjusted,
        newQuantityOnHand: (selectedProduct?.stock || 0) + (adjustmentType === 'add' ? qtyAdjusted : -qtyAdjusted),
        costPrice: selectedProduct?.price || 0,
        account,
        referenceNumber: refNumber,
        description,
        status: finalStatus,
      };

      if (adjustment?.id) {
        await db.adjustments.update(adjustment.id, data);
      } else {
        await db.adjustments.add(data);
      }

      // If finalizing, update stock
      if (finalStatus === 'adjusted') {
        const product = await db.products.get(Number(productId));
        if (product) {
          const stockChange = adjustmentType === 'add' ? qtyAdjusted : -qtyAdjusted;
          await db.products.update(product.id!, {
            stock: (product.stock || 0) + stockChange
          });
        }
      }

      notifications.show({ 
        title: 'Success', 
        message: `Adjustment ${finalStatus === 'adjusted' ? 'finalized' : 'saved as draft'}.`, 
        color: 'green' 
      });
      onClose();
    } catch (e) {
      console.error(e);
      notifications.show({ title: 'Error', message: 'Failed to save adjustment', color: 'red' });
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      size="100%" 
      fullScreen
      title={<Title order={4} fw={600}>{adjustment ? 'Edit Adjustment' : 'New Adjustment'}</Title>}
      padding={0}
      styles={{
        header: { borderBottom: '1px solid #e2e8f0', padding: '15px 20px' },
        body: { height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box style={{ flex: 1, overflowY: 'auto', backgroundColor: 'white' }} p="xl">
        <Stack gap={40} maw={1000} mx="auto">
          <Stack gap="lg">
            <Group align="flex-start">
              <Text size="sm" w={200} pt={4}>Mode of adjustment</Text>
              <Radio.Group value={mode} onChange={(val) => setMode(val as any)}>
                <Group gap="xl">
                  <Radio value="quantity" label="Quantity Adjustment" size="sm" />
                  <Radio value="value" label="Value Adjustment" size="sm" disabled />
                </Group>
              </Radio.Group>
            </Group>

            <Group align="center">
              <Text size="sm" w={200}>Product*</Text>
              <Select 
                placeholder="Select item"
                data={products.map(p => ({ value: p.id!.toString(), label: p.name }))}
                value={productId}
                onChange={(val) => setProductId(val || '')}
                searchable
                style={{ flex: 1, maxWidth: 400 }}
              />
            </Group>

            <Group align="center">
              <Text size="sm" w={200}>Adjustment Type</Text>
              <Radio.Group value={adjustmentType} onChange={(val) => setAdjustmentType(val as any)}>
                <Group gap="xl">
                  <Radio value="add" label="Add Stock (+)" color="green" />
                  <Radio value="remove" label="Remove Stock (-)" color="red" />
                </Group>
              </Radio.Group>
            </Group>

            <Group align="center">
              <Text size="sm" w={200}>Quantity to Adjust*</Text>
              <NumberInput 
                value={qtyAdjusted}
                onChange={(val) => setQtyAdjusted(Number(val))}
                min={1}
                style={{ flex: 1, maxWidth: 400 }}
              />
            </Group>

            <Group align="center">
              <Text size="sm" w={200}>Reason</Text>
              <Select 
                data={['Inventory Revaluation', 'Stock on fire', 'Stolen goods', 'Damaged goods', 'Stocktaking results']}
                value={reason}
                onChange={(val) => setReason(val || '')}
                style={{ flex: 1, maxWidth: 400 }}
              />
            </Group>

            <Group align="center">
              <Text size="sm" w={200}>Date</Text>
              <DateInput 
                value={date}
                onChange={(val) => setDate(val || new Date())}
                style={{ flex: 1, maxWidth: 400 }}
              />
            </Group>

            <Group align="center">
              <Text size="sm" w={200}>Reference Number</Text>
              <TextInput 
                value={refNumber} 
                onChange={(e) => setRefNumber(e.currentTarget.value)} 
                placeholder="e.g. ADJ-001"
                style={{ flex: 1, maxWidth: 400 }} 
              />
            </Group>

            <Group align="flex-start">
              <Text size="sm" w={200} pt={8}>Description</Text>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                placeholder="Add internal notes about this adjustment..."
                style={{ flex: 1, maxWidth: 400 }}
                minRows={3}
              />
            </Group>
          </Stack>

          {selectedProduct && (
            <Paper withBorder p="md" bg="gray.0">
               <Group gap="xl">
                  <Group gap="xs">
                    <Package size={20} color="gray" />
                    <Box>
                      <Text size="xs" c="dimmed">Current Stock</Text>
                      <Text fw={700}>{selectedProduct.stock} units</Text>
                    </Box>
                  </Group>
                  <Box>
                    <Text size="xs" c="dimmed">New Stock Level</Text>
                    <Text fw={700} color={adjustmentType === 'add' ? 'green' : 'red'}>
                      {(selectedProduct.stock || 0) + (adjustmentType === 'add' ? qtyAdjusted : -qtyAdjusted)} units
                    </Text>
                  </Box>
               </Group>
            </Paper>
          )}
        </Stack>
      </Box>

      <Box p="md" bg="white" style={{ borderTop: '1px solid #e2e8f0' }}>
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" color="gray" onClick={onClose}>Cancel</Button>
          <Button variant="light" color="blue" onClick={() => handleSave('draft')}>Save as Draft</Button>
          <Button color="blue" onClick={() => handleSave('adjusted')}>Adjust Stock Now</Button>
        </Group>
      </Box>
    </Modal>
  );
}
