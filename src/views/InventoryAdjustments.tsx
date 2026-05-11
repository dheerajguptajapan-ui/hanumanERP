import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Button, 
  Table, 
  Text, 
  TextInput, 
  Menu, 
  ActionIcon, 
  Badge,
  rem,
  Box,
  Stack,
  Divider,
  ScrollArea,
  Center,
  Tooltip,
} from '@mantine/core';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  History,
  CheckCircle,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { NewAdjustment } from './NewAdjustment';
import { notifications } from '@mantine/notifications';

interface InventoryAdjustmentsProps {
  onViewChange: (view: string) => void;
}

export function InventoryAdjustments({ onViewChange }: InventoryAdjustmentsProps) {
  const [search, setSearch] = useState('');
  const [editingAdjustment, setEditingAdjustment] = useState<any>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const adjustments = useLiveQuery(
    () => db.adjustments
      .filter(a => 
        a.productName.toLowerCase().includes(search.toLowerCase()) || 
        a.referenceNumber.toLowerCase().includes(search.toLowerCase())
      )
      .reverse()
      .toArray(),
    [search]
  ) || [];

  const handleEdit = (adj: any) => {
    setEditingAdjustment(adj);
    setShowNewModal(true);
  };

  const handleNew = () => {
    setEditingAdjustment(null);
    setShowNewModal(true);
  };

  const handleConvertToAdjusted = async (adj: any) => {
    try {
      const product = await db.products.get(adj.productId);
      if (!product) throw new Error('Product not found');

      // Update stock
      const stockChange = adj.adjustmentType === 'add' ? adj.quantityAdjusted : -adj.quantityAdjusted;
      await db.products.update(adj.productId, {
        stock: (product.stock || 0) + stockChange
      });

      // Update adjustment status
      await db.adjustments.update(adj.id, { status: 'adjusted' });

      notifications.show({
        title: 'Adjustment Finalized',
        message: `Stock for ${adj.productName} has been updated.`,
        color: 'green'
      });
    } catch (e) {
      console.error(e);
      notifications.show({ title: 'Error', message: 'Failed to finalize adjustment', color: 'red' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this adjustment?')) {
      await db.adjustments.delete(id);
      notifications.show({ title: 'Deleted', message: 'Adjustment removed successfully', color: 'blue' });
    }
  };

  return (
    <Box h="100%" bg="#f8f9fa" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <History size={20} color="#228be6" />
            <Title order={3} fw={500}>Inventory Adjustments</Title>
          </Group>
          <Button leftSection={<Plus size={16} />} color="blue" radius="xs" onClick={handleNew}>
            New Adjustment
          </Button>
        </Group>
      </Box>

      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <TextInput 
          placeholder="Search by product or reference..." 
          leftSection={<Search size={16} color="gray" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maw={400}
        />
      </Box>

      <ScrollArea style={{ flex: 1 }} p="md">
        <Paper withBorder radius="md">
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Product</Table.Th>
                <Table.Th>Adjustment</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Reference</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {adjustments.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Center py="xl">
                      <Stack align="center" gap="xs">
                        <AlertCircle size={32} color="gray" />
                        <Text c="dimmed">No adjustments found</Text>
                      </Stack>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                adjustments.map((adj) => (
                  <Table.Tr key={adj.id}>
                    <Table.Td>{new Date(adj.date).toLocaleDateString()}</Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{adj.reason}</Text>
                        <Text size="xs" c="dimmed">{adj.type} Adjustment</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{adj.productName}</Table.Td>
                    <Table.Td>
                      <Badge color={adj.adjustmentType === 'add' ? 'green' : 'red'} variant="light">
                        {adj.adjustmentType === 'add' ? '+' : '-'}{adj.quantityAdjusted}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={adj.status === 'adjusted' ? 'green' : 'orange'}>
                        {adj.status.toUpperCase()}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{adj.referenceNumber || '-'}</Table.Td>
                    <Table.Td>
                      <Group justify="flex-end" gap="xs">
                        {adj.status === 'draft' && (
                          <Tooltip label="Finalize & Update Stock">
                            <ActionIcon variant="light" color="green" onClick={() => handleConvertToAdjusted(adj)}>
                              <CheckCircle size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Menu position="bottom-end" withinPortal shadow="md" width={160}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <MoreVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<FileText size={14} />} onClick={() => handleEdit(adj)}>
                              View/Edit
                            </Menu.Item>
                            <Menu.Item leftSection={<X size={14} />} color="red" onClick={() => handleDelete(adj.id!)}>
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      </ScrollArea>

      <NewAdjustment 
        opened={showNewModal} 
        onClose={() => setShowNewModal(false)} 
        adjustment={editingAdjustment}
      />
    </Box>
  );
}
