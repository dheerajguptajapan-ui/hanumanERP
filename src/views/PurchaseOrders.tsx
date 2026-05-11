import React, { useState, useEffect } from 'react';
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
  ScrollArea,
  rem,
  Center,
  Switch,
  Grid
} from '@mantine/core';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Settings, 
  FileText, 
  Package, 
  FileCheck,
  CreditCard,
  Edit,
  Mail,
  MoreHorizontal,
  ChevronRight,
  Download,
  Printer,
  FileDown,
  X,
  Paperclip
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { generateDocumentPDF } from '../utils/pdfGenerator';
import { notifications } from '@mantine/notifications';

interface PurchaseOrdersProps {
  onViewChange?: (view: string, id?: number, clone?: boolean, poId?: number) => void;
}

export function PurchaseOrders({ onViewChange }: PurchaseOrdersProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(true);

  const purchaseOrders = useLiveQuery(
    () => db.purchaseOrders.filter(po => 
      po.purchaseOrderNumber.toLowerCase().includes(search.toLowerCase()) || 
      po.vendorName.toLowerCase().includes(search.toLowerCase())
    ).toArray(),
    [search]
  );

  const products = useLiveQuery(() => db.products.toArray());
  const partners = useLiveQuery(() => db.partners.toArray());

  const getProductName = (id: string | number) => {
    const p = products?.find(p => p.id === Number(id));
    return p ? p.name : id;
  };

  const selectedPO = purchaseOrders?.find(po => po.id === selectedId);
  const selectedVendor = partners?.find(p => p.id === selectedPO?.vendorId);

  useEffect(() => {
    if (purchaseOrders && purchaseOrders.length > 0 && selectedId === null) {
      setSelectedId(purchaseOrders[0].id!);
    }
  }, [purchaseOrders]);

  useEffect(() => {
    const loadPdf = async () => {
      if (selectedPO && showPdf) {
        const url = await generateDocumentPDF('Purchase Order', selectedPO, 'blob') as string;
        setPdfUrl(url);
      }
    };
    loadPdf();
  }, [selectedPO, showPdf]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    await db.purchaseOrders.update(id, { status: newStatus as any });
    notifications.show({ title: 'Success', message: `Status updated to ${newStatus}`, color: 'green' });
  };

  const formatAddress = (p: any, type: 'billing' | 'shipping') => {
    if (!p) return 'No Address Provided';
    const prefix = type === 'billing' ? 'billing' : 'shipping';
    const lines = [
      p[`${prefix}Line1`],
      p[`${prefix}Line2`],
      [p[`${prefix}City`], p[`${prefix}State`], p[`${prefix}Pincode`]].filter(Boolean).join(', '),
      p[`${prefix}Country`]
    ];
    return lines.filter(Boolean).join('\n');
  };

  if (!purchaseOrders || purchaseOrders.length === 0) {
    return (
      <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
        <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
            <Group gap="xs">
              <Title order={4} fw={600} c="gray.8">All Purchase Orders</Title>
              <ChevronDown size={16} color="gray" />
            </Group>
            <Group gap="xs">
               <Button 
                 leftSection={<Plus size={16} />} 
                 color="blue" 
                 size="xs"
                 onClick={() => onViewChange?.('new-purchase-order')}
               >
                 New
               </Button>
               <ActionIcon variant="default"><MoreHorizontal size={16} /></ActionIcon>
            </Group>
          </Group>
        </Box>
        <Box style={{ flex: 1, overflowY: 'auto' }} p="md">
          <Center h="100%" style={{ flexDirection: 'column' }}>
            <Stack align="center" gap="lg" maw={800} w="100%">
               <Stack gap={5} align="center">
                 <Title order={3} fw={400}>Start Managing Your Purchase Activities!</Title>
                 <Text size="sm" c="dimmed" ta="center">Create, customize, and send professional Purchase Orders to your vendors.</Text>
               </Stack>
               <Group mt="md">
                 <Button color="blue" size="md" radius="sm" onClick={() => onViewChange?.('new-purchase-order')}>CREATE NEW PURCHASE ORDER</Button>
               </Group>
            </Stack>
          </Center>
        </Box>
      </Box>
    );
  }

  return (
    <Box h="100%" bg="#f8f9fa" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="xs">
            <Title order={4} fw={600} c="gray.8">All Purchase Orders</Title>
            <ChevronDown size={16} color="gray" />
          </Group>
          <Group gap="xs">
            <Button 
              leftSection={<Plus size={16} />} 
              color="blue" 
              size="xs"
              onClick={() => onViewChange?.('new-purchase-order')}
            >
              New
            </Button>
            <ActionIcon variant="default"><MoreHorizontal size={16} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      <Grid gutter={0} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Left List */}
        <Grid.Col span={selectedId ? 4 : 12} style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box p="xs" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <TextInput
              placeholder="Search in Purchase Orders"
              leftSection={<Search size={14} />}
              size="xs"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </Box>
          <ScrollArea style={{ flex: 1 }}>
            {purchaseOrders.map((po) => (
              <Box
                key={po.id}
                p="md"
                bg={selectedId === po.id ? '#f1f3f5' : 'white'}
                style={{ 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setSelectedId(po.id!)}
              >
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>{po.vendorName}</Text>
                  <Text size="sm" fw={600}>₹{po.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">{po.purchaseOrderNumber}</Text>
                    <Text size="xs" c="dimmed">•</Text>
                    <Text size="xs" c="dimmed">{new Date(po.date).toLocaleDateString()}</Text>
                  </Group>
                </Group>
                <Badge mt="xs" color={po.status === 'issued' ? 'blue' : po.status === 'received' ? 'green' : 'gray'} variant="light" size="xs">
                   {po.status.toUpperCase()}
                </Badge>
              </Box>
            ))}
          </ScrollArea>
        </Grid.Col>

        {/* Right Detail Pane */}
        {selectedId && selectedPO && (
          <Grid.Col span={8} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fa' }}>
            <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
               <Group justify="space-between">
                  <Title order={3} fw={500}>{selectedPO.purchaseOrderNumber}</Title>
                  <Group gap="xs">
                     <Button variant="default" size="xs" leftSection={<Edit size={14} />} onClick={() => onViewChange?.('new-purchase-order', selectedPO.id)}>Edit</Button>
                     <Button variant="default" size="xs" leftSection={<Printer size={14} />} onClick={() => generateDocumentPDF('Purchase Order', selectedPO, 'download')}>PDF/Print</Button>
                     <Button variant="default" size="xs" leftSection={<FileText size={14} />} onClick={() => onViewChange?.('new-bill', undefined, false, selectedPO.id)}>Convert to Bill</Button>
                     <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                           <ActionIcon variant="default" size="sm"><MoreHorizontal size={14} /></ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                           <Menu.Item onClick={() => onViewChange?.('new-purchase-order', selectedPO.id)}>Clone</Menu.Item>
                           <Menu.Item color="red" onClick={async () => {
                              if (confirm('Are you sure you want to delete this PO?')) {
                                 await db.purchaseOrders.delete(selectedPO.id!);
                                 setSelectedId(null);
                                 notifications.show({ title: 'Deleted', message: 'Purchase Order deleted', color: 'red' });
                              }
                           }}>Delete</Menu.Item>
                        </Menu.Dropdown>
                     </Menu>
                     <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setSelectedId(null)}><X size={14} /></ActionIcon>
                  </Group>
               </Group>
            </Box>

            <ScrollArea style={{ flex: 1 }} p="md">
              <Stack gap="md" maw={850} mx="auto">
                <Group justify="flex-end" mb="xs">
                  <Text size="sm" fw={500}>Show PDF View</Text>
                  <Switch checked={showPdf} onChange={(event) => setShowPdf(event.currentTarget.checked)} size="md" />
                </Group>

                {showPdf && pdfUrl ? (
                   <Paper shadow="sm" radius="md" style={{ overflow: 'hidden', height: '800px' }}>
                     <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} title="PDF Preview" />
                   </Paper>
                ) : (
                   <Paper shadow="sm" radius="md" p={rem(40)} bg="white">
                      <Grid gutter={50}>
                        <Grid.Col span={7}>
                          <Title order={3} fw={400} c="gray.8">PURCHASE ORDER</Title>
                          <Text size="sm" mt={4}>Purchase Order# <Text component="span" fw={600}>{selectedPO.purchaseOrderNumber}</Text></Text>
                          
                          <Box mt="xl">
                            <Text size="xs" fw={700} c="gray.6" mb="xs">STATUS</Text>
                            <Grid gutter="xs">
                              <Grid.Col span={4}><Text size="sm">Order</Text></Grid.Col>
                              <Grid.Col span={8}><Badge color="blue" variant="filled" radius="sm">{selectedPO.status.toUpperCase()}</Badge></Grid.Col>
                              
                              <Grid.Col span={4}><Text size="sm" c="dimmed">Receive</Text></Grid.Col>
                              <Grid.Col span={8}><Text size="sm" c="gray.6">Yet To Be Received</Text></Grid.Col>
                              
                              <Grid.Col span={4}><Text size="sm" c="dimmed">Bill</Text></Grid.Col>
                              <Grid.Col span={8}><Text size="sm" c="gray.6">Yet To Be Billed</Text></Grid.Col>
                            </Grid>
                          </Box>

                          <Grid gutter="xs" mt="xl">
                            <Grid.Col span={4}><Text size="xs" fw={700} c="gray.6">ORDER DATE</Text></Grid.Col>
                            <Grid.Col span={8}><Text size="sm">{new Date(selectedPO.date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/')}</Text></Grid.Col>
                            
                            <Grid.Col span={4} mt="sm"><Text size="xs" fw={700} c="gray.6">PAYMENT TERMS</Text></Grid.Col>
                            <Grid.Col span={8} mt="sm"><Text size="sm">{selectedPO.paymentTerms || 'Due on Receipt'}</Text></Grid.Col>
                          </Grid>
                        </Grid.Col>
                        
                        <Grid.Col span={5}>
                          <Text size="xs" fw={700} c="gray.6" mb="xs">VENDOR ADDRESS</Text>
                          <Text size="sm" c="blue" fw={500}>{selectedPO.vendorName}</Text>
                          <Text size="sm" mt={4} style={{ whiteSpace: 'pre-line', color: '#4b5563' }}>
                            {formatAddress(selectedVendor, 'billing')}
                          </Text>
                          
                          <Text size="xs" fw={700} c="gray.6" mt="xl" mb="xs">DELIVERY ADDRESS</Text>
                          <Text size="sm" style={{ color: '#4b5563' }}>{selectedPO.deliveryAddress || 'Organization Address'}</Text>
                        </Grid.Col>
                      </Grid>

                      <Table mt={rem(40)} verticalSpacing="md" style={{ borderTop: '1px solid #e2e8f0' }}>
                        <Table.Thead bg="#f8f9fa">
                          <Table.Tr>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>ITEMS & DESCRIPTION</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>ORDERED</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>STATUS</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>RATE</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>AMOUNT</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {selectedPO.items?.map((item: any, i: number) => (
                            <Table.Tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <Table.Td>
                                <Group gap="sm">
                                  <Box w={30} h={30} bg="gray.0" style={{ borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={16} color="#94a3b8" />
                                  </Box>
                                  <Text size="sm" c="blue">{getProductName(item.productId)}</Text>
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" fw={600}>{item.quantity}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Text size="xs" c="dimmed">Yet to be received</Text>
                              </Table.Td>
                              <Table.Td ta="right"><Text size="sm">₹{Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text></Table.Td>
                              <Table.Td ta="right"><Text size="sm" fw={500}>₹{(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text></Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>

                      <Box mt="xl" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Box w={300}>
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" c="gray.7">Sub Total</Text>
                            <Text size="sm" fw={600}>₹{selectedPO.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                          </Group>
                          <Group justify="space-between" mb="sm">
                            <Text size="sm" c="gray.7">Discount</Text>
                            <Text size="sm" c="gray.6">(-) ₹{(selectedPO.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                          </Group>
                          
                          <Divider mb="sm" />
                          
                          <Group justify="space-between" mb="xs">
                            <Text fw={700}>Total</Text>
                            <Text fw={700}>₹{selectedPO.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                          </Group>
                        </Box>
                      </Box>
                   </Paper>
                )}
              </Stack>
            </ScrollArea>
          </Grid.Col>
        )}
      </Grid>
    </Box>
  );
}
