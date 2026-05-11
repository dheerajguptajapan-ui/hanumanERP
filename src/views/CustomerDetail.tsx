import React from 'react';
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
  Avatar
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
  User
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, BusinessPartner } from '../db';

interface CustomerDetailProps {
  customerId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
}

export function CustomerDetail({ customerId, onClose, onEdit }: CustomerDetailProps) {
  const customer = useLiveQuery(() => db.partners.get(customerId), [customerId]);

  if (!customer) return null;

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <ArrowLeft size={20} />
            </ActionIcon>
            <Avatar color="blue" radius="xl" size="lg">
              {customer.name.charAt(0).toUpperCase()}
            </Avatar>
            <Stack gap={0}>
              <Title order={3} fw={500}>{customer.name}</Title>
              <Text size="sm" c="dimmed">{customer.companyName || 'Individual'}</Text>
            </Stack>
          </Group>
          <Group gap="sm">
            <Button 
              variant="default" 
              leftSection={<Edit size={16} />} 
              onClick={() => onEdit(customerId)}
            >
              Edit
            </Button>
            <Button color="blue">New Transaction</Button>
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <Button variant="default" rightSection={<ChevronDown size={16} />}>More</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Mail size={14} />}>Email Customer</Menu.Item>
                <Menu.Item leftSection={<FileText size={14} />}>Statement</Menu.Item>
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
        <Box px="md" style={{ backgroundColor: 'white' }}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
            <Tabs.Tab value="address">Address</Tabs.Tab>
            <Tabs.Tab value="contact_persons">Contact Persons</Tabs.Tab>
            <Tabs.Tab value="comments">Comments</Tabs.Tab>
          </Tabs.List>
        </Box>

        <Tabs.Panel value="overview" p="xl">
          <Box maw={1200} mx="auto">
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="xl">
                  {/* Customer Details */}
                  <Paper withBorder p="xl" radius="md">
                    <Title order={5} mb="lg">Customer Details</Title>
                    <Grid>
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Customer Type</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{customer.customerType}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Email Address</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm" c="blue">{customer.email || '-'}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Phone Number</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{customer.phone || '-'}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Currency</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{customer.currency || 'INR'}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Payment Terms</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{customer.paymentTerms || 'Net 30'}</Text></Grid.Col>
                    </Grid>
                  </Paper>

                  {/* Financials Summary */}
                  <Paper withBorder p="xl" radius="md" bg="blue.0" style={{ borderColor: '#a5d8ff' }}>
                    <Group justify="space-between">
                      <Box>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Receivables</Text>
                        <Title order={3} c="blue">₹0.00</Title>
                      </Box>
                      <Divider orientation="vertical" />
                      <Box>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Unused Credits</Text>
                        <Title order={3} c="gray">₹0.00</Title>
                      </Box>
                    </Group>
                  </Paper>

                  {/* Attachments */}
                  <Box>
                    <Title order={5} mb="md" fw={600}>Attachments</Title>
                    {(customer as any).attachments && (customer as any).attachments.length > 0 ? (
                      <Stack gap="xs">
                        {(customer as any).attachments.map((file: any, idx: number) => (
                          <Group key={idx} justify="space-between" bg="#f8f9fa" p="xs" style={{ borderRadius: '4px' }}>
                            <Group gap="xs">
                              <FileText size={16} color="#64748b" />
                              <Text size="sm">{file.name}</Text>
                            </Group>
                            <Button 
                              variant="subtle" 
                              size="xs" 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.base64;
                                link.download = file.name;
                                link.click();
                              }}
                            >
                              Download
                            </Button>
                          </Group>
                        ))}
                      </Stack>
                    ) : (
                      <Text size="xs" c="dimmed">No attachments uploaded for this customer.</Text>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="lg">
                  {/* Primary Contact Person */}
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" fw={700} c="dimmed" mb="md" tt="uppercase">Primary Contact</Text>
                    <Group>
                      <Avatar radius="xl" color="blue"><User size={18} /></Avatar>
                      <Box>
                        <Text size="sm" fw={600}>{customer.name}</Text>
                        <Text size="xs" c="dimmed">{customer.email}</Text>
                      </Box>
                    </Group>
                  </Paper>

                  {/* Billing Address */}
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" fw={700} c="dimmed" mb="md" tt="uppercase">Billing Address</Text>
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>{customer.billingAttention || customer.name}</Text>
                      <Text size="sm">{customer.billingLine1}</Text>
                      {customer.billingLine2 && <Text size="sm">{customer.billingLine2}</Text>}
                      <Text size="sm">{customer.billingCity}, {customer.billingState} {customer.billingPincode}</Text>
                      <Text size="sm">{customer.billingCountry}</Text>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="address" p="xl">
          <Box maw={1200} mx="auto">
            <Grid gutter="xl">
              <Grid.Col span={6}>
                <Paper withBorder p="xl" radius="md">
                  <Title order={5} mb="lg">Billing Address</Title>
                  <Stack gap={4}>
                    <Text size="sm" fw={600}>{customer.billingAttention || customer.name}</Text>
                    <Text size="sm">{customer.billingLine1}</Text>
                    <Text size="sm">{customer.billingLine2}</Text>
                    <Text size="sm">{customer.billingCity}, {customer.billingState} {customer.billingPincode}</Text>
                    <Text size="sm">{customer.billingCountry}</Text>
                    {customer.billingPhone && <Text size="sm" mt="md"><Phone size={14} style={{ marginRight: 8 }} /> {customer.billingPhone}</Text>}
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper withBorder p="xl" radius="md">
                  <Title order={5} mb="lg">Shipping Address</Title>
                  <Stack gap={4}>
                    <Text size="sm" fw={600}>{customer.shippingAttention || customer.name}</Text>
                    <Text size="sm">{customer.shippingLine1}</Text>
                    <Text size="sm">{customer.shippingLine2}</Text>
                    <Text size="sm">{customer.shippingCity}, {customer.shippingState} {customer.shippingPincode}</Text>
                    <Text size="sm">{customer.shippingCountry}</Text>
                    {customer.shippingPhone && <Text size="sm" mt="md"><Phone size={14} style={{ marginRight: 8 }} /> {customer.shippingPhone}</Text>}
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="contact_persons" p="xl">
          <Box maw={1200} mx="auto">
            <Paper withBorder radius="md">
              <Table verticalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>NAME</Table.Th>
                    <Table.Th>EMAIL ADDRESS</Table.Th>
                    <Table.Th>WORK PHONE</Table.Th>
                    <Table.Th>MOBILE</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {customer.contactPersons?.map((cp, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>
                        <Text size="sm" fw={500}>{cp.salutation} {cp.firstName} {cp.lastName}</Text>
                      </Table.Td>
                      <Table.Td><Text size="sm">{cp.email}</Text></Table.Td>
                      <Table.Td><Text size="sm">{cp.workPhone}</Text></Table.Td>
                      <Table.Td><Text size="sm">{cp.mobile}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                  {(!customer.contactPersons || customer.contactPersons.length === 0) && (
                    <Table.Tr>
                      <Table.Td colSpan={4} align="center"><Text size="sm" c="dimmed">No additional contact persons found.</Text></Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="transactions" p="xl">
          <Text c="dimmed" ta="center">No transactions found for this customer.</Text>
        </Tabs.Panel>
        
        <Tabs.Panel value="comments" p="xl">
          <Text c="dimmed" ta="center">No comments found.</Text>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
