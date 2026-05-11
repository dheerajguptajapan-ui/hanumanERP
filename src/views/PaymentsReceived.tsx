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
  Select,
  Checkbox,
  Stack,
  Divider,
  ScrollArea
} from '@mantine/core';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Download, 
  History,
  Printer,
  FileText,
  Edit,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  RefreshCcw,
  Settings
} from 'lucide-react';
import { NewPayment } from './NewPayment';

export function PaymentsReceived() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const payments = [
    {
      id: 1,
      date: '2026/05/08',
      paymentNumber: '1',
      referenceNumber: '',
      customerName: 'gupta industeria',
      invoiceNumber: 'INV-000001',
      mode: 'Bank Transfer',
      amount: '¥12,000',
      unusedAmount: '¥0'
    }
  ];

  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Group gap={4}>
               <Title order={4} fw={600}>All Received Payments</Title>
               <ActionIcon variant="subtle" color="gray" size="sm"><ChevronDown size={14} /></ActionIcon>
            </Group>
          </Group>
          <Group gap="xs">
            <Button size="xs" leftSection={<Plus size={14} />} color="blue" onClick={() => setShowNewModal(true)}>+ New</Button>
            <ActionIcon variant="outline" color="gray" size="sm"><MoreVertical size={14} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Toolbar */}
      <Box p="xs" bg="gray.0" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between">
            <Group gap="xs">
               <ActionIcon variant="subtle" color="gray"><RefreshCcw size={16} /></ActionIcon>
               <Divider orientation="vertical" />
               <Group gap={0}>
                  <ActionIcon variant="subtle" color="gray"><List size={16} /></ActionIcon>
                  <ActionIcon variant="subtle" color="gray"><LayoutGrid size={16} /></ActionIcon>
               </Group>
            </Group>
            <Group gap="xs">
               <TextInput 
                  placeholder="Search in Payments Received (/)" 
                  size="xs" 
                  w={250} 
                  leftSection={<Search size={14} />} 
               />
               <ActionIcon variant="outline" color="gray" size="sm"><Settings size={14} /></ActionIcon>
            </Group>
         </Group>
      </Box>

      {/* Table */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th w={40}><Checkbox size="xs" /></Table.Th>
              <Table.Th><Group gap={4}><Text size="xs" fw={700}>DATE</Text><RefreshCcw size={10} /></Group></Table.Th>
              <Table.Th><Text size="xs" fw={700}>PAYMENT #</Text></Table.Th>
              <Table.Th><Text size="xs" fw={700}>REFERENCE NUMBER</Text></Table.Th>
              <Table.Th><Text size="xs" fw={700}>CUSTOMER NAME</Text></Table.Th>
              <Table.Th><Text size="xs" fw={700}>INVOICE#</Text></Table.Th>
              <Table.Th><Text size="xs" fw={700}>MODE</Text></Table.Th>
              <Table.Th ta="right"><Text size="xs" fw={700}>AMOUNT</Text></Table.Th>
              <Table.Th ta="right"><Text size="xs" fw={700}>UNUSED AMOUNT</Text></Table.Th>
              <Table.Th w={40}><Search size={12} /></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payments.map((p) => (
              <Table.Tr key={p.id} style={{ cursor: 'pointer' }}>
                <Table.Td><Checkbox size="xs" /></Table.Td>
                <Table.Td><Text size="xs">{p.date}</Text></Table.Td>
                <Table.Td><Text size="xs" c="blue">{p.paymentNumber}</Text></Table.Td>
                <Table.Td><Text size="xs">{p.referenceNumber || '-'}</Text></Table.Td>
                <Table.Td><Text size="xs" fw={500}>{p.customerName}</Text></Table.Td>
                <Table.Td><Text size="xs">{p.invoiceNumber}</Text></Table.Td>
                <Table.Td><Text size="xs">{p.mode}</Text></Table.Td>
                <Table.Td ta="right"><Text size="xs" fw={600}>{p.amount}</Text></Table.Td>
                <Table.Td ta="right"><Text size="xs">{p.unusedAmount}</Text></Table.Td>
                <Table.Td />
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      <NewPayment opened={showNewModal} onClose={() => setShowNewModal(false)} />
    </Box>
  );
}
