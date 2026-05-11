import React from 'react';
import { 
  Box, 
  Group, 
  Title, 
  Text, 
  ActionIcon, 
  Badge,
  Stack,
  Divider,
  Paper,
  Button,
  Menu,
  Grid,
  ScrollArea,
  rem,
  Anchor,
  Table,
} from '@mantine/core';
import { 
  X, 
  Edit, 
  Mail, 
  Printer, 
  Trash, 
  MoreHorizontal, 
  ChevronDown, 
  Paperclip,
  MessageSquare,
  Undo2,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

interface PaymentDetailProps {
  paymentId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
}

export function PaymentDetail({ paymentId, onClose, onEdit }: PaymentDetailProps) {
  const payment = useLiveQuery(() => db.payments.get(paymentId), [paymentId]);
  const invoice = useLiveQuery(async () => {
    if (!payment?.invoiceId) return undefined;
    return await db.invoices.get(payment.invoiceId);
  }, [payment]);
  const partner = useLiveQuery(async () => {
    if (!payment) return undefined;
    return await db.partners.get(payment.customerId);
  }, [payment]);
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  if (!payment) return null;

  const formatAddress = (p: any) => {
    if (!p) return 'No Address Provided';
    const lines = [
      p.billingAttention,
      p.billingLine1,
      p.billingLine2,
      p.billingCity,
      [p.billingState, p.billingPincode].filter(Boolean).join(' '),
      p.billingCountry
    ];
    return lines.filter(Boolean).join('\n');
  };

  return (
    <Box h="100%" style={{ display: 'flex', flexDirection: 'column' }} bg="white">
      {/* Header Toolbar */}
      <Box p="xs" px="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Title order={4} fw={600}>{payment.paymentNumber}</Title>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray"><Paperclip size={18} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray"><MessageSquare size={18} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Action Buttons */}
      <Box p="xs" px="md" style={{ borderBottom: '1px solid #e2e8f0' }} bg="#f8f9fa">
        <Group gap="xs">
          <Button variant="subtle" color="gray" size="xs" leftSection={<Edit size={14} />} onClick={() => onEdit(paymentId)}>Edit</Button>
          <Divider orientation="vertical" />
          <Button variant="subtle" color="gray" size="xs" leftSection={<Mail size={14} />}>Send Email</Button>
          <Divider orientation="vertical" />
          <Menu shadow="md" width={150}>
            <Menu.Target>
              <Button variant="subtle" color="gray" size="xs" leftSection={<Printer size={14} />} rightSection={<ChevronDown size={12} />}>PDF/Print</Button>
            </Menu.Target>
            <Menu.Dropdown>
               <Menu.Item>Print Receipt</Menu.Item>
               <Menu.Item>Download PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Divider orientation="vertical" />
          <Button variant="subtle" color="gray" size="xs" leftSection={<Undo2 size={14} />}>Refund</Button>
          <Divider orientation="vertical" />
          <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={18} /></ActionIcon>
        </Group>
      </Box>

      {/* Document Content Area */}
      <ScrollArea style={{ flex: 1 }} bg="#f1f5f9" p="xl">
        <Stack maw={850} mx="auto" gap="xl">
          <Paper withBorder p={60} radius="xs" bg="white" shadow="sm" style={{ position: 'relative', overflow: 'hidden' }}>
             
             {/* Ribbon Overlay */}
             <Box style={{ 
                position: 'absolute', 
                top: 30, 
                left: -40, 
                backgroundColor: '#48bb78', 
                color: 'white', 
                padding: '6px 60px', 
                transform: 'rotate(-45deg)',
                fontWeight: 900,
                fontSize: '14px',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Paid
              </Box>

             <Stack gap={60}>
                <Box>
                   <Title order={3} fw={700}>{settings?.shopName || 'jhakkasdheeraj'}</Title>
                   <Text size="sm" c="dimmed">Japan</Text>
                </Box>

                <Box style={{ textAlign: 'center' }}>
                   <Title order={3} fw={600} style={{ letterSpacing: '2px', color: '#444' }}>PAYMENT RECEIPT</Title>
                </Box>

                <Grid grow align="flex-start">
                   <Grid.Col span={7}>
                      <Stack gap="xl">
                         <Group gap={40}>
                            <Text size="sm" c="dimmed" w={150}>Payment Date</Text>
                            <Text size="sm" fw={600}>{new Date(payment.date).toLocaleDateString('en-GB')}</Text>
                         </Group>
                         <Group gap={40}>
                            <Text size="sm" c="dimmed" w={150}>Reference Number</Text>
                            <Box style={{ borderBottom: '1px solid #eee', flex: 1, minHeight: '20px' }}>
                               <Text size="sm">{payment.reference || ''}</Text>
                            </Box>
                         </Group>
                         <Group gap={40}>
                            <Text size="sm" c="dimmed" w={150}>Payment Mode</Text>
                            <Text size="sm" fw={600}>{payment.paymentMode}</Text>
                         </Group>
                      </Stack>
                   </Grid.Col>
                   <Grid.Col span={5}>
                      <Box p="xl" bg="#76a152" style={{ textAlign: 'center', color: 'white', borderRadius: '4px' }}>
                         <Text size="xs" fw={700} mb="xs">Amount Received</Text>
                         <Title order={1} fw={900}>¥{payment.amount.toLocaleString()}</Title>
                      </Box>
                   </Grid.Col>
                </Grid>

                <Box mt="xl">
                   <Text size="sm" c="dimmed" mb="sm" fw={600}>Received From</Text>
                   <Stack gap={0}>
                      <Anchor size="sm" fw={700} c="blue">{payment.customerName}</Anchor>
                      <Text size="xs" style={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>{formatAddress(partner)}</Text>
                      <Text size="xs">India</Text>
                   </Stack>
                </Box>

                <Divider />

                <Box>
                   <Title order={5} fw={700} mb="lg">Payment for</Title>
                   <Table verticalSpacing="md" withRowBorders={false}>
                      <Table.Thead bg="#f8f9fa">
                         <Table.Tr>
                            <Table.Th py="xs" style={{ borderBottom: '1px solid #eee' }}>Invoice Number</Table.Th>
                            <Table.Th py="xs" style={{ borderBottom: '1px solid #eee' }}>Invoice Date</Table.Th>
                            <Table.Th ta="right" py="xs" style={{ borderBottom: '1px solid #eee' }}>Invoice Amount</Table.Th>
                            <Table.Th ta="right" py="xs" style={{ borderBottom: '1px solid #eee' }}>Payment Amount</Table.Th>
                         </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                         <Table.Tr>
                            <Table.Td>
                               <Anchor size="sm" fw={600} c="blue">{invoice?.invoiceNumber || 'INV-000001'}</Anchor>
                            </Table.Td>
                            <Table.Td>
                               <Text size="sm">{invoice ? new Date(invoice.date).toLocaleDateString('en-GB') : '2026/05/08'}</Text>
                            </Table.Td>
                            <Table.Td ta="right">
                               <Text size="sm">¥{(invoice?.total || 12000).toLocaleString()}</Text>
                            </Table.Td>
                            <Table.Td ta="right">
                               <Text size="sm" fw={600}>¥{payment.amount.toLocaleString()}</Text>
                            </Table.Td>
                         </Table.Tr>
                      </Table.Tbody>
                   </Table>
                </Box>
             </Stack>
          </Paper>
        </Stack>
      </ScrollArea>
    </Box>
  );
}
