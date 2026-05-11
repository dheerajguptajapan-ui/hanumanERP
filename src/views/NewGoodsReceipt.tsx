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
  ActionIcon,
  rem,
  Grid,
  NumberInput,
  ScrollArea,
  Divider,
  Alert,
  Textarea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';

interface NewGoodsReceiptProps {
  onClose: () => void;
  purchaseOrderId?: number;
}

export function NewGoodsReceipt({ onClose, purchaseOrderId }: NewGoodsReceiptProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const form = useForm({
    initialValues: {
      grnNumber: '',
      purchaseOrderId: '',
      date: new Date(),
      reference: '',
      items: [] as { productId: number, productName: string, orderedQuantity: number, receivedQuantity: number, price: number }[],
      notes: '',
    },
    validate: {
      purchaseOrderId: (val) => (!val ? 'PO is required' : null),
      grnNumber: (val) => (!val ? 'GRN Number is required' : null),
    }
  });

  useEffect(() => {
    const loadData = async () => {
      // Get only Issued or Partially Received POs
      const pos = await db.purchaseOrders.filter(po => po.status === 'issued' || po.status === 'received').toArray();
      setPurchaseOrders(pos);

      const { generateDocNumber } = await import('../utils/numberSeries');
      form.setFieldValue('grnNumber', await generateDocNumber('grn'));

      if (purchaseOrderId) {
        handlePOChange(purchaseOrderId.toString());
      }
    };
    loadData();
  }, [purchaseOrderId]);

  const handlePOChange = async (val: string) => {
    const po = await db.purchaseOrders.get(Number(val));
    if (po) {
      // Get all previous receipts for this PO to calculate remaining quantity
      const existingGRNs = await db.goodsReceipts.where('purchaseOrderId').equals(po.id!).toArray();
      const receivedTotals: Record<number, number> = {};
      
      existingGRNs.forEach(grn => {
        grn.items.forEach(item => {
          receivedTotals[item.productId] = (receivedTotals[item.productId] || 0) + item.receivedQuantity;
        });
      });

      setSelectedPO(po);
      form.setFieldValue('purchaseOrderId', val);
      form.setFieldValue('items', po.items.map((i: any) => {
        const alreadyReceived = receivedTotals[i.productId] || 0;
        const remaining = Math.max(0, i.quantity - alreadyReceived);
        return {
          productId: i.productId,
          productName: i.productName,
          orderedQuantity: i.quantity,
          alreadyReceived,
          receivedQuantity: remaining, // Default to remaining
          price: i.price
        };
      }));
    }
  };

  const handleSave = async () => {
    if (form.validate().hasErrors) return;

    try {
      const data = {
        grnNumber: form.values.grnNumber,
        purchaseOrderId: Number(form.values.purchaseOrderId),
        vendorId: selectedPO.vendorId,
        vendorName: selectedPO.vendorName,
        date: form.values.date,
        reference: form.values.reference,
        items: form.values.items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          orderedQuantity: i.orderedQuantity,
          receivedQuantity: i.receivedQuantity,
          price: i.price
        })),
        notes: form.values.notes,
      };

      // 1. Add Goods Receipt
      await db.goodsReceipts.add(data);

      // 2. Update Inventory Stock (Physical Mode)
      const settings = await db.settings.toCollection().first();
      const isPhysicalMode = settings?.stockTrackingMode === 'physical';

      if (isPhysicalMode) {
        for (const item of form.values.items) {
          if (item.receivedQuantity === 0) continue;
          const product = await db.products.get(item.productId);
          if (product) {
            await db.products.update(item.productId, {
              stock: (product.stock || 0) + item.receivedQuantity
            });
          }
        }
      }

      // 3. Update PO Status based on cumulative receipts
      const po = await db.purchaseOrders.get(Number(form.values.purchaseOrderId));
      if (po) {
        const allGRNs = await db.goodsReceipts.where('purchaseOrderId').equals(po.id!).toArray();
        const totals: Record<number, number> = {};
        allGRNs.forEach(g => {
          g.items.forEach(it => {
            totals[it.productId] = (totals[it.productId] || 0) + it.receivedQuantity;
          });
        });

        let allFullyReceived = true;
        let anyReceived = false;
        
        po.items.forEach((poItem: any) => {
          const totalRec = totals[poItem.productId] || 0;
          if (totalRec < poItem.quantity) allFullyReceived = false;
          if (totalRec > 0) anyReceived = true;
        });

        const newStatus = allFullyReceived ? 'received' : (anyReceived ? 'partially_received' : 'issued');
        await db.purchaseOrders.update(po.id!, { status: newStatus });
      }

      notifications.show({ 
        title: 'Inventory Updated', 
        message: `Stock successfully updated. GRN #${form.values.grnNumber} recorded.`, 
        color: 'green',
        icon: <CheckCircle size={18} />
      });
      
      onClose();
    } catch (e) {
      console.error(e);
      notifications.show({ title: 'Error', message: 'Failed to record goods receipt', color: 'red' });
    }
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
        <Group justify="space-between">
          <Group gap="sm">
             <Package size={20} color="#228be6" />
             <Title order={3} fw={500}>Receive Goods (GRN)</Title>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
        </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
        <Box p="xl" bg="#f8f9fa">
          <Paper withBorder p="xl" radius="md" bg="white" maw={900} mx="auto">
            <Stack gap="lg">
              <Grid>
                <Grid.Col span={6}>
                  <Select 
                    label="Select Purchase Order"
                    placeholder="Choose PO to receive items"
                    data={purchaseOrders.map(po => ({ value: po.id.toString(), label: `${po.purchaseOrderNumber} - ${po.vendorName}` }))}
                    {...form.getInputProps('purchaseOrderId')}
                    onChange={(val) => handlePOChange(val || '')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput label="GRN Number" {...form.getInputProps('grnNumber')} readOnly />
                </Grid.Col>
                <Grid.Col span={6}>
                  <DateInput label="Receipt Date" {...form.getInputProps('date')} required />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput label="Reference# (e.g. DC/LR Number)" {...form.getInputProps('reference')} />
                </Grid.Col>
              </Grid>

              {selectedPO && (
                <Box mt="md">
                  <Divider label="Items to Receive" labelPosition="center" mb="md" />
                  <Table withColumnBorders withTableBorder>
                    <Table.Thead bg="gray.0">
                      <Table.Tr>
                        <Table.Th>Product Name</Table.Th>
                        <Table.Th ta="center" w={120}>Ordered</Table.Th>
                        <Table.Th ta="center" w={150}>Received Now</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {form.values.items.map((item, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>
                            <Stack gap={2}>
                              <Text size="sm" fw={500}>{item.productName}</Text>
                              {item.alreadyReceived > 0 && (
                                <Text size="xs" c="blue">Already received: {item.alreadyReceived}</Text>
                              )}
                            </Stack>
                          </Table.Td>
                          <Table.Td ta="center">
                            <Stack gap={2}>
                               <Text size="sm" fw={600}>{item.orderedQuantity}</Text>
                               <Text size="xs" c="dimmed">Remaining: {item.orderedQuantity - item.alreadyReceived}</Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <NumberInput 
                              hideControls
                              value={item.receivedQuantity}
                              onChange={(val) => form.setFieldValue(`items.${index}.receivedQuantity`, Number(val))}
                              error={item.receivedQuantity > (item.orderedQuantity - item.alreadyReceived)}
                              min={0}
                            />
                            {item.receivedQuantity > (item.orderedQuantity - item.alreadyReceived) && (
                              <Text size="xs" c="orange">Receiving more than balance</Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>

                  <Alert icon={<AlertCircle size={16} />} title="Inventory Impact" color="blue" mt="xl">
                    Saving this document will immediately increase your physical stock levels in the warehouse.
                  </Alert>
                </Box>
              )}

              <Textarea label="Notes" placeholder="Add any observation about the delivery condition..." {...form.getInputProps('notes')} />

              <Group justify="flex-end" mt="xl">
                <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
                <Button color="blue" size="md" onClick={handleSave} disabled={!selectedPO}>Record Receipt & Update Stock</Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      </ScrollArea>
    </Box>
  );
}
