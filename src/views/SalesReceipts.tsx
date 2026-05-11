import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Button, 
  Stack, 
  ActionIcon, 
  Text, 
  Badge,
  Menu,
  Box,
} from '@mantine/core';
import { Plus, Trash, MoreHorizontal, Download, ArrowUpDown, ChevronRight, RefreshCw, Upload, Settings, FileText, CreditCard } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { SalesReceiptDetail } from './SalesReceiptDetail';

export function SalesReceipts({ onViewChange }: { onViewChange: (view: string, id?: number, clone?: boolean) => void }) {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const receipts = useLiveQuery(
    () => db.salesReceipts.reverse().toArray(),
    []
  );

  const handleDeleteReceipt = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sales receipt?')) {
      await db.salesReceipts.delete(id);
      notifications.show({ title: 'Deleted', message: 'Sales receipt removed', color: 'gray' });
      if (selectedReceipt?.id === id) setSelectedReceipt(null);
    }
  };

  return (
    <Box h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Title order={2}>All Sales Receipts</Title>
          <Group>
            <Button 
              leftSection={<Plus size={18} />} 
              onClick={() => onViewChange('new-sales-receipt')}
              color="blue"
            >
              New
            </Button>
            <Menu shadow="md" width={250}>
              <Menu.Target>
                <ActionIcon variant="default" size="lg"><MoreHorizontal size={18} /></ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<ArrowUpDown size={16} />} rightSection={<ChevronRight size={14} />}>
                  Sort by
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<Download size={16} />}>
                  Import Sales Receipts
                </Menu.Item>
                <Menu.Item leftSection={<Upload size={16} />} rightSection={<ChevronRight size={14} />}>
                  Export
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<Settings size={16} />}>
                  Preferences
                </Menu.Item>
                <Menu.Item leftSection={<RefreshCw size={16} />}>
                  Refresh List
                </Menu.Item>
                <Menu.Item leftSection={<Trash size={16} />} color="red" onClick={() => {
                   if (window.confirm('Delete all sales receipts?')) {
                     db.salesReceipts.clear();
                   }
                }}>
                  Delete All Sales Receipts
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflow: 'hidden' }} p="md" bg="#f8f9fa">
        {receipts && receipts.length > 0 ? (
          <Box style={{ display: 'flex', gap: 'md', h: '100%', overflow: 'hidden' }}>
            <Box style={{ flex: selectedReceipt ? 0.4 : 1, overflowY: 'auto' }}>
              <Paper withBorder radius="md" bg="white">
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead bg="#f8f9fa">
                    <Table.Tr>
                      <Table.Th>Receipt #</Table.Th>
                      {!selectedReceipt && <Table.Th>Customer</Table.Th>}
                      <Table.Th>Date</Table.Th>
                      <Table.Th ta="right">Total</Table.Th>
                      <Table.Th ta="right">Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {receipts?.map((sr) => (
                      <Table.Tr 
                        key={sr.id} 
                        onClick={() => setSelectedReceipt(sr)} 
                        style={{ cursor: 'pointer', backgroundColor: selectedReceipt?.id === sr.id ? '#f1f5f9' : 'transparent' }}
                      >
                        <Table.Td>
                          <Stack gap={2}>
                            <Text fw={500} c="blue" size="sm">{sr.receiptNumber}</Text>
                            <Text size="xs" c="dimmed">{sr.customerName}</Text>
                            <Badge color="green" variant="light" size="xs">PAID</Badge>
                          </Stack>
                        </Table.Td>
                        <Table.Td>{new Date(sr.date).toLocaleDateString()}</Table.Td>
                        <Table.Td ta="right" fw={700}>₹{(sr.total || 0).toLocaleString()}</Table.Td>
                        <Table.Td ta="right">
                          <ActionIcon color="red" variant="subtle" onClick={(e) => { e.stopPropagation(); handleDeleteReceipt(sr.id!); }}>
                            <Trash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Box>

            {selectedReceipt && (
              <Box style={{ flex: 0.6, border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                <SalesReceiptDetail 
                  receiptId={selectedReceipt.id} 
                  onClose={() => setSelectedReceipt(null)} 
                  onEdit={(id) => onViewChange('new-sales-receipt', id)}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Paper withBorder p={80} radius="md" style={{ textAlign: 'center' }} bg="white">
            <Stack align="center" gap="lg">
              <Title order={2} fw={500}>Send professional sales receipts instantly!</Title>
              <Text c="dimmed" maw={600} mx="auto">
                Create sales receipts and send them to your customers as proof of payment you've received towards their purchase.
              </Text>
              <Button size="lg" color="blue" onClick={() => onViewChange('new-sales-receipt')}>
                NEW SALES RECEIPT
              </Button>
              <Button variant="subtle" color="blue">Import Sales Receipts</Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
