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
  ShoppingBag,
  X,
  Paperclip
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { generateDocumentPDF } from '../utils/pdfGenerator';
import { notifications } from '@mantine/notifications';

interface BillsProps {
  onViewChange?: (view: string, id?: number) => void;
  initialFilter?: 'all' | 'unpaid' | 'draft';
}

export function Bills({ onViewChange, initialFilter = 'all' }: BillsProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'unpaid' | 'draft'>(initialFilter);

  const bills = useLiveQuery(
    () => {
      let query = db.purchaseBills.filter(bill => 
        bill.billNumber.toLowerCase().includes(search.toLowerCase()) || 
        bill.supplierName.toLowerCase().includes(search.toLowerCase())
      );

      if (currentFilter === 'unpaid') {
        query = query.filter(bill => bill.status === 'open' || bill.status === 'partial');
      } else if (currentFilter === 'draft') {
        query = query.filter(bill => bill.status === 'draft');
      }

      return query.toArray();
    },
    [search, currentFilter]
  );

  const products = useLiveQuery(() => db.products.toArray());
  const partners = useLiveQuery(() => db.partners.toArray());

  const getProductName = (id: string | number) => {
    const p = products?.find(p => p.id === Number(id));
    return p ? p.name : id;
  };

  const getProductAccount = (id: string | number) => {
    const p = products?.find(p => p.id === Number(id));
    return p?.purchaseAccount || 'Inventory Asset';
  };

  const selectedBill = bills?.find(b => b.id === selectedId);
  const selectedVendor = partners?.find(p => p.id === selectedBill?.supplierId);

  useEffect(() => {
    if (bills && bills.length > 0 && selectedId === null) {
      setSelectedId(bills[0].id!);
    }
  }, [bills]);

  useEffect(() => {
    const loadPdf = async () => {
      if (selectedBill && showPdf) {
        const url = await generateDocumentPDF('Bill', selectedBill, 'blob') as string;
        setPdfUrl(url);
      }
    };
    loadPdf();
  }, [selectedBill, showPdf]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    await db.purchaseBills.update(id, { status: newStatus as any });
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

  if (!bills || bills.length === 0) {
    return (
      <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header Bar */}
        <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
            <Group gap="xs">
              <Title order={4} fw={600} c="gray.8">All Bills</Title>
              <ChevronDown size={16} color="gray" />
            </Group>
            <Group gap="xs">
               <ActionIcon variant="default"><Settings size={16} /></ActionIcon>
               <Button 
                 leftSection={<Plus size={16} />} 
                 color="blue" 
                 size="xs"
                 onClick={() => onViewChange?.('new-bill')}
               >
                 New
               </Button>
               <ActionIcon variant="default"><MoreHorizontal size={16} /></ActionIcon>
            </Group>
          </Group>
        </Box>

        {/* Empty State Content */}
        <Box style={{ flex: 1, overflowY: 'auto' }} p="md">
          <Center h="100%" style={{ flexDirection: 'column' }}>
            <Stack align="center" gap="lg" maw={800} w="100%">
               <Stack gap={5} align="center">
                 <Title order={3} fw={400}>Owe money? It's good to pay bills on time!</Title>
                 <Text size="sm" c="dimmed" ta="center">If you've purchased something for your business, and you don't have to repay it immediately, then you can record it as a bill.</Text>
               </Stack>
               <Group mt="md" gap="xs" align="center" style={{ flexDirection: 'column' }}>
                 <Button color="blue" size="md" radius="sm" onClick={() => onViewChange?.('new-bill')}>CREATE A BILL</Button>
                 <Text size="sm" c="blue" style={{ cursor: 'pointer' }}>Import Bills</Text>
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
            <Title order={4} fw={600} c="gray.8">All Bills</Title>
            <ChevronDown size={16} color="gray" />
          </Group>
          <Group gap="xs">
            <Button 
              leftSection={<Plus size={16} />} 
              color="blue" 
              size="xs"
              onClick={() => onViewChange?.('new-bill')}
            >
              New
            </Button>
            <ActionIcon variant="default"><MoreHorizontal size={16} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content Split */}
      <Grid gutter={0} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Left List */}
        <Grid.Col span={selectedId ? 4 : 12} style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box p="xs" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <TextInput
              placeholder="Search in Bills"
              leftSection={<Search size={14} />}
              size="xs"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </Box>
          <ScrollArea style={{ flex: 1 }}>
            {bills.map((bill) => (
              <Box
                key={bill.id}
                p="md"
                bg={selectedId === bill.id ? '#f1f3f5' : 'white'}
                style={{ 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setSelectedId(bill.id!)}
              >
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>{bill.supplierName}</Text>
                  <Text size="sm" fw={600}>₹{bill.total.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">{bill.billNumber}</Text>
                    <Text size="xs" c="dimmed">•</Text>
                    <Text size="xs" c="dimmed">{new Date(bill.date).toLocaleDateString()}</Text>
                  </Group>
                </Group>
                <Badge 
                  color={
                    bill.status === 'draft' ? 'gray' : 
                    bill.status === 'open' ? 'blue' : 
                    bill.status === 'paid' ? 'green' : 
                    bill.status === 'partial' ? 'orange' : 'gray'
                  } 
                  variant="light" 
                  size="xs" 
                  mt="sm"
                >
                  {bill.status.toUpperCase()}
                </Badge>
              </Box>
            ))}
          </ScrollArea>
        </Grid.Col>

        {/* Right Details Pane */}
        {selectedId && selectedBill && (
          <Grid.Col span={8} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fa' }}>
            <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
               <Group justify="space-between">
                  <Title order={3} fw={500}>{selectedBill.billNumber}</Title>
                  <Group gap="xs">
                     <Button variant="default" size="xs" leftSection={<Edit size={14} />} onClick={() => onViewChange?.('new-bill', selectedBill.id)}>Edit</Button>
                     <Button variant="default" size="xs" leftSection={<Printer size={14} />} onClick={() => generateDocumentPDF('Bill', selectedBill, 'download')}>PDF/Print</Button>
                     {selectedBill.status === 'draft' && (
                       <Button variant="default" size="xs" onClick={() => handleStatusChange(selectedBill.id!, 'open')}>Convert to Open</Button>
                     )}
                     <Button variant="default" size="xs" leftSection={<CreditCard size={14} />} onClick={() => notifications.show({ title: 'Coming Soon', message: 'Payment module will be integrated soon.', color: 'blue' })}>Record Payment</Button>
                     <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                           <ActionIcon variant="default" size="sm"><MoreHorizontal size={14} /></ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                           <Menu.Item onClick={() => onViewChange?.('new-bill', selectedBill.id)}>Clone</Menu.Item>
                           <Menu.Item color="red" onClick={async () => {
                              if (confirm('Are you sure you want to delete this bill?')) {
                                 await db.purchaseBills.delete(selectedBill.id!);
                                 setSelectedId(null);
                                 notifications.show({ title: 'Deleted', message: 'Bill deleted', color: 'red' });
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
                {selectedBill.status === 'draft' && (
                  <Box bg="white" p="md" style={{ border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <Group justify="space-between">
                      <Group>
                        <Text>✨</Text>
                        <Text size="sm" fw={500}>WHAT'S NEXT?</Text>
                        <Text size="sm">Bill has been created. Convert the bill to the open status to record payment.</Text>
                      </Group>
                      <Button size="xs" color="blue" onClick={() => handleStatusChange(selectedBill.id!, 'open')}>Convert to Open</Button>
                    </Group>
                  </Box>
                )}

                {selectedBill.purchaseOrderId && (
                  <Box bg="white" p="sm" style={{ border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text size="sm" fw={500}>Purchase Orders</Text>
                        <Badge size="xs" circle>1</Badge>
                      </Group>
                      <ActionIcon variant="subtle"><ChevronRight size={14} /></ActionIcon>
                    </Group>
                  </Box>
                )}

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
                          <Title order={3} fw={400} c="gray.8">BILL</Title>
                          <Text size="sm" mt={4}>Bill# <Text component="span" fw={600}>{selectedBill.billNumber}</Text></Text>
                          
                          <Badge 
                            mt="md" 
                            color={selectedBill.status === 'draft' ? 'gray' : 'blue'} 
                            variant="filled" 
                            radius="sm"
                          >
                            {selectedBill.status.toUpperCase()}
                          </Badge>

                          <Grid gutter="xs" mt="xl">
                            <Grid.Col span={4}><Text size="xs" fw={700} c="gray.6">ORDER NUMBER</Text></Grid.Col>
                            <Grid.Col span={8}><Text size="sm">{selectedBill.orderNumber || '-'}</Text></Grid.Col>
                            
                            <Grid.Col span={4} mt="sm"><Text size="xs" fw={700} c="gray.6">BILL DATE</Text></Grid.Col>
                            <Grid.Col span={8} mt="sm"><Text size="sm">{new Date(selectedBill.date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/')}</Text></Grid.Col>
                            
                            <Grid.Col span={4} mt="sm"><Text size="xs" fw={700} c="gray.6">DUE DATE</Text></Grid.Col>
                            <Grid.Col span={8} mt="sm"><Text size="sm">{new Date(selectedBill.dueDate).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/')}</Text></Grid.Col>

                            <Grid.Col span={4} mt="sm"><Text size="xs" fw={700} c="gray.6">PAYMENT TERMS</Text></Grid.Col>
                            <Grid.Col span={8} mt="sm"><Text size="sm">{selectedBill.paymentTerms || 'Due on Receipt'}</Text></Grid.Col>

                            <Grid.Col span={4} mt="sm"><Text size="xs" fw={700} c="gray.6">BALANCE DUE</Text></Grid.Col>
                            <Grid.Col span={8} mt="sm"><Text size="sm" fw={600}>₹{(selectedBill.total - selectedBill.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text></Grid.Col>

                            <Grid.Col span={4} mt="sm"><Text size="xs" fw={700} c="gray.6">TOTAL</Text></Grid.Col>
                            <Grid.Col span={8} mt="sm"><Text size="sm" fw={600}>₹{selectedBill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text></Grid.Col>
                          </Grid>
                        </Grid.Col>
                        
                        <Grid.Col span={5}>
                          <Text size="xs" fw={700} c="gray.6" mb="xs">VENDOR ADDRESS</Text>
                          <Text size="sm" c="blue" fw={500}>{selectedBill.supplierName}</Text>
                          <Text size="sm" mt={4} style={{ whiteSpace: 'pre-line', color: '#4b5563' }}>
                            {formatAddress(selectedVendor, 'billing')}
                          </Text>
                          {selectedVendor?.phone && (
                            <Text size="sm" mt={4} c="dimmed">+{selectedVendor.phone}</Text>
                          )}
                        </Grid.Col>
                      </Grid>

                      <Table mt={rem(40)} verticalSpacing="md" style={{ borderTop: '1px solid #e2e8f0' }}>
                        <Table.Thead bg="#f8f9fa">
                          <Table.Tr>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>ITEMS & DESCRIPTION</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>ACCOUNT</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>QUANTITY</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>RATE</Table.Th>
                            <Table.Th style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>AMOUNT</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {selectedBill.items?.map((item: any, i: number) => (
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
                                <Text size="sm">{getProductAccount(item.productId)}</Text>
                              </Table.Td>
                              <Table.Td ta="right"><Text size="sm">{item.quantity}</Text></Table.Td>
                              <Table.Td ta="right"><Text size="sm">₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text></Table.Td>
                              <Table.Td ta="right"><Text size="sm" fw={500}>₹{(item.quantity * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text></Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>

                      <Box mt="xl" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Box w={300}>
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" c="gray.7">Sub Total</Text>
                            <Text size="sm" fw={600}>₹{selectedBill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                          </Group>
                          <Group justify="space-between" mb="sm">
                            <Text size="sm" c="gray.7">Discount</Text>
                            <Text size="sm" c="gray.6">(-) ₹{(selectedBill.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                          </Group>
                          
                          <Divider mb="sm" />
                          
                          <Group justify="space-between" mb="xs">
                            <Text fw={700}>Total</Text>
                            <Text fw={700}>₹{selectedBill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
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
