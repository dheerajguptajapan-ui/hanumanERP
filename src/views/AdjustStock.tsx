import React from 'react';
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  Stack,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Radio,
  Divider,
  Paper,
  ActionIcon,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

interface AdjustStockProps {
  itemId: number;
  onClose: () => void;
}

export function AdjustStock({ itemId, onClose }: AdjustStockProps) {
  const item = useLiveQuery(() => db.products.get(itemId), [itemId]);

  const form = useForm({
    initialValues: {
      type: 'quantity',
      date: new Date().toISOString().split('T')[0],
      account: 'Cost of Goods Sold',
      referenceNumber: 'update',
      quantityAvailable: 0,
      newQuantityOnHand: 0,
      quantityAdjusted: 0,
      costPrice: 0,
      reason: '',
      description: '',
    },
    validate: {
      reason: (value) => (!value ? 'Please specify a reason for the adjustment' : null),
    }
  });

  React.useEffect(() => {
    if (item) {
      form.setValues({
        quantityAvailable: item.stock,
        newQuantityOnHand: item.stock,
        costPrice: item.costPrice || 0,
      } as any);
    }
  }, [item]);

  const handleSave = async (values: typeof form.values, status: 'draft' | 'adjusted' = 'adjusted') => {
    if (!item) return;

    try {
      const adjustmentData = {
        productId: itemId,
        productName: item.name,
        date: new Date(values.date),
        reason: values.reason,
        type: values.type as 'quantity' | 'value',
        adjustmentType: values.quantityAdjusted >= 0 ? 'add' : 'remove',
        quantityAdjusted: Math.abs(values.quantityAdjusted),
        newQuantityOnHand: values.newQuantityOnHand,
        costPrice: values.costPrice,
        account: values.account,
        referenceNumber: values.referenceNumber,
        description: values.description,
        status: status,
      };

      await db.adjustments.add(adjustmentData as any);

      if (status === 'adjusted') {
        await db.products.update(itemId, {
          stock: values.newQuantityOnHand
        });
      }

      notifications.show({
        title: 'Success',
        message: `Stock adjusted for ${item.name}`,
        color: 'green'
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to adjust stock',
        color: 'red'
      });
    }
  };

  if (!item) return null;

  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Title order={3} fw={500}>Adjust Stock - {item.name}</Title>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflowY: 'auto' }} p="xl">
        <form onSubmit={form.onSubmit((v) => handleSave(v))}>
          <Stack gap="xl" maw={800} mx="auto">
            {form.errors.reason && (
              <Alert icon={<AlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={() => form.clearFieldError('reason')}>
                {form.errors.reason}
              </Alert>
            )}

            <Radio.Group label="Adjustment Type" {...form.getInputProps('type')}>
              <Group mt="xs">
                <Radio value="quantity" label="Quantity Adjustment" />
                <Radio value="value" label="Value Adjustment" />
              </Group>
            </Radio.Group>

            <Group grow align="flex-start">
              <TextInput label="Date" type="date" required {...form.getInputProps('date')} />
              <Select 
                label="Account" 
                required 
                data={['Cost of Goods Sold', 'Inventory Asset', 'Stock Adjustment']} 
                {...form.getInputProps('account')} 
              />
              <TextInput label="Reference Number" {...form.getInputProps('referenceNumber')} />
            </Group>

            <Paper withBorder p="xl" radius="sm" bg="gray.0">
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={500}>Quantity Available</Text>
                  <Box style={{ width: 200 }}>
                    <NumberInput readOnly variant="unstyled" value={form.values.quantityAvailable} decimalScale={2} ta="right" />
                    <Text size="xs" c="dimmed" ta="right">{item.unit}</Text>
                  </Box>
                </Group>

                <Group justify="space-between" align="center">
                  <Text size="sm" fw={500}>New Quantity on hand</Text>
                  <Box style={{ width: 200 }}>
                    <NumberInput 
                      value={form.values.newQuantityOnHand} 
                      onChange={(val) => {
                        const newVal = Number(val);
                        form.setValues({
                          newQuantityOnHand: newVal,
                          quantityAdjusted: newVal - form.values.quantityAvailable
                        });
                      }}
                      decimalScale={2}
                    />
                  </Box>
                </Group>

                <Group justify="space-between" align="center">
                  <Text size="sm" fw={500} c="red">Quantity Adjusted*</Text>
                  <Box style={{ width: 200 }}>
                    <NumberInput 
                      value={form.values.quantityAdjusted} 
                      onChange={(val) => {
                        const newVal = Number(val);
                        form.setValues({
                          quantityAdjusted: newVal,
                          newQuantityOnHand: form.values.quantityAvailable + newVal
                        });
                      }}
                      decimalScale={2}
                    />
                  </Box>
                </Group>

                <Group justify="space-between" align="center">
                  <Text size="sm" fw={500}>Cost Price</Text>
                  <Box style={{ width: 200 }}>
                    <NumberInput 
                      prefix="₹" 
                      value={form.values.costPrice} 
                      onChange={(val) => form.setFieldValue('costPrice', Number(val))} 
                    />
                    <Text size="xs" c="dimmed" ta="right">Recent Price:</Text>
                  </Box>
                </Group>
              </Stack>
            </Paper>

            <Select 
              label="Reason" 
              placeholder="Select a reason" 
              required
              data={[
                'Stock on fire',
                'Stolen goods',
                'Damaged goods',
                'Stock written off',
                'Inventory Revaluation',
                'Correction',
              ]}
              {...form.getInputProps('reason')}
            />

            <Textarea 
              label="Description" 
              placeholder="Max 500 characters" 
              rows={4}
              {...form.getInputProps('description')}
            />

            <Group justify="flex-start" mt="xl">
              <Button color="blue" onClick={() => handleSave(form.values, 'draft')} variant="light">Save as Draft</Button>
              <Button type="submit" color="blue">Convert to Adjusted</Button>
              <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
