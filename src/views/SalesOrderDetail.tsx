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
  Center,
  rem,
  ScrollArea,
  Switch,
  Tooltip,
  Modal
} from '@mantine/core';
import { 
  X, 
  MoreHorizontal, 
  Mail, 
  Printer, 
  FileText, 
  Trash, 
  Edit,
  CheckCircle2,
  Package,
  Truck,
  Paperclip,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Zap,
  MoreVertical,
  Plus,
  ArrowRight,
  Copy,
  ChevronRight
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { generateDocumentPDF } from '../utils/pdfGenerator';

interface SalesOrderDetailProps {
  orderId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
  onViewChange?: (view: string, id?: number, clone?: boolean) => void;
}

export function SalesOrderDetail({ orderId, onClose, onEdit, onViewChange }: SalesOrderDetailProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const order = useLiveQuery(() => db.salesOrders.get(orderId), [orderId]);

  React.useEffect(() => {
    if (showPDF && order) {
      generateDocumentPDF('Sales Order', order, 'blob').then(url => {
        if (url) setPreviewUrl(url as string);
      });
    }
  }, [showPDF, order]);
  
  const partner = useLiveQuery(async () => {
    if (!order) return undefined;
    return await db.partners.get(order.customerId);
  }, [order]);

  const settings = useLiveQuery(() => db.settings.toCollection().first());

  const [convertModalOpened, setConvertModalOpened] = useState(false);

  if (!order) return null;

  const handleMarkAsConfirmed = async () => {
    await db.salesOrders.update(orderId, { status: 'confirmed' });
    notifications.show({
      title: 'Success',
      message: 'Sales Order marked as confirmed',
      color: 'green'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sales order?')) {
      await db.salesOrders.delete(orderId);
      notifications.show({
        title: 'Deleted',
        message: 'Sales Order has been removed',
        color: 'gray'
      });
      onClose();
    }
  };

  const handlePrint = () => {
    generateDocumentPDF('Sales Order', order);
  };

  const handleEmail = () => {
    const subject = `Sales Order ${order.orderNumber}`;
    const body = `Hi ${partner?.name || 'Customer'},\n\nPlease find attached the sales order ${order.orderNumber}.\n\nTotal Amount: ₹${(order.total || 0).toLocaleString()}\n\nBest regards,\nHanuman Enterprise Solution Team`;
    window.location.href = `mailto:${partner?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const comingSoon = (feature: string) => {
    notifications.show({ title: 'Feature Coming Soon', message: `${feature} module is under development`, color: 'blue' });
  };

  const iconStyle = { width: rem(16), height: rem(16) };

  const formatAddress = (p: any) => {
    if (!p) return 'No Address Provided';
    const lines = [
      p.billingLine1 || p.address,
      p.billingLine2,
      [p.billingCity, p.billingState, p.billingPincode].filter(Boolean).join(', '),
      p.billingCountry
    ];
    return lines.filter(Boolean).join('\n');
  };

  return (
    <Box h="100%" style={{ display: 'flex', flexDirection: 'column' }} bg="white">
      {/* Top Navigation Bar */}
      <Box p="xs" px="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Title order={5} fw={600}>{order.orderNumber}</Title>
          <Group gap="xs">
            <Tooltip label="Attachments"><ActionIcon variant="subtle" color="gray"><Paperclip size={18} /></ActionIcon></Tooltip>
            <Tooltip label="Comments"><ActionIcon variant="subtle" color="gray"><MessageSquare size={18} /></ActionIcon></Tooltip>
            <Divider orientation="vertical" />
            <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Toolbar */}
      <Box p="xs" px="md" style={{ borderBottom: '1px solid #e2e8f0' }} bg="#f8f9fa">
        <Group justify="space-between">
          <Group gap={5}>
            <Button variant="subtle" color="gray" size="xs" leftSection={<Edit size={14} />} onClick={() => onEdit(orderId)}>Edit</Button>
            <Divider orientation="vertical" />
            <Button variant="subtle" color="gray" size="xs" leftSection={<Mail size={14} />} onClick={handleEmail}>Send Email</Button>
            <Divider orientation="vertical" />
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <Button variant="subtle" color="gray" size="xs" leftSection={<Printer size={14} />} rightSection={<ChevronDown size={12} />}>PDF/Print</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={handlePrint}>Print PDF</Menu.Item>
                <Menu.Item onClick={handlePrint}>Download PDF</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Divider orientation="vertical" />
            {(order.status === 'draft' || order.status === 'pending' || !order.status) && (
              <Button variant="subtle" color="gray" size="xs" leftSection={<CheckCircle2 size={14} />} onClick={handleMarkAsConfirmed}>Mark as Confirmed</Button>
            )}
            <Divider orientation="vertical" />
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <Button variant="subtle" color="gray" size="xs" leftSection={<Plus size={14} />} rightSection={<ChevronDown size={12} />}>Create</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Package size={14} />} onClick={() => comingSoon('Packaging')}>Package</Menu.Item>
                <Menu.Item leftSection={<Truck size={14} />} onClick={() => comingSoon('Shipment')}>Shipment</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Divider orientation="vertical" />
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={18} /></ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<ArrowRight size={14} />} onClick={() => setConvertModalOpened(true)}>Convert to Invoice</Menu.Item>
                <Menu.Item leftSection={<ArrowRight size={14} />} onClick={() => comingSoon('Purchase Order Conversion')}>Convert to Purchase Order</Menu.Item>
                <Menu.Item leftSection={<Copy size={14} />} onClick={() => onViewChange?.('new-sales-order', orderId, true)}>Clone</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Trash size={14} />} onClick={handleDelete}>Delete</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      {/* Main Content Area */}
      <ScrollArea style={{ flex: 1 }} bg="#f1f5f9">
        <Stack p="xl" gap="md">
          {/* What's Next Banner */}
          {(order.status === 'draft' || order.status === 'pending' || !order.status) && (
            <Paper withBorder p="md" radius="sm" style={{ borderLeft: '4px solid #3b82f6' }} bg="white">
              <Group justify="space-between">
                <Group gap="sm">
                  <Zap size={18} color="#3b82f6" fill="#3b82f6" />
                  <Text size="sm" fw={600}>WHAT'S NEXT?</Text>
                  <Text size="sm" c="dimmed">Send this Sales Order to your customer by email or mark it as Confirmed.</Text>
                </Group>
                <Group gap="xs">
                  <Button size="xs" color="blue" onClick={() => notifications.show({ title: 'Email Sent', message: 'Order sent to customer', color: 'blue' })}>Send Sales Order</Button>
                  <Button size="xs" variant="outline" color="gray" onClick={handleMarkAsConfirmed}>Mark as Confirmed</Button>
                </Group>
              </Group>
            </Paper>
          )}

          {/* Packages Section */}
          <Paper withBorder p="xs" px="md" radius="sm" bg="white">
            <Group justify="space-between" style={{ cursor: 'pointer' }}>
              <Text size="sm" fw={600}>Packages</Text>
              <ChevronRight size={14} color="#94a3b8" />
            </Group>
          </Paper>

          {/* Document Preview Header */}
          <Group justify="flex-end" mb="-xs">
            <Group gap="xs">
              <Text size="xs" fw={500} c="dimmed">Show PDF View</Text>
              <Switch size="xs" checked={showPDF} onChange={(e) => setShowPDF(e.currentTarget.checked)} />
            </Group>
          </Group>

          {/* The Document */}
          {showPDF ? (
            <Paper withBorder radius="sm" bg="white" style={{ height: 1000, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
               {previewUrl ? (
                 <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
               ) : (
                 <Center h="100%"><Stack align="center"><Zap size={24} color="blue" /><Text size="sm">Generating PDF...</Text></Stack></Center>
               )}
            </Paper>
          ) : (
            <Paper withBorder p={50} radius="sm" bg="white" style={{ minHeight: 800, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Stack gap={40}>
              <Group justify="space-between" align="flex-start">
                <Stack gap={5}>
                  <Title order={2} fw={700} style={{ letterSpacing: '1px' }}>SALES ORDER</Title>
                  <Text size="sm" fw={500}>Sales Order# {order.orderNumber}</Text>
                  <Badge color={order.status === 'confirmed' ? 'green' : 'gray'} variant="filled" radius="xs" size="sm" mt={5}>
                    {(order.status || 'draft').toUpperCase()}
                  </Badge>
                </Stack>
                <Stack align="flex-end" gap={5}>
                  <Text size="xs" fw={700} c="dimmed">BILLING ADDRESS</Text>
                  <Text fw={600} size="sm" c="blue">{partner?.name || order.partnerName || 'Unknown Customer'}</Text>
                  <Text size="xs" ta="right" maw={250} style={{ whiteSpace: 'pre-line' }}>{formatAddress(partner)}</Text>
                </Stack>
              </Group>

              <Grid>
                <Grid.Col span={4}>
                  <Stack gap={2}>
                    <Text size="xs" fw={700} c="dimmed">ORDER DATE</Text>
                    <Text size="sm" fw={500}>{order.date ? new Date(order.date).toLocaleDateString() : '-'}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack gap={2}>
                    <Text size="xs" fw={700} c="dimmed">EXPECTED SHIPMENT DATE</Text>
                    <Text size="sm" fw={500}>{order.shipmentDate ? new Date(order.shipmentDate).toLocaleDateString() : '-'}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack gap={2}>
                    <Text size="xs" fw={700} c="dimmed">PAYMENT TERMS</Text>
                    <Text size="sm" fw={500}>{order.paymentTerms || 'Due on Receipt'}</Text>
                  </Stack>
                </Grid.Col>
              </Grid>

              <Table verticalSpacing="md" withRowBorders>
                <Table.Thead bg="#f8f9fa">
                  <Table.Tr>
                    <Table.Th style={{ borderTop: 'none' }} py="xs">ITEMS & DESCRIPTION</Table.Th>
                    <Table.Th style={{ borderTop: 'none' }} ta="right" py="xs">ORDERED</Table.Th>
                    <Table.Th style={{ borderTop: 'none' }} ta="right" py="xs">STATUS</Table.Th>
                    <Table.Th style={{ borderTop: 'none' }} ta="right" py="xs">RATE</Table.Th>
                    <Table.Th style={{ borderTop: 'none' }} ta="right" py="xs">AMOUNT</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(order.items || []).map((item: any, idx: number) => (
                    <Table.Tr key={idx}>
                      <Table.Td>
                        <Group gap="sm">
                          <Box bg="#f8f9fa" p={8} style={{ borderRadius: '4px' }}>
                            <Package size={20} color="#94a3b8" />
                          </Box>
                          <Stack gap={0}>
                            <Text size="sm" fw={500} c="blue">{item.productName || 'Unknown Product'}</Text>
                            <Text size="xs" c="dimmed">SKU: {item.sku || '-'}</Text>
                          </Stack>
                        </Group>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm">{item.quantity || 0}</Text>
                        <Text size="xs" c="dimmed">{item.unit || 'pcs'}</Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Stack gap={2} align="flex-end">
                          <Text size="xs" fw={600}>0 Packed</Text>
                          <Text size="xs" fw={600}>0 Invoiced</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm">₹{(item.price || 0).toLocaleString()}</Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={600}>₹{(item.total || 0).toLocaleString()}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              <Box ml="auto" style={{ width: 300 }}>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={700}>Sub Total</Text>
                    <Text size="sm" fw={700}>₹{(order.subtotal || order.totalAmount || 0).toLocaleString()}</Text>
                  </Group>
                  <Text size="xs" c="dimmed" ta="right">Total Quantity : {(order.items || []).length}</Text>
                  <Group justify="space-between">
                    <Text size="sm">Discount</Text>
                    <Text size="sm">₹0</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">IGST</Text>
                    <Text size="sm">₹{(order.totalGst || 0).toLocaleString()}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={700} size="lg">Total</Text>
                    <Text fw={700} size="lg">₹{(order.total || order.totalAmount || 0).toLocaleString()}</Text>
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
      {/* Convert to Invoice Modal */}
      <Modal 
        opened={convertModalOpened} 
        onClose={() => setConvertModalOpened(false)} 
        title={<Group gap="xs"><Zap size={20} color="#f59e0b" /><Text fw={600} size="lg">Convert to Invoice</Text></Group>}
        centered
        size="md"
      >
        <Stack gap="lg">
          <Text size="sm">The sales order will be automatically confirmed once you convert it to an invoice</Text>
          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={() => setConvertModalOpened(false)}>Cancel</Button>
            <Button color="blue" onClick={() => {
              setConvertModalOpened(false);
              onViewChange?.('convert-to-invoice', orderId);
            }}>
              Convert to Invoice
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
