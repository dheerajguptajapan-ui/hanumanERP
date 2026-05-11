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
  Center,
  UnstyledButton,
  ScrollArea,
  SimpleGrid,
  Avatar,
  Divider
} from '@mantine/core';
import { Plus, Search, MoreVertical, Edit, Trash, User, Download, CheckCircle, ChevronDown, X, List, LayoutGrid, MoreHorizontal } from 'lucide-react';
import { db } from '../db';
import { usePartners } from '../hooks/usePartners';
import { notifications } from '@mantine/notifications';
import { CustomerDetail } from './CustomerDetail';

export function Customers({ onViewChange }: { onViewChange?: (view: string, id?: number, clone?: boolean) => void }) {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const partners = usePartners('customer', search);

  const hasCustomers = partners && partners.length > 0;

  const renderListView = () => (
    <Box p="xl">
      <Paper withBorder radius="md" bg="white">
        <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <TextInput
            placeholder="Search customers..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            variant="filled"
            w={300}
          />
        </Box>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead bg="#f8f9fa">
            <Table.Tr>
              <Table.Th>NAME</Table.Th>
              <Table.Th>COMPANY NAME</Table.Th>
              <Table.Th>EMAIL</Table.Th>
              <Table.Th>WORK PHONE</Table.Th>
              <Table.Th>RECEIVABLES</Table.Th>
              <Table.Th>UNUSED CREDITS</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {partners?.map((customer) => (
              <Table.Tr 
                key={customer.id} 
                onClick={() => setSelectedCustomerId(customer.id || null)} 
                style={{ cursor: 'pointer' }}
              >
                <Table.Td>
                  <Group gap="sm">
                    <Avatar color="blue" radius="xl" size="sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="sm" fw={500} c="blue">{customer.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td><Text size="sm">{customer.companyName || '-'}</Text></Table.Td>
                <Table.Td><Text size="sm">{customer.email || '-'}</Text></Table.Td>
                <Table.Td><Text size="sm">{customer.phone || '-'}</Text></Table.Td>
                <Table.Td><Text size="sm">₹ 0.00</Text></Table.Td>
                <Table.Td><Text size="sm">₹ 0.00</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );

  const renderGridView = () => (
    <Box p="xl">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
        {partners?.map((c) => (
          <Paper 
            key={c.id} 
            withBorder 
            p="xl" 
            radius="md" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onClick={() => setSelectedCustomerId(c.id || null)}
          >
            <Stack align="center" gap="md">
              <Avatar size={80} color="blue" radius="xl">
                {c.name.charAt(0).toUpperCase()}
              </Avatar>
              <Stack gap={2} align="center">
                <Text fw={600} ta="center">{c.name}</Text>
                <Text size="xs" c="dimmed" ta="center">{c.companyName || 'Individual'}</Text>
              </Stack>
              <Divider w="100%" />
              <Group justify="space-between" w="100%">
                <Box>
                  <Text size="xs" c="dimmed">Receivables</Text>
                  <Text fw={600} size="sm">₹ 0.00</Text>
                </Box>
                <Box style={{ textAlign: 'right' }}>
                  <Text size="xs" c="dimmed">Credits</Text>
                  <Text fw={600} size="sm">₹ 0.00</Text>
                </Box>
              </Group>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Box>
  );

  const renderSplitView = () => (
    <Box h="100%" style={{ display: 'flex' }}>
      <Box style={{ width: 350, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }} bg="white">
        <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between" mb="md">
            <Title order={5}>All Customers</Title>
            <ActionIcon variant="subtle" color="gray" onClick={() => setSelectedCustomerId(null)}><X size={16} /></ActionIcon>
          </Group>
          <TextInput
            placeholder="Search..."
            leftSection={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="xs"
          />
        </Box>
        <ScrollArea style={{ flex: 1 }}>
          {partners?.map((c) => (
            <UnstyledButton
              key={c.id}
              onClick={() => setSelectedCustomerId(c.id || null)}
              p="md"
              style={{
                width: '100%',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: selectedCustomerId === c.id ? '#f0f7ff' : 'transparent'
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500} truncate>{c.name}</Text>
                  <Text size="xs" c="dimmed" truncate>{c.companyName || 'No Company'}</Text>
                </Box>
                <Text size="xs" fw={500}>₹ 0.00</Text>
              </Group>
            </UnstyledButton>
          ))}
        </ScrollArea>
      </Box>

      <Box style={{ flex: 1 }} bg="#f8f9fa">
        {selectedCustomerId && (
          <CustomerDetail 
            customerId={selectedCustomerId} 
            onClose={() => setSelectedCustomerId(null)}
            onEdit={(id) => onViewChange?.('new-customer', id)}
          />
        )}
      </Box>
    </Box>
  );

  if (selectedCustomerId) return renderSplitView();

  return (
    <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Title order={4} fw={600}>All Customers</Title>
                    <ChevronDown size={16} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item>All Customers</Menu.Item>
                <Menu.Item>Active Customers</Menu.Item>
                <Menu.Item>Inactive Customers</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Group>
            {!hasCustomers ? null : (
              <Group gap={0} bg="gray.1" style={{ borderRadius: '4px', padding: '2px' }}>
                <ActionIcon 
                  variant={viewMode === 'list' ? 'white' : 'transparent'} 
                  color={viewMode === 'list' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('list')}
                  size="md"
                >
                  <List size={18} />
                </ActionIcon>
                <ActionIcon 
                  variant={viewMode === 'grid' ? 'white' : 'transparent'} 
                  color={viewMode === 'grid' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('grid')}
                  size="md"
                >
                  <LayoutGrid size={18} />
                </ActionIcon>
              </Group>
            )}

            <Button 
              color="blue" 
              leftSection={<Plus size={16} />} 
              radius="md"
              onClick={() => onViewChange?.('new-customer')}
            >
              New
            </Button>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="outline" color="gray" radius="md" size="lg">
                  <MoreHorizontal size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Actions</Menu.Label>
                <Menu.Item leftSection={<Download size={14} />}>Import Customers</Menu.Item>
                <Menu.Item leftSection={<Plus size={14} />}>Export Customers</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<Plus size={14} />}>Refresh List</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflowY: 'auto' }}>
        {!hasCustomers ? (
          <Center h="100%">
            <Stack align="center" gap="xl" maw={600}>
              <Box style={{ position: 'relative' }}>
                <Box bg="blue.0" p="xl" style={{ borderRadius: '50%', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={60} color="#3b82f6" />
                </Box>
                <Box bg="blue" p="4px" style={{ position: 'absolute', bottom: 10, right: 10, borderRadius: '50%', border: '4px solid white' }}>
                  <Plus size={16} color="white" />
                </Box>
              </Box>

              <Stack align="center" gap={5}>
                <Title order={3} fw={500}>Every sales starts with a customer</Title>
                <Text c="dimmed" size="sm" ta="center">
                  Create and manage your customers and their contact persons, all in one place.
                </Text>
              </Stack>

              <Group>
                <Button color="blue" onClick={() => onViewChange?.('new-customer')}>Create New Customer</Button>
                <Button variant="outline" color="gray" leftSection={<Download size={16} />}>Import File</Button>
              </Group>

              <Box mt="xl" style={{ width: '100%' }}>
                <Paper withBorder p="xl" radius="md" bg="white">
                  <Stack gap="md">
                    <Text fw={600} size="sm">Key Benefits</Text>
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <Group gap="xs">
                        <CheckCircle size={14} color="#10b981" />
                        <Text size="xs">Stay connected with multiple contact persons</Text>
                      </Group>
                      <Group gap="xs">
                        <CheckCircle size={14} color="#10b981" />
                        <Text size="xs">Provide portal access to customers</Text>
                      </Group>
                      <Group gap="xs">
                        <CheckCircle size={14} color="#10b981" />
                        <Text size="xs">Handle multiple addresses effortlessly</Text>
                      </Group>
                      <Group gap="xs">
                        <CheckCircle size={14} color="#10b981" />
                        <Text size="xs">Create multi-currency transactions</Text>
                      </Group>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Center>
        ) : (
          viewMode === 'list' ? renderListView() : renderGridView()
        )}
      </Box>
    </Box>
  );
}
