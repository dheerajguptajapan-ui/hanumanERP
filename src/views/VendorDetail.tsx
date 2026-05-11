import React, { useState } from 'react';
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  ActionIcon,
  Badge,
  Tabs,
  Paper,
  Grid,
  Stack,
  Divider,
  Menu,
  ScrollArea,
  Table,
  Avatar,
  Timeline,
  Accordion,
  Select,
  Tooltip,
  rem
} from '@mantine/core';
import { 
  Edit, 
  MoreHorizontal, 
  X, 
  ChevronDown, 
  History, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  ExternalLink,
  Paperclip,
  Plus,
  Filter,
  Printer,
  Download,
  Send
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface VendorDetailProps {
  vendorId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
}

export function VendorDetail({ vendorId, onClose, onEdit }: VendorDetailProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('bills');
  
  const vendor = useLiveQuery(() => db.partners.get(vendorId), [vendorId]);
  
  // Data for Transactions Tab
  const bills = useLiveQuery(() => db.purchaseBills.where('supplierId').equals(vendorId).toArray(), [vendorId]);
  const purchaseOrders = useLiveQuery(() => db.purchaseOrders.where('vendorId').equals(vendorId).toArray(), [vendorId]);
  const expenses = useLiveQuery(() => db.expenses.where('vendorId').equals(vendorId).toArray(), [vendorId]);
  
  // For Bill Payments, we need to find payments linked to this vendor's bills
  const billIds = bills?.map(b => b.id).filter(id => id !== undefined) as number[];
  const payments = useLiveQuery(async () => {
    if (!billIds || billIds.length === 0) return [];
    return db.payments.filter(p => p.purchaseBillId !== undefined && billIds.includes(p.purchaseBillId)).toArray();
  }, [billIds]);

  if (!vendor) return null;

  const formatAddress = (prefix: 'billing' | 'shipping') => {
    const lines = [
      vendor[`${prefix}Line1`],
      vendor[`${prefix}Line2`],
      `${vendor[`${prefix}City`]}, ${vendor[`${prefix}State`]} ${vendor[`${prefix}Pincode`]}`,
      vendor[`${prefix}Country`]
    ];
    return lines.filter(Boolean).join('\n');
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/');
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <ArrowLeft size={20} />
            </ActionIcon>
            <Stack gap={0}>
              <Title order={3} fw={500}>{vendor.name}</Title>
            </Stack>
          </Group>
          <Group gap="sm">
            <Button 
              variant="default" 
              size="xs"
              leftSection={<Edit size={14} />} 
              onClick={() => onEdit(vendorId)}
            >
              Edit
            </Button>
            <ActionIcon variant="default" size="sm">
               <Paperclip size={14} />
            </ActionIcon>
            <Menu shadow="md" width={180}>
               <Menu.Target>
                  <Button color="blue" size="xs" rightSection={<ChevronDown size={14} />}>New Transaction</Button>
               </Menu.Target>
               <Menu.Dropdown>
                  <Menu.Item>Bill</Menu.Item>
                  <Menu.Item>Purchase Order</Menu.Item>
                  <Menu.Item>Payment</Menu.Item>
                  <Menu.Item>Vendor Credit</Menu.Item>
               </Menu.Dropdown>
            </Menu>
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <Button variant="default" size="xs" rightSection={<ChevronDown size={14} />}>More</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Mail size={14} />}>Email Vendor</Menu.Item>
                <Menu.Item leftSection={<FileText size={14} />}>Statement</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<X size={14} />}>Delete</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <X size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Tabs */}
      <Tabs defaultValue="overview" styles={{
        root: { display: 'flex', flexDirection: 'column', flex: 1 },
        panel: { flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }
      }}>
        <Box px="md" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <Tabs.List style={{ borderBottom: 'none' }}>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="comments">Comments</Tabs.Tab>
            <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
            <Tabs.Tab value="mails">Mails</Tabs.Tab>
            <Tabs.Tab value="statement">Statement</Tabs.Tab>
          </Tabs.List>
        </Box>

        {/* Overview Tab Content */}
        <Tabs.Panel value="overview" p="xl">
          <Box maw={1200} mx="auto">
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="xl">
                   {/* Vendor Info Section */}
                   <Box>
                      <Text size="xs" fw={700} c="dimmed" mb="md" tt="uppercase">{vendor.name}</Text>
                      <Paper withBorder p="md" radius="sm">
                         <Group gap="lg">
                            <Avatar size="lg" radius="sm"><User size={24} /></Avatar>
                            <Box>
                               <Text size="sm" fw={600}>{vendor.name}</Text>
                               <Text size="xs" c="blue">{vendor.email || 'No email provided'}</Text>
                               <Text size="xs" c="dimmed" mt={4}>{vendor.phone || 'No phone provided'}</Text>
                               <Text size="xs" c="blue" mt={8} style={{ cursor: 'pointer' }}>Invite to Portal</Text>
                            </Box>
                         </Group>
                      </Paper>
                   </Box>

                   {/* Address Section */}
                   <Box>
                      <Group justify="space-between" mb="sm">
                         <Text size="xs" fw={700} c="dimmed" tt="uppercase">ADDRESS</Text>
                         <ActionIcon variant="subtle" size="xs"><ChevronDown size={14} /></ActionIcon>
                      </Group>
                      <Paper withBorder p="md" radius="sm">
                         <Grid>
                            <Grid.Col span={6}>
                               <Stack gap={4}>
                                  <Text size="sm" fw={600}>Billing Address</Text>
                                  <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{formatAddress('billing')}</Text>
                                  <Text size="sm" mt="xs" c="dimmed"><Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Phone: {vendor.phone || '-'}</Text>
                               </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                               <Stack gap={4}>
                                  <Text size="sm" fw={600}>Shipping Address</Text>
                                  <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{formatAddress('shipping')}</Text>
                                  <Text size="sm" mt="xs" c="dimmed"><Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Phone: {vendor.phone || '-'}</Text>
                               </Stack>
                            </Grid.Col>
                         </Grid>
                         <Text size="xs" c="blue" mt="md" style={{ cursor: 'pointer' }}>Add additional address</Text>
                      </Paper>
                   </Box>

                   {/* Other Details */}
                   <Box>
                      <Group justify="space-between" mb="sm">
                         <Text size="xs" fw={700} c="dimmed" tt="uppercase">OTHER DETAILS</Text>
                         <ActionIcon variant="subtle" size="xs"><ChevronDown size={14} /></ActionIcon>
                      </Group>
                      <Paper withBorder p="md" radius="sm">
                         <Grid gutter="sm">
                            <Grid.Col span={4}><Text size="sm" c="dimmed">Payment Terms</Text></Grid.Col>
                            <Grid.Col span={8}><Text size="sm">{vendor.paymentTerms || 'Due on Receipt'}</Text></Grid.Col>
                            
                            <Grid.Col span={4}><Text size="sm" c="dimmed">TDS</Text></Grid.Col>
                            <Grid.Col span={8}><Text size="sm">No TDS</Text></Grid.Col>

                            <Grid.Col span={4}><Text size="sm" c="dimmed">Currency</Text></Grid.Col>
                            <Grid.Col span={8}><Text size="sm">{vendor.currency || 'INR - Indian Rupee'}</Text></Grid.Col>

                            <Grid.Col span={4}><Text size="sm" c="dimmed">GST Treatment</Text></Grid.Col>
                            <Grid.Col span={8}><Text size="sm">Registered Business - Regular</Text></Grid.Col>
                         </Grid>
                      </Paper>
                   </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="xl">
                   {/* Payables Section */}
                   <Box>
                      <Text size="sm" fw={600} mb="xs">Payables</Text>
                      <Paper withBorder p={0} radius="sm">
                         <Table verticalSpacing="sm">
                            <Table.Thead bg="gray.0">
                               <Table.Tr>
                                  <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>CURRENCY</Table.Th>
                                  <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>OUTSTANDING PAYABLES</Table.Th>
                                  <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>UNUSED CREDITS</Table.Th>
                               </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                               <Table.Tr>
                                  <Table.Td><Text size="xs" fw={600}>INR - Indian Rupee</Text></Table.Td>
                                  <Table.Td><Text size="xs" fw={600}>₹{bills?.reduce((acc, b) => acc + (b.total - b.amountPaid), 0).toLocaleString() || 0}</Text></Table.Td>
                                  <Table.Td><Text size="xs" fw={600}>₹0</Text></Table.Td>
                               </Table.Tr>
                            </Table.Tbody>
                            <Table.Tfoot bg="gray.0">
                               <Table.Tr>
                                  <Table.Td><Text size="xs" fw={700}>TOTAL (JPY)</Text></Table.Td>
                                  <Table.Td><Text size="xs" fw={700}>¥0</Text></Table.Td>
                                  <Table.Td><Text size="xs" fw={700}>¥0</Text></Table.Td>
                               </Table.Tr>
                            </Table.Tfoot>
                         </Table>
                      </Paper>
                   </Box>

                   {/* Activity Timeline */}
                   <Box>
                      <Group gap="xs" mb="md">
                         <Text size="sm" c="red" fw={600}>Items to be received: {purchaseOrders?.filter(po => po.status !== 'received' && po.status !== 'billed').length.toFixed(2) || '0.00'}</Text>
                         <Text size="sm" c="red" fw={600}>Total items ordered: {purchaseOrders?.length.toFixed(2) || '0.00'}</Text>
                      </Group>
                      
                      <Timeline bulletSize={20} lineWidth={2} color="blue">
                         {bills?.slice(0, 3).map((bill, idx) => (
                           <Timeline.Item 
                              key={idx}
                              bullet={<Box h={8} w={8} bg="blue" style={{ borderRadius: '50%' }} />} 
                              title={<Group justify="space-between"><Text size="sm" fw={600}>Bill added</Text><Text size="xs" c="dimmed">{formatDate(bill.date)}</Text></Group>}
                           >
                              <Text size="xs" mt={4}>Bill {bill.billNumber} of amount ₹{bill.total.toLocaleString()} created.</Text>
                              <Group gap={4} mt={4}>
                                 <Text size="xs" c="dimmed">by System - </Text>
                                 <Text size="xs" c="blue" style={{ cursor: 'pointer' }}>View Details</Text>
                              </Group>
                           </Timeline.Item>
                         ))}
                         {bills?.length === 0 && (
                            <Text size="xs" c="dimmed">No recent activity found.</Text>
                         )}
                      </Timeline>
                   </Box>
                </Stack>
              </Grid.Col>
            </Grid>
          </Box>
        </Tabs.Panel>
        
        {/* Transactions Tab Content */}
        <Tabs.Panel value="transactions" p="md">
          <Box maw={1200} mx="auto">
            <Group justify="flex-start" mb="md">
               <Group gap="xs" style={{ cursor: 'pointer' }}>
                  <Text size="sm" fw={500} c="blue">Go to transactions</Text>
                  <ChevronDown size={14} color="#228be6" />
               </Group>
            </Group>

            <Accordion defaultValue="bills" styles={{
              item: { border: 'none', backgroundColor: 'transparent', marginBottom: '16px' },
              control: { padding: '8px 16px', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: 'white' },
              content: { padding: '0', marginTop: '4px' },
              label: { fontSize: '14px', fontWeight: 600 }
            }}>
              {/* Bills Section */}
              <Accordion.Item value="bills">
                <Accordion.Control>
                  <Group justify="space-between" w="100%" pr="md">
                    <Group gap="xs">
                      <Text>Bills</Text>
                    </Group>
                    <Group gap="md">
                      <ActionIcon variant="subtle" size="xs" color="gray"><Filter size={14} /></ActionIcon>
                      <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} color="blue">New</Button>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Paper withBorder radius="sm" style={{ overflow: 'hidden' }}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead bg="#f8f9fa">
                        <Table.Tr>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>DATE</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>BILL#</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>ORDER NUMBER</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>VENDOR NAME</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }} ta="right">AMOUNT</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }} ta="right">BALANCE DUE</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>STATUS</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {bills?.map(bill => (
                          <Table.Tr key={bill.id}>
                            <Table.Td><Text size="xs">{formatDate(bill.date)}</Text></Table.Td>
                            <Table.Td><Text size="xs" c="blue" style={{ cursor: 'pointer' }}>{bill.billNumber}</Text></Table.Td>
                            <Table.Td><Text size="xs">{bill.orderNumber || '-'}</Text></Table.Td>
                            <Table.Td><Stack gap={0}><Text size="xs">{vendor.name}</Text></Stack></Table.Td>
                            <Table.Td ta="right"><Text size="xs" fw={600}>₹{bill.total.toLocaleString()}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs" fw={600}>₹{(bill.total - bill.amountPaid).toLocaleString()}</Text></Table.Td>
                            <Table.Td><Badge size="xs" variant="light" color={bill.status === 'paid' ? 'green' : 'gray'}>{bill.status.toUpperCase()}</Badge></Table.Td>
                          </Table.Tr>
                        ))}
                        {(!bills || bills.length === 0) && (
                          <Table.Tr><Table.Td colSpan={7} ta="center"><Text size="xs" c="dimmed">No bills found.</Text></Table.Td></Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Bill Payments Section */}
              <Accordion.Item value="bill-payments">
                <Accordion.Control>
                  <Group justify="space-between" w="100%" pr="md">
                    <Group gap="xs">
                      <Text>Bill Payments</Text>
                    </Group>
                    <Group gap="md">
                      <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} color="blue">New</Button>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Paper withBorder radius="sm" style={{ overflow: 'hidden' }}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead bg="#f8f9fa">
                        <Table.Tr>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>DATE</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>PAYMENT NUMBER</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>REFERENCE NUM...</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>PAYMENT MODE</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }} ta="right">AMOUNT PAID</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }} ta="right">UNUSED AMOUNT</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>STATUS</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {payments?.map(payment => (
                          <Table.Tr key={payment.id}>
                            <Table.Td><Text size="xs">{formatDate(payment.date)}</Text></Table.Td>
                            <Table.Td><Text size="xs" c="blue" style={{ cursor: 'pointer' }}>{payment.paymentNumber}</Text></Table.Td>
                            <Table.Td><Text size="xs">{payment.reference || '-'}</Text></Table.Td>
                            <Table.Td><Text size="xs">{payment.paymentMode}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs" fw={600}>₹{payment.amount.toLocaleString()}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">₹0</Text></Table.Td>
                            <Table.Td><Badge size="xs" variant="light" color="green">{payment.status.toUpperCase()}</Badge></Table.Td>
                          </Table.Tr>
                        ))}
                        {(!payments || payments.length === 0) && (
                          <Table.Tr>
                            <Table.Td colSpan={7} ta="center" py="xl">
                               <Stack gap={5} align="center">
                                  <Text size="xs" c="dimmed">No Payments Made yet.</Text>
                                  <Button variant="subtle" size="xs" color="blue">- Add New</Button>
                               </Stack>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Expenses Section */}
              <Accordion.Item value="expenses">
                <Accordion.Control>
                  <Group justify="space-between" w="100%" pr="md">
                    <Group gap="xs">
                      <Text>Expenses</Text>
                    </Group>
                    <Group gap="md">
                      <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} color="blue">New</Button>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                   <Paper withBorder radius="sm" style={{ overflow: 'hidden' }}>
                      <Table verticalSpacing="sm">
                         <Table.Tbody>
                            {expenses?.map(exp => (
                               <Table.Tr key={exp.id}>
                                  <Table.Td><Text size="xs">{formatDate(exp.date)}</Text></Table.Td>
                                  <Table.Td><Text size="xs">{exp.category}</Text></Table.Td>
                                  <Table.Td ta="right"><Text size="xs" fw={600}>₹{exp.amount.toLocaleString()}</Text></Table.Td>
                               </Table.Tr>
                            ))}
                            {(!expenses || expenses.length === 0) && (
                               <Table.Tr><Table.Td ta="center" py="md"><Text size="xs" c="dimmed">No expenses found.</Text></Table.Td></Table.Tr>
                            )}
                         </Table.Tbody>
                      </Table>
                   </Paper>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Purchase Orders Section */}
              <Accordion.Item value="purchase-orders">
                <Accordion.Control>
                  <Group justify="space-between" w="100%" pr="md">
                    <Group gap="xs">
                      <Text>Purchase Orders</Text>
                    </Group>
                    <Group gap="md">
                      <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} color="blue">New</Button>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Paper withBorder radius="sm" style={{ overflow: 'hidden' }}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead bg="#f8f9fa">
                        <Table.Tr>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>DATE</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>PO#</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>REFERENCE</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }} ta="right">AMOUNT</Table.Th>
                          <Table.Th style={{ fontSize: '10px', color: '#64748b' }}>STATUS</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {purchaseOrders?.map(po => (
                          <Table.Tr key={po.id}>
                            <Table.Td><Text size="xs">{formatDate(po.date)}</Text></Table.Td>
                            <Table.Td><Text size="xs" c="blue" style={{ cursor: 'pointer' }}>{po.purchaseOrderNumber}</Text></Table.Td>
                            <Table.Td><Text size="xs">{po.reference || '-'}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs" fw={600}>₹{po.total.toLocaleString()}</Text></Table.Td>
                            <Table.Td><Badge size="xs" variant="light" color={po.status === 'billed' ? 'green' : 'blue'}>{po.status.toUpperCase()}</Badge></Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Box>
        </Tabs.Panel>

        {/* Statement Tab Content */}
        <Tabs.Panel value="statement" p="md">
          <Box maw={1000} mx="auto">
            {/* Statement Filter Toolbar */}
            <Group justify="space-between" mb="xl">
               <Group gap="xs">
                  <Select 
                    size="xs"
                    w={150}
                    data={['This Month', 'Last Month', 'This Quarter', 'This Year']}
                    defaultValue="This Month"
                    leftSection={<History size={14} />}
                  />
                  <Select 
                    size="xs"
                    w={150}
                    data={['Filter By: All', 'Billed', 'Unbilled']}
                    defaultValue="Filter By: All"
                    leftSection={<Filter size={14} />}
                  />
               </Group>
               <Group gap="xs">
                  <ActionIcon variant="default"><Printer size={16} /></ActionIcon>
                  <ActionIcon variant="default"><Download size={16} /></ActionIcon>
                  <ActionIcon variant="default"><FileText size={16} /></ActionIcon>
                  <Button size="xs" color="blue" leftSection={<Send size={14} />}>Send Email</Button>
               </Group>
            </Group>

            {/* Statement Document */}
            <Paper shadow="sm" radius="md" p={rem(50)} bg="white" style={{ border: '1px solid #e2e8f0' }}>
               <Stack gap="xl" align="center">
                  <Stack gap={5} align="center">
                     <Title order={4} fw={500}>Vendor Statement For {vendor.name}</Title>
                     <Text size="sm" c="dimmed">From 2026/05/01 To 2026/05/31</Text>
                  </Stack>

                  <Grid w="100%" mt="xl">
                     <Grid.Col span={6}>
                        <Stack gap={4}>
                           <Text size="sm" fw={700} c="blue">{vendor.name}</Text>
                           <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{formatAddress('billing')}</Text>
                        </Stack>
                     </Grid.Col>
                     <Grid.Col span={6}>
                        <Stack gap={4} align="flex-end">
                           <Title order={5} fw={600}>jhakkasdheeraj</Title>
                           <Text size="sm">Japan</Text>
                        </Stack>
                     </Grid.Col>
                  </Grid>

                  <Box w="100%" mt="xl">
                     <Title order={4} ta="right" mb="xl" style={{ borderBottom: '2px solid #000', display: 'inline-block', float: 'right' }}>Statement of Accounts</Title>
                     <Box style={{ clear: 'both' }} />
                     <Text ta="right" size="sm" mb="xl">2026/05/01 To 2026/05/31</Text>
                     
                     <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Paper withBorder p="md" radius="sm" bg="gray.0" w={300}>
                           <Stack gap="xs">
                              <Title order={6} tt="uppercase" c="dimmed">Account Summary</Title>
                              <Group justify="space-between">
                                 <Text size="sm">Opening Balance</Text>
                                 <Text size="sm">₹0.00</Text>
                              </Group>
                              <Group justify="space-between">
                                 <Text size="sm">Billed Amount</Text>
                                 <Text size="sm">₹{bills?.reduce((acc, b) => acc + b.total, 0).toLocaleString() || '0.00'}</Text>
                              </Group>
                              <Group justify="space-between">
                                 <Text size="sm">Amount Paid</Text>
                                 <Text size="sm">₹{bills?.reduce((acc, b) => acc + b.amountPaid, 0).toLocaleString() || '0.00'}</Text>
                              </Group>
                              <Divider />
                              <Group justify="space-between">
                                 <Text size="sm" fw={700}>Balance Due</Text>
                                 <Text size="sm" fw={700}>₹{bills?.reduce((acc, b) => acc + (b.total - b.amountPaid), 0).toLocaleString() || '0.00'}</Text>
                              </Group>
                           </Stack>
                        </Paper>
                     </Box>
                  </Box>

                  <Table mt="xl" verticalSpacing="md">
                     <Table.Thead bg="#f8f9fa">
                        <Table.Tr>
                           <Table.Th style={{ fontSize: '12px' }}>DATE</Table.Th>
                           <Table.Th style={{ fontSize: '12px' }}>TRANSACTIONS</Table.Th>
                           <Table.Th style={{ fontSize: '12px' }} ta="right">DETAILS</Table.Th>
                           <Table.Th style={{ fontSize: '12px' }} ta="right">AMOUNT</Table.Th>
                           <Table.Th style={{ fontSize: '12px' }} ta="right">PAYMENTS</Table.Th>
                           <Table.Th style={{ fontSize: '12px' }} ta="right">BALANCE</Table.Th>
                        </Table.Tr>
                     </Table.Thead>
                     <Table.Tbody>
                        {bills?.map(bill => (
                           <Table.Tr key={bill.id}>
                              <Table.Td><Text size="sm">{formatDate(bill.date)}</Text></Table.Td>
                              <Table.Td>
                                 <Stack gap={0}>
                                    <Text size="sm" fw={500}>Bill</Text>
                                    <Text size="xs" c="dimmed">{bill.billNumber}</Text>
                                 </Stack>
                              </Table.Td>
                              <Table.Td ta="right"><Text size="sm">{bill.items?.length} items</Text></Table.Td>
                              <Table.Td ta="right"><Text size="sm">₹{bill.total.toLocaleString()}</Text></Table.Td>
                              <Table.Td ta="right"><Text size="sm">₹{bill.amountPaid.toLocaleString()}</Text></Table.Td>
                              <Table.Td ta="right"><Text size="sm">₹{(bill.total - bill.amountPaid).toLocaleString()}</Text></Table.Td>
                           </Table.Tr>
                        ))}
                        {(!bills || bills.length === 0) && (
                           <Table.Tr><Table.Td colSpan={6} ta="center"><Text size="sm" c="dimmed">No transactions in this period.</Text></Table.Td></Table.Tr>
                        )}
                     </Table.Tbody>
                  </Table>
               </Stack>
            </Paper>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="comments" p="xl">
           <Stack gap="md" align="center" mt="xl">
              <History size={48} color="#adb5bd" />
              <Text c="dimmed">No comments yet.</Text>
           </Stack>
        </Tabs.Panel>
        
        <Tabs.Panel value="mails" p="xl">
           <Stack gap="md" align="center" mt="xl">
              <Mail size={48} color="#adb5bd" />
              <Text c="dimmed">No mails sent to this vendor yet.</Text>
           </Stack>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
