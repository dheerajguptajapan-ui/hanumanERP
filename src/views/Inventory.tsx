import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Button, 
  TextInput, 
  NumberInput,
  Modal,
  Stack,
  ActionIcon,
  Text,
  Badge,
  Menu,
  Select,
  Autocomplete,
  Box,
  Divider,
  UnstyledButton,
  SimpleGrid,
  ScrollArea,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { Plus, Search, MoreVertical, Edit, Trash, AlertCircle, ChevronDown, Settings, Filter, List, Package, MoreHorizontal, X, Download, History as HistoryIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useProducts } from '../hooks/useProducts';
import { notifications } from '@mantine/notifications';
import { ItemDetail } from './ItemDetail';
import { usePermissions } from '../hooks/usePermissions';

const UNIT_TYPES = [
  { label: 'Pieces (pcs)', value: 'pcs' },
  { label: 'Kilograms (kg)', value: 'kg' },
  { label: 'Meters (mtr)', value: 'mtr' },
  { label: 'Feet (ft)', value: 'ft' },
  { label: 'Square Feet (sqft)', value: 'sqft' },
  { label: 'Bags (bag)', value: 'bag' },
  { label: 'Boxes (box)', value: 'box' },
  { label: 'Sets (set)', value: 'set' },
  { label: 'Dozen (doz)', value: 'doz' },
  { label: 'Packets (pkt)', value: 'pkt' },
  { label: 'Sheets (sheet)', value: 'sheet' },
  { label: 'Bundles (bundle)', value: 'bundle' },
];

export function Inventory({ onViewChange }: { onViewChange?: (view: string, id?: number, clone?: boolean) => void }) {
  const { can } = usePermissions();
  const [search, setSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  const products = useProducts(search);

  const renderListView = () => (
    <Box p="xl">
      <Paper withBorder radius="md" bg="white">
        <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <TextInput
            placeholder="Search items..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={300}
          />
        </Box>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead bg="#f8f9fa">
            <Table.Tr>
              <Table.Th>NAME</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>STOCK</Table.Th>
              <Table.Th>PRICE</Table.Th>
              <Table.Th>STATUS</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products?.map((p) => (
              <Table.Tr key={p.id} onClick={() => setSelectedItemId(p.id || null)} style={{ cursor: 'pointer' }}>
                <Table.Td>
                  <Group gap="sm">
                    {p.imageFront ? (
                      <Box w={32} h={32} style={{ borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={p.imageFront} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      </Box>
                    ) : (
                      <Box w={32} h={32} bg="gray.1" style={{ borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={16} color="#94a3b8" />
                      </Box>
                    )}
                    <Text size="sm" fw={500}>{p.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td><Text size="sm">{p.sku}</Text></Table.Td>
                <Table.Td>
                  <Text size="sm" c={p.stock <= p.minStock ? 'red' : 'inherit'}>
                    {p.stock} {p.unit}
                  </Text>
                </Table.Td>
                <Table.Td><Text size="sm">₹ {p.price.toLocaleString()}</Text></Table.Td>
                <Table.Td>
                  <Badge color={p.stock > 0 ? 'green' : 'red'} variant="light">
                    {p.stock > 0 ? 'Active' : 'Out of Stock'}
                  </Badge>
                </Table.Td>
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
        {products?.map((p) => (
          <Paper 
            key={p.id} 
            withBorder 
            p="xl" 
            radius="md" 
            className="item-card" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => setSelectedItemId(p.id || null)}
          >
            <Stack align="center" gap="md">
              <Box w="100%" h={180} bg="gray.0" style={{ borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.imageFront ? (
                  <img src={p.imageFront} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={p.name} />
                ) : (
                  <Package size={64} color="#dee2e6" />
                )}
              </Box>
              <Stack gap={2} align="center">
                <Text fw={600} size="lg">{p.name}</Text>
                <Text size="xs" c="dimmed">SKU: {p.sku}</Text>
              </Stack>
              <Text size="sm" c={p.stock <= p.minStock ? 'red' : 'dimmed'}>
                Stock on Hand: <Text span fw={600}>{p.stock.toFixed(2)} {p.unit}</Text>
              </Text>
              <Divider w="100%" />
              <Group justify="space-between" w="100%">
                <Box>
                  <Text size="xs" c="dimmed">Selling Price</Text>
                  <Text fw={600}>₹ {p.price.toLocaleString()}</Text>
                </Box>
                <Box style={{ textAlign: 'right' }}>
                  <Text size="xs" c="dimmed">Cost Price</Text>
                  <Text fw={600}>₹ {p.costPrice?.toLocaleString() || '0'}</Text>
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
            <Title order={5}>All Items</Title>
            <ActionIcon variant="subtle" color="gray" onClick={() => setSelectedItemId(null)}><X size={16} /></ActionIcon>
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
          {products?.map((p) => (
            <UnstyledButton
              key={p.id}
              onClick={() => setSelectedItemId(p.id || null)}
              p="md"
              style={{
                width: '100%',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: selectedItemId === p.id ? '#f0f7ff' : 'transparent'
              }}
            >
              <Group gap="sm">
                <Box w={40} h={40} bg="gray.0" style={{ borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.imageFront ? (
                    <img src={p.imageFront} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  ) : (
                    <Package size={20} color="#adb5bd" />
                  )}
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500} truncate>{p.name}</Text>
                  <Text size="xs" c="dimmed">₹ {p.price.toLocaleString()}</Text>
                </Box>
                <Badge size="xs" variant="flat" color={p.stock > 0 ? 'green' : 'red'}>
                  {p.stock} {p.unit}
                </Badge>
              </Group>
            </UnstyledButton>
          ))}
        </ScrollArea>
      </Box>

      <Box style={{ flex: 1 }} bg="#f8f9fa">
        {selectedItemId && (
          <ItemDetail 
            itemId={selectedItemId} 
            onClose={() => setSelectedItemId(null)} 
            onEdit={(id) => onViewChange?.('new-item', id)}
            onClone={(id) => onViewChange?.('new-item', id, true)}
            onViewChange={onViewChange}
          />
        )}
      </Box>
    </Box>
  );

  if (selectedItemId) return renderSplitView();

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
                    <Title order={4} fw={600}>Active Items</Title>
                    <ChevronDown size={16} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item>All Items</Menu.Item>
                <Menu.Item>Active Items</Menu.Item>
                <Menu.Item>Inactive Items</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Group>
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
                <Package size={18} />
              </ActionIcon>
            </Group>

            {can('Items', 'Item', 'create') && (
              <Button 
                color="blue" 
                leftSection={<Plus size={16} />} 
                radius="md"
                onClick={() => onViewChange?.('new-item')}
              >
                New
              </Button>
            )}

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="outline" color="gray" radius="md" size="lg">
                  <MoreHorizontal size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Actions</Menu.Label>
                <Menu.Item leftSection={<List size={14} />} onClick={() => setViewMode('list')}>View as List</Menu.Item>
                <Menu.Item leftSection={<HistoryIcon size={14} />} onClick={() => onViewChange?.('inventory-adjustments')}>Inventory Adjustments</Menu.Item>
                <Menu.Item leftSection={<Package size={14} />} onClick={() => setViewMode('grid')}>View as Grid</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<Settings size={14} />}>Preferences</Menu.Item>
                <Menu.Item leftSection={<Download size={14} />}>Import Items</Menu.Item>
                <Menu.Item leftSection={<Plus size={14} />}>Export Items</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<Plus size={14} />}>Refresh List</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflowY: 'auto' }}>
        {viewMode === 'list' ? renderListView() : renderGridView()}
      </Box>
    </Box>
  );
}
