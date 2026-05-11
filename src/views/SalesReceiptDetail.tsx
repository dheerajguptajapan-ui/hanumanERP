import React from 'react';
import { 
  Box, 
  Group, 
  Title, 
  Text, 
  ActionIcon, 
  Badge,
  Stack,
  Table,
  Divider,
  Paper,
  Button,
  Menu,
  Grid,
  ScrollArea,
  rem,
  Anchor,
} from '@mantine/core';
import { 
  X, 
  Edit, 
  Mail, 
  Printer, 
  Trash, 
  MoreHorizontal, 
  ChevronDown, 
  Copy,
  Paperclip,
  MessageSquare,
  History,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { generateDocumentPDF } from '../utils/pdfGenerator';

interface SalesReceiptDetailProps {
  receiptId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
}

export function SalesReceiptDetail({ receiptId, onClose, onEdit }: SalesReceiptDetailProps) {
  const receipt = useLiveQuery(() => db.salesReceipts.get(receiptId), [receiptId]);
  const partner = useLiveQuery(async () => {
    if (!receipt) return undefined;
    return await db.partners.get(receipt.customerId);
  }, [receipt]);
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  if (!receipt) return null;

  const handlePrint = () => {
    generateDocumentPDF('Sales Receipt', receipt);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sales receipt?')) {
      await db.salesReceipts.delete(receiptId);
      notifications.show({ title: 'Deleted', message: 'Sales receipt removed', color: 'gray' });
      onClose();
    }
  };

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
          <Title order={4} fw={600}>{receipt.receiptNumber}</Title>
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
          <Button variant="subtle" color="gray" size="xs" leftSection={<Edit size={14} />} onClick={() => onEdit(receiptId)}>Edit</Button>
          <Divider orientation="vertical" />
          <Button variant="subtle" color="gray" size="xs" leftSection={<Mail size={14} />}>Send Email</Button>
          <Divider orientation="vertical" />
          <Menu shadow="md" width={150}>
            <Menu.Target>
              <Button variant="subtle" color="gray" size="xs" leftSection={<Printer size={14} />} rightSection={<ChevronDown size={12} />}>PDF/Print</Button>
            </Menu.Target>
            <Menu.Dropdown>
               <Menu.Item onClick={handlePrint}>Print Receipt</Menu.Item>
               <Menu.Item onClick={handlePrint}>Download PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Divider orientation="vertical" />
          <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={18} /></ActionIcon>
        </Group>
      </Box>

      {/* Document Content Area */}
      <ScrollArea style={{ flex: 1 }} bg="#f1f5f9" p="xl">
        <Stack maw={900} mx="auto" gap="xl">
          <Paper withBorder p={60} radius="xs" bg="white" shadow="sm" style={{ position: 'relative' }}>
             {/* Document Header */}
             <Stack gap={40}>
                <Box>
                   <Title order={3} fw={700}>{settings?.shopName || 'jhakkasdheeraj'}</Title>
                   <Text size="sm" c="dimmed">Japan</Text>
                </Box>

                <Box>
                   <Title order={2} fw={800} style={{ letterSpacing: '1px' }}>SALES RECEIPT</Title>
                   <Text size="sm" fw={600}>Sales Receipt# {receipt.receiptNumber}</Text>
                </Box>

                <Grid grow>
                   <Grid.Col span={6}>
                      <Stack gap={4}>
                         <Text size="sm" fw={700}>Bill To</Text>
                         <Anchor size="sm" fw={600} c="blue">{receipt.customerName}</Anchor>
                         <Text size="xs" style={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>{formatAddress(partner)}</Text>
                         <Text size="xs">India</Text>
                      </Stack>
                   </Grid.Col>
                   <Grid.Col span={6} style={{ textAlign: 'right' }}>
                      <Group justify="flex-end" gap={40}>
                         <Stack gap={2} align="flex-start">
                            <Text size="xs" c="dimmed" fw={700}>Receipt Date</Text>
                            <Text size="sm">{new Date(receipt.date).toLocaleDateString('en-GB')}</Text>
                         </Stack>
                      </Group>
                   </Grid.Col>
                </Grid>

                {/* Items Table */}
                <Table verticalSpacing="sm" withRowBorders={false}>
                  <Table.Thead bg="#f8f9fa">
                    <Table.Tr>
                      <Table.Th py="xs" style={{ borderBottom: '1px solid #eee' }}>#</Table.Th>
                      <Table.Th py="xs" style={{ borderBottom: '1px solid #eee' }}>Item & Description</Table.Th>
                      <Table.Th ta="right" py="xs" style={{ borderBottom: '1px solid #eee' }}>Qty</Table.Th>
                      <Table.Th ta="right" py="xs" style={{ borderBottom: '1px solid #eee' }}>Rate</Table.Th>
                      <Table.Th ta="right" py="xs" style={{ borderBottom: '1px solid #eee' }}>Amount</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {receipt.items.map((item, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td style={{ verticalAlign: 'top' }}>{idx + 1}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>{item.productName}</Text>
                          <Text size="xs" c="dimmed">box</Text>
                        </Table.Td>
                        <Table.Td ta="right">{item.quantity.toFixed(2)}</Table.Td>
                        <Table.Td ta="right">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
                        <Table.Td ta="right" fw={600}>{ (item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 }) }</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                {/* Summary Section */}
                <Box ml="auto" style={{ width: 250 }}>
                   <Stack gap="sm">
                      <Group justify="space-between">
                         <Text size="sm" fw={600}>Sub Total</Text>
                         <Text size="sm">{receipt.subtotal.toLocaleString()}</Text>
                      </Group>
                      <Divider />
                      <Group justify="space-between">
                         <Title order={4} fw={800}>Total</Title>
                         <Title order={4} fw={800}>¥{receipt.total.toLocaleString()}</Title>
                      </Group>
                   </Stack>
                </Box>

                {/* Payment Details Box */}
                <Box p="lg" bg="#f8f9fa" style={{ borderRadius: '8px' }}>
                   <Title order={6} mb="md" fw={700}>Payment Details</Title>
                   <Grid>
                      <Grid.Col span={4}>
                         <Text size="xs" c="dimmed">Payment Mode</Text>
                         <Text size="sm" fw={500}>{receipt.paymentMode}</Text>
                      </Grid.Col>
                   </Grid>
                </Box>
             </Stack>

             {/* Template Info (Floating bottom right in original but let's put it at bottom) */}
             <Box mt={60} style={{ textAlign: 'right' }}>
                <Text size="xs" c="dimmed">
                   PDF Template: <Anchor size="xs" fw={700} c="blue">'Elegant'</Anchor> <Anchor size="xs" c="blue">Change</Anchor>
                </Text>
             </Box>
          </Paper>

          {/* More Information Section */}
          <Box mt="xl">
             <Title order={5} fw={600} mb="xl">More Information</Title>
             <Group align="flex-start">
                <Text size="sm" c="dimmed" style={{ width: 150 }}>Email Recipients</Text>
                <Text size="sm">{partner?.email || 'gupta@gmail.com'}</Text>
             </Group>
          </Box>
        </Stack>
      </ScrollArea>
    </Box>
  );
}
