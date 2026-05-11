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
  Divider,
  rem,
  Center,
  ScrollArea,
  UnstyledButton,
  Avatar
} from '@mantine/core';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Truck, 
  ChevronDown, 
  Filter, 
  List, 
  MoreHorizontal,
  Download,
  Settings,
  Mail,
  Phone,
  X,
  LayoutGrid
} from 'lucide-react';
import { db } from '../db';
import { usePartners } from '../hooks/usePartners';
import { notifications } from '@mantine/notifications';
import { VendorDetail } from './VendorDetail';

interface VendorsProps {
  onViewChange?: (view: string, id?: number) => void;
}

export function Vendors({ onViewChange }: VendorsProps) {
  const [search, setSearch] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const partners = usePartners('vendor', search);

  const hasVendors = partners && partners.length > 0;

  const renderListView = () => (
    <Box p="md">
      <Paper withBorder radius="md" bg="white">
        <Table verticalSpacing="md" highlightOnHover>
          <Table.Thead bg="#f8f9fa">
            <Table.Tr>
              <Table.Th style={{ width: 40 }}><TextInput type="checkbox" size="xs" /></Table.Th>
              <Table.Th>VENDOR NAME</Table.Th>
              <Table.Th>COMPANY NAME</Table.Th>
              <Table.Th>EMAIL</Table.Th>
              <Table.Th>WORK PHONE</Table.Th>
              <Table.Th ta="right">PAYABLES</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {partners?.map((vendor: any) => (
              <Table.Tr 
                key={vendor.id} 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedVendorId(vendor.id || null)}
              >
                <Table.Td><TextInput type="checkbox" size="xs" /></Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600} c="blue">{vendor.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{vendor.companyName || '-'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{vendor.email || '-'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{vendor.phone || '-'}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={600}>₹0.00</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );

  const renderSplitView = () => (
    <Box h="100%" style={{ display: 'flex' }}>
      <Box style={{ width: 350, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }} bg="white">
        <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between" mb="md">
            <Title order={5}>All Vendors</Title>
            <ActionIcon variant="subtle" color="gray" onClick={() => setSelectedVendorId(null)}><X size={16} /></ActionIcon>
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
          {partners?.map((v) => (
            <UnstyledButton
              key={v.id}
              onClick={() => setSelectedVendorId(v.id || null)}
              p="md"
              style={{
                width: '100%',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: selectedVendorId === v.id ? '#f0f7ff' : 'transparent'
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500} truncate>{v.name}</Text>
                  <Text size="xs" c="dimmed" truncate>{v.companyName || 'No Company'}</Text>
                </Box>
                <Text size="xs" fw={500}>₹ 0.00</Text>
              </Group>
            </UnstyledButton>
          ))}
        </ScrollArea>
      </Box>

      <Box style={{ flex: 1 }} bg="#f8f9fa">
        {selectedVendorId && (
          <VendorDetail 
            vendorId={selectedVendorId} 
            onClose={() => setSelectedVendorId(null)}
            onEdit={(id) => onViewChange?.('new-vendor', id)}
          />
        )}
      </Box>
    </Box>
  );

  if (selectedVendorId) return renderSplitView();

  return (
    <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="xs">
            <Group gap={4} style={{ cursor: 'pointer' }}>
              <Title order={4} fw={600}>All Vendors</Title>
              <ChevronDown size={16} />
            </Group>
          </Group>
          <Group gap="xs">
            <Button 
              leftSection={<Plus size={16} />} 
              color="blue" 
              size="sm"
              onClick={() => onViewChange?.('new-vendor')}
            >
              New
            </Button>
            <ActionIcon variant="subtle" color="gray"><Settings size={18} /></ActionIcon>
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={18} /></ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                 <Menu.Item leftSection={<Download size={14} />}>Import Vendors</Menu.Item>
                 <Menu.Item leftSection={<Download size={14} />} style={{ transform: 'rotate(180deg)' }}>Export Vendors</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      {/* Toolbar */}
      <Box p="xs" px="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between">
            <Group gap="xs">
               <TextInput 
                  placeholder="Search in Vendors (/)" 
                  size="xs" 
                  w={250}
                  leftSection={<Search size={14} />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
               />
               <ActionIcon variant="subtle" color="gray"><Filter size={16} /></ActionIcon>
            </Group>
            <Group gap="xs">
               <ActionIcon variant="subtle" color="gray"><List size={16} /></ActionIcon>
            </Group>
         </Group>
      </Box>

      {/* Main Content Area */}
      <Box style={{ flex: 1, overflowY: 'auto' }}>
        {!hasVendors ? (
          <Center h="100%" style={{ flexDirection: 'column' }} p="md">
            <Stack align="center" gap="lg" maw={500}>
               <Box 
                style={{ 
                  width: 120, 
                  height: 120, 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}
               >
                 <Truck size={48} color="#adb5bd" />
                 <ActionIcon 
                  color="blue" 
                  variant="filled" 
                  size="lg" 
                  radius="xl"
                  style={{ position: 'absolute', bottom: 5, right: 5, border: '4px solid #f8f9fa' }}
                 >
                   <Plus size={20} />
                 </ActionIcon>
               </Box>
               <Stack gap={5} align="center">
                 <Title order={3} fw={600}>Every purchase starts with a vendor</Title>
                 <Text c="dimmed" ta="center">Create and manage your vendors and their contact persons, all in one place.</Text>
               </Stack>
               <Group>
                 <Button color="blue" radius="md" onClick={() => onViewChange?.('new-vendor')}>Create New Vendor</Button>
                 <Button variant="outline" color="gray" radius="md">Import File</Button>
               </Group>
            </Stack>
          </Center>
        ) : (
          renderListView()
        )}
      </Box>
    </Box>
  );
}
