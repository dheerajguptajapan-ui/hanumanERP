import React, { useState } from 'react';
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
  Tooltip,
  Accordion,
  Anchor,
  Switch,
  Center
} from '@mantine/core';
import { 
  X, 
  Edit, 
  Mail, 
  Printer, 
  Trash, 
  MoreHorizontal, 
  ChevronDown, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  FileText,
  CreditCard,
  History,
  Zap,
  Copy,
  XCircle,
  Settings2
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { generateDocumentPDF } from '../utils/pdfGenerator';

interface InvoiceDetailProps {
  invoiceId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
  onViewChange?: (view: string, id?: number, clone?: boolean) => void;
}

export function InvoiceDetail({ invoiceId, onClose, onEdit, onViewChange }: InvoiceDetailProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const invoice = useLiveQuery(() => db.invoices.get(invoiceId), [invoiceId]);
  const partner = useLiveQuery(async () => {
    if (!invoice) return undefined;
    return await db.partners.get(invoice.customerId);
  }, [invoice]);
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const payments = useLiveQuery(() => db.payments.filter(p => p.invoiceId === invoiceId).toArray(), [invoiceId]);

  React.useEffect(() => {
    if (showPDF && invoice) {
      generateDocumentPDF('Tax Invoice', invoice, 'blob').then(url => {
        if (url) setPreviewUrl(url as string);
      });
    }
  }, [showPDF, invoice]);

  if (!invoice) return null;

  const balanceDue = invoice.total - (invoice.amountPaid || 0);

  const handlePrint = () => {
    generateDocumentPDF('Tax Invoice', invoice);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await db.invoices.delete(invoiceId);
      notifications.show({ title: 'Deleted', message: 'Invoice removed', color: 'gray' });
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
          <Title order={4} fw={600}>{invoice.invoiceNumber}</Title>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray"><Plus size={18} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray"><FileText size={18} /></ActionIcon>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Action Buttons */}
      <Box p="xs" px="md" style={{ borderBottom: '1px solid #e2e8f0' }} bg="#f8f9fa">
        <Group gap="xs">
          <Button variant="subtle" color="gray" size="xs" leftSection={<Edit size={14} />} onClick={() => onEdit(invoiceId)}>Edit</Button>
          <Divider orientation="vertical" />
          <Button variant="subtle" color="gray" size="xs" leftSection={<Mail size={14} />}>Send Email</Button>
          <Divider orientation="vertical" />
          <Button variant="subtle" color="gray" size="xs" leftSection={<ArrowRight size={14} />}>Share</Button>
          <Divider orientation="vertical" />
          <Menu shadow="md" width={150}>
            <Menu.Target>
              <Button variant="subtle" color="gray" size="xs" leftSection={<History size={14} />} rightSection={<ChevronDown size={12} />}>Reminders</Button>
            </Menu.Target>
            <Menu.Dropdown>
               <Menu.Item>Send Reminder</Menu.Item>
               <Menu.Item>Stop Reminders</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Divider orientation="vertical" />
          <Menu shadow="md" width={150}>
            <Menu.Target>
              <Button variant="subtle" color="gray" size="xs" leftSection={<Printer size={14} />} rightSection={<ChevronDown size={12} />}>PDF/Print</Button>
            </Menu.Target>
            <Menu.Dropdown>
               <Menu.Item onClick={handlePrint}>Print Invoice</Menu.Item>
               <Menu.Item onClick={handlePrint}>Download PDF</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Divider orientation="vertical" />
          <Button 
            variant="subtle" 
            color="gray" 
            size="xs" 
            leftSection={<CreditCard size={14} />}
            onClick={() => onViewChange?.('new-payment', invoiceId)}
            disabled={invoice.status === 'paid'}
          >
            Record Payment
          </Button>
          <Divider orientation="vertical" />
          <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={18} /></ActionIcon>
        </Group>
      </Box>

      {/* Main Content Area */}
      <ScrollArea style={{ flex: 1 }} bg="#f1f5f9">
        <Stack p="xl" gap="md" maw={1000} mx="auto">
           
           {/* PAID Status Ribbon at top (if paid) */}
           {invoice.status === 'paid' && (
             <Paper withBorder p="sm" bg="#f0fff4" radius="md">
                <Group gap="xs">
                   <CheckCircle2 size={16} color="#38a169" fill="#38a169" stroke="white" />
                   <Text size="xs" fw={700} c="green.8">PAID</Text>
                </Group>
             </Paper>
           )}

           {/* WHAT'S NEXT Banner (if not paid) */}
           {invoice.status !== 'paid' && (
             <Paper withBorder p="sm" bg="white" radius="md">
               <Group justify="space-between">
                 <Group gap="xs">
                   <Zap size={16} color="#6366f1" fill="#6366f1" />
                   <Text size="xs">
                     <Text span fw={700} size="xs">WHAT'S NEXT? </Text> 
                     Invoice has been sent. Record payment for it as soon as you receive payment. <Anchor size="xs">Learn More</Anchor>
                   </Text>
                 </Group>
                 <Button size="xs" color="blue" onClick={() => onViewChange?.('new-payment', invoiceId)}>Record Payment</Button>
               </Group>
             </Paper>
           )}

           <Box p="sm" bg="white" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
             <Group gap="xl">
                <Group gap="xs" style={{ cursor: 'pointer' }}>
                   <Text size="sm" fw={600}>Payments Received</Text>
                   <Badge variant="light" color="blue" size="xs">{payments?.length || 0}</Badge>
                </Group>
                <Group gap="xs" style={{ cursor: 'pointer' }}>
                   <Text size="sm" fw={600}>Associated sales orders</Text>
                   <Badge variant="light" color="blue" size="xs">1</Badge>
                </Group>
             </Group>
           </Box>

           <Group justify="flex-end" mb="-xs">
             <Group gap="xs">
               <Text size="xs" fw={500} c="dimmed">Show PDF View</Text>
               <Switch size="xs" checked={showPDF} onChange={(e) => setShowPDF(e.currentTarget.checked)} />
             </Group>
           </Group>

           {/* Invoice Document */}
           {showPDF ? (
            <Paper withBorder radius="xs" bg="white" shadow="xs" style={{ height: 1000, overflow: 'hidden' }}>
               {previewUrl ? (
                 <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
               ) : (
                 <Center h="100%"><Stack align="center"><Zap size={24} color="blue" /><Text size="sm">Generating PDF...</Text></Stack></Center>
               )}
            </Paper>
           ) : (
            <Paper withBorder p={50} radius="xs" bg="white" shadow="xs" style={{ position: 'relative', overflow: 'hidden' }}>
              
              {/* Ribbon Overlay */}
              {invoice.status === 'paid' && (
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
                  PAID
                </Box>
              )}

              <Stack gap={40}>
                 <Group justify="space-between" align="flex-start">
                    <Box>
                       <Title order={3} fw={700}>{settings?.shopName || 'Hanuman Enterprise Solution'}</Title>
                       <Text size="sm" c="dimmed">{settings?.shopAddress?.split('\n')[0] || ''}</Text>
                    </Box>
                    <Box style={{ textAlign: 'right' }}>
                       <Title order={1} fw={900} style={{ letterSpacing: '2px' }}>INVOICE</Title>
                       <Text size="sm" fw={700}># {invoice.invoiceNumber}</Text>
                       <Box mt="xl">
                          <Text size="xs" fw={700} c="dimmed">Balance Due</Text>
                          <Title order={3} fw={800}>₹{balanceDue.toLocaleString()}</Title>
                       </Box>
                    </Box>
                 </Group>

                 <Grid>
                    <Grid.Col span={6}>
                       <Stack gap={4}>
                          <Text size="xs" fw={700} c="dimmed">Bill To</Text>
                          <Anchor size="sm" fw={700} c="blue">{invoice.customerName}</Anchor>
                          <Text size="xs" style={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>{formatAddress(partner)}</Text>
                          <Text size="xs">India</Text>
                       </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                       <Stack gap="xs">
                          <Group justify="flex-end" gap="xl">
                             <Text size="xs" fw={600} c="dimmed">Invoice Date :</Text>
                             <Text size="sm" w={100} ta="right">{new Date(invoice.date).toLocaleDateString('en-GB')}</Text>
                          </Group>
                          <Group justify="flex-end" gap="xl">
                             <Text size="xs" fw={600} c="dimmed">Terms :</Text>
                             <Text size="sm" w={100} ta="right">Due on Receipt</Text>
                          </Group>
                          <Group justify="flex-end" gap="xl">
                             <Text size="xs" fw={600} c="dimmed">Due Date :</Text>
                             <Text size="sm" w={100} ta="right">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</Text>
                          </Group>
                          <Group justify="flex-end" gap="xl">
                             <Text size="xs" fw={600} c="dimmed">P.O.# :</Text>
                             <Text size="sm" w={100} ta="right">{invoice.orderNumber || '-'}</Text>
                          </Group>
                       </Stack>
                    </Grid.Col>
                 </Grid>

                 <Table verticalSpacing="sm">
                    <Table.Thead bg="#333">
                       <Table.Tr>
                          <Table.Th c="white" fw={700} py="xs" style={{ borderRadius: '4px 0 0 4px' }}>#</Table.Th>
                          <Table.Th c="white" fw={700} py="xs">Item & Description</Table.Th>
                          <Table.Th c="white" fw={700} py="xs" ta="right">Qty</Table.Th>
                          <Table.Th c="white" fw={700} py="xs" ta="right">Rate</Table.Th>
                          <Table.Th c="white" fw={700} py="xs" ta="right" style={{ borderRadius: '0 4px 4px 0' }}>Amount</Table.Th>
                       </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                       {invoice.items.map((item, idx) => (
                          <Table.Tr key={idx}>
                             <Table.Td>{idx + 1}</Table.Td>
                             <Table.Td>
                                <Text size="sm" fw={600}>{item.productName}</Text>
                             </Table.Td>
                             <Table.Td ta="right">{item.quantity.toFixed(2)}</Table.Td>
                             <Table.Td ta="right">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
                             <Table.Td ta="right" fw={600}>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
                          </Table.Tr>
                       ))}
                    </Table.Tbody>
                 </Table>

                 <Box ml="auto" style={{ width: 300 }}>
                    <Stack gap="xs">
                       <Group justify="space-between">
                          <Text size="sm">Sub Total</Text>
                          <Text size="sm">{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                       </Group>
                       {invoice.cgst > 0 && (
                          <Group justify="space-between">
                             <Text size="sm">CGST ({invoice.items[0]?.gstRate/2}%)</Text>
                             <Text size="sm">{invoice.cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                          </Group>
                       )}
                       {invoice.sgst > 0 && (
                          <Group justify="space-between">
                             <Text size="sm">SGST ({invoice.items[0]?.gstRate/2}%)</Text>
                             <Text size="sm">{invoice.sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                          </Group>
                       )}
                       <Divider />
                       <Group justify="space-between">
                          <Title order={4} fw={800}>Total</Title>
                          <Title order={4} fw={800}>₹{invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Title>
                       </Group>
                       <Group justify="space-between" bg="#f8f9fa" p="xs" style={{ borderRadius: '4px' }}>
                          <Text size="sm" fw={700}>Payment Made</Text>
                          <Text size="sm" fw={700} c="red">(-) {invoice.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                       </Group>
                       <Group justify="space-between">
                          <Text size="sm" fw={700}>Balance Due</Text>
                          <Text size="sm" fw={700}>₹{balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                       </Group>
                    </Stack>
                 </Box>

                 <Box mt={60} ml="auto" style={{ width: 250, textAlign: 'right' }}>
                    <Stack gap="xl" align="flex-end">
                      <Box>
                        <Text size="sm" fw={600}>For {settings?.shopName || 'Hanuman Enterprise Solution'}</Text>
                        {settings?.companySealBase64 && (
                          <Box mt="xs">
                            <img src={settings.companySealBase64} alt="Company Seal" style={{ height: 60, objectFit: 'contain' }} />
                          </Box>
                        )}
                      </Box>
                      <Box style={{ width: '100%', borderTop: '1px solid #333' }} pt={5}>
                        <Text size="xs" fw={700} ta="center">Authorized Signatory</Text>
                      </Box>
                    </Stack>
                 </Box>
              </Stack>
            </Paper>
            )}
         </Stack>
      </ScrollArea>
    </Box>
  );
}
