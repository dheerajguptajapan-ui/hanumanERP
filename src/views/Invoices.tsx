import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Button, 
  TextInput, 
  Stack, 
  ActionIcon, 
  Text, 
  Badge,
  Menu,
  Box,
  Divider,
  SimpleGrid,
  ScrollArea,
  rem,
  Modal,
  NumberInput,
  Select
} from '@mantine/core';
import { Search, Printer, Eye, Download, FileText, CreditCard, Plus, Trash, Edit, MoreHorizontal, ArrowUpDown, Upload, Settings, RefreshCw, Trash2, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { InvoiceDetail } from './InvoiceDetail';
import { generateDocumentPDF } from '../utils/pdfGenerator';

export function Invoices({ onViewChange }: { onViewChange: (view: string, id?: number, clone?: boolean) => void }) {
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const invoices = useLiveQuery(
    () => db.invoices.reverse().toArray(),
    []
  );

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await db.invoices.delete(id);
      notifications.show({ title: 'Deleted', message: 'Invoice removed', color: 'gray' });
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;
    const newPaidAmount = (selectedInvoice.amountPaid || 0) + paymentAmount;
    const newStatus = newPaidAmount >= selectedInvoice.total ? 'paid' : 'partial';
    
    await db.invoices.update(selectedInvoice.id, {
      amountPaid: newPaidAmount,
      status: newStatus
    });

    notifications.show({
      title: 'Payment Recorded',
      message: `₹${paymentAmount.toLocaleString()} recorded for ${selectedInvoice.invoiceNumber}`,
      color: 'green'
    });
    
    close();
    setPaymentAmount(0);
  };

  return (
    <Box h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Title order={2}>All Invoices</Title>
          <Group>
            <Button 
              leftSection={<Plus size={18} />} 
              onClick={() => onViewChange('new-invoice')}
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
                  Import Invoices
                </Menu.Item>
                <Menu.Item leftSection={<Upload size={16} />} rightSection={<ChevronRight size={14} />}>
                  Export
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<Settings size={16} />}>
                  Preferences
                </Menu.Item>
                <Menu.Item leftSection={<FileText size={16} />}>
                  Manage Custom Fields
                </Menu.Item>
                <Menu.Item leftSection={<CreditCard size={16} />}>
                  Online Payments
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<RefreshCw size={16} />}>
                  Refresh List
                </Menu.Item>
                <Menu.Item leftSection={<Trash2 size={16} />} color="red" onClick={() => {
                  if (window.confirm('Delete all invoices? This cannot be undone.')) {
                    db.invoices.clear();
                    notifications.show({ title: 'Success', message: 'All invoices deleted', color: 'red' });
                  }
                }}>
                  Delete All Invoices
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflow: 'hidden' }} p="md" bg="#f8f9fa">
        {invoices && invoices.length > 0 ? (
          <Box style={{ display: 'flex', gap: 'md', h: '100%', overflow: 'hidden' }}>
            {/* List Side */}
            <Box style={{ flex: selectedInvoice ? 0.4 : 1, overflowY: 'auto' }}>
              <Paper withBorder radius="md" bg="white">
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead bg="#f8f9fa">
                    <Table.Tr>
                      <Table.Th>Invoice #</Table.Th>
                      {!selectedInvoice && <Table.Th>Customer</Table.Th>}
                      <Table.Th>Date</Table.Th>
                      <Table.Th ta="right">Total</Table.Th>
                      {!selectedInvoice && <Table.Th>Status</Table.Th>}
                      <Table.Th ta="right">Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {invoices?.map((inv) => {
                      const isOverdue = new Date(inv.dueDate) < new Date() && inv.status !== 'paid';
                      const isSelected = selectedInvoice?.id === inv.id;
                      
                      return (
                        <Table.Tr 
                          key={inv.id} 
                          onClick={() => setSelectedInvoice(inv)} 
                          style={{ cursor: 'pointer', backgroundColor: isSelected ? '#f1f5f9' : 'transparent' }}
                        >
                          <Table.Td fw={500} c="blue">
                            {inv.invoiceNumber}
                          </Table.Td>
                          {!selectedInvoice && <Table.Td>{inv.customerName}</Table.Td>}
                          <Table.Td>
                            <Text size="sm">{new Date(inv.date).toLocaleDateString()}</Text>
                          </Table.Td>
                          <Table.Td ta="right" fw={700}>₹{(inv.total || 0).toLocaleString()}</Table.Td>
                          {!selectedInvoice && (
                            <Table.Td>
                              <Badge color={inv.status === 'paid' ? 'green' : isOverdue ? 'red' : 'orange'} variant="filled">
                                {isOverdue ? 'OVERDUE' : (inv.status || 'UNPAID').toUpperCase()}
                              </Badge>
                            </Table.Td>
                          )}
                          <Table.Td ta="right">
                            <ActionIcon 
                              variant="subtle" 
                              color="red" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInvoice(inv.id!);
                              }}
                            >
                              <Trash size={16} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Box>

            {/* Detail Side */}
            {selectedInvoice && (
              <Box style={{ flex: 0.6, border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                <InvoiceDetail 
                  invoiceId={selectedInvoice.id} 
                  onClose={() => setSelectedInvoice(null)} 
                  onEdit={(id) => onViewChange('new-invoice', id)}
                  onViewChange={onViewChange}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Paper withBorder p={80} radius="md" style={{ textAlign: 'center' }} bg="white">
            <Stack align="center" gap="lg">
              <Title order={2} fw={500}>It's time to get paid!</Title>
              <Text c="dimmed" maw={600} mx="auto">
                We don't want to boast too much, but sending amazing invoices and getting paid is easier than ever. Go ahead! Try it yourself.
              </Text>
              <Button size="lg" color="blue" onClick={() => onViewChange('new-invoice')}>
                NEW INVOICE
              </Button>
              <Button variant="subtle" color="blue">Import Invoices</Button>
              
              <Box mt={40}>
                <Text size="sm" fw={600} mb="sm">Life cycle of an Invoice</Text>
                <Group justify="center" gap="xl">
                   <Badge variant="dot">Draft</Badge>
                   <ChevronRight size={14} />
                   <Badge variant="dot" color="blue">Issued</Badge>
                   <ChevronRight size={14} />
                   <Badge variant="dot" color="orange">Partial</Badge>
                   <ChevronRight size={14} />
                   <Badge variant="dot" color="green">Paid</Badge>
                </Group>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Record Payment Modal */}
      <Modal opened={opened} onClose={close} title="Record Payment" centered>
        <Stack gap="md">
          <Text size="sm">Enter the amount received from <b>{selectedInvoice?.customerName}</b></Text>
          <NumberInput
            label="Amount Received"
            prefix="₹"
            value={paymentAmount}
            onChange={(val) => setPaymentAmount(Number(val))}
            min={0}
            max={selectedInvoice ? selectedInvoice.total - selectedInvoice.amountPaid : undefined}
          />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={close}>Cancel</Button>
            <Button color="green" onClick={handleRecordPayment}>Record Payment</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
