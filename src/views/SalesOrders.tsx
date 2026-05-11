import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Button, 
  Table, 
  Text, 
  TextInput, 
  Menu, 
  ActionIcon, 
  Badge,
  Box,
  Stack,
  ScrollArea,
  Tabs,
  Center,
  Divider,
  Grid,
} from '@mantine/core';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  X, 
  ChevronDown, 
  Mail, 
  MoreHorizontal, 
  Link, 
  MessageSquare,
  Edit,
  Printer,
  ShoppingBag
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { SalesOrderDetail } from './SalesOrderDetail';

interface SalesOrdersProps {
  onViewChange: (view: string, id?: number, clone?: boolean) => void;
}

export function SalesOrders({ onViewChange }: SalesOrdersProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const orders = useLiveQuery(
    () => db.salesOrders
      .filter(o => 
        o.partnerName.toLowerCase().includes(search.toLowerCase()) || 
        o.orderNumber.toLowerCase().includes(search.toLowerCase())
      )
      .reverse()
      .toArray(),
    [search]
  ) || [];

  const handleNew = () => {
    onViewChange('new-sales-order');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'issued': return 'blue';
      case 'received': return 'green';
      case 'billed': return 'indigo';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Title order={2}>All Sales Orders</Title>
          <Group>
            <Button 
              leftSection={<Plus size={18} />} 
              onClick={handleNew}
              color="blue"
            >
              New
            </Button>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="default" size="lg"><MoreHorizontal size={18} /></ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Search size={16} />}>Search</Menu.Item>
                <Menu.Item leftSection={<Printer size={16} />}>Print List</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }} bg="#f8f9fa">
        {/* Left Sidebar List */}
        <Box w={350} style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }} bg="white">
           <Box p="sm" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <TextInput 
                placeholder="Search orders..." 
                size="xs" 
                leftSection={<Search size={12} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </Box>
           <ScrollArea style={{ flex: 1 }}>
              {orders.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <ShoppingBag size={32} color="gray" />
                    <Text size="xs" c="dimmed">No sales orders found</Text>
                  </Stack>
                </Center>
              ) : (
                orders.map(order => (
                  <Box 
                    key={order.id} 
                    p="md" 
                    style={{ 
                      cursor: 'pointer', 
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: selectedId === order.id ? '#e7f5ff' : 'transparent',
                      borderLeft: selectedId === order.id ? '4px solid #228be6' : 'none'
                    }}
                    onClick={() => setSelectedId(order.id!)}
                  >
                     <Group justify="space-between" mb={4}>
                        <Text size="sm" fw={600} c={selectedId === order.id ? 'blue' : 'gray.8'} truncate>
                           {order.partnerName}
                        </Text>
                        <Text size="sm" fw={600}>₹{order.total.toLocaleString()}</Text>
                     </Group>
                     <Group justify="space-between">
                        <Text size="xs" c="dimmed">{order.orderNumber} • {new Date(order.date).toLocaleDateString()}</Text>
                        <Badge color={getStatusColor(order.status)} size="xs" variant="light">
                          {order.status.toUpperCase()}
                        </Badge>
                     </Group>
                  </Box>
                ))
              )}
           </ScrollArea>
        </Box>

        {/* Right Detail Pane */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
           {selectedId ? (
             <SalesOrderDetail 
               orderId={selectedId} 
               onClose={() => setSelectedId(null)} 
               onEdit={(id) => onViewChange('new-sales-order', id)}
               onViewChange={onViewChange}
             />
           ) : (
             <Center style={{ flex: 1 }}>
                <Stack align="center" gap="xs">
                   <ShoppingBag size={48} color="gray" opacity={0.5} />
                   <Text c="dimmed">Select a sales order to view details</Text>
                   <Button variant="light" onClick={handleNew}>Create New Sales Order</Button>
                </Stack>
             </Center>
           )}
        </Box>
      </Box>
    </Box>
  );
}
