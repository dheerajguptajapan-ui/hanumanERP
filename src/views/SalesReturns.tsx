import React from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Button, 
  Text, 
  Box, 
  Stack, 
  Center,
  Divider,
  ActionIcon,
  Select,
  Checkbox
} from '@mantine/core';
import { 
  Plus, 
  MoreVertical,
  ChevronDown,
  ShoppingCart,
  Truck,
  RotateCcw,
  CheckCircle2,
  FileText,
  Search,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

interface SalesReturnsProps {
  onViewChange?: (view: string) => void;
}

export function SalesReturns({ onViewChange }: SalesReturnsProps) {
  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Group gap={4}>
               <Title order={4} fw={600}>All Sales Returns</Title>
               <ActionIcon variant="subtle" color="gray" size="sm"><ChevronDown size={14} /></ActionIcon>
            </Group>
          </Group>
          <Group gap="xs">
            <TextInput 
              placeholder="Search in Sales Returns (/)" 
              size="xs" 
              w={250} 
              leftSection={<Search size={14} />} 
            />
            <Button size="xs" leftSection={<Plus size={14} />} color="blue">+ New</Button>
            <ActionIcon variant="outline" color="gray" size="sm"><MoreVertical size={14} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p={100}>
        <Stack align="center" gap={40}>
           <Stack align="center" gap="md">
              <Title order={2} fw={400}>Sales Returns</Title>
              <Text c="dimmed" ta="center" maw={600}>
                 Process your product returns in few simple steps and get your inventory automatically sorted out.
                 <br />
                 Start creating sales returns from sales orders
              </Text>
              <Button size="md" color="blue" mt="md" onClick={() => onViewChange?.('sales_orders')}>GO TO SALES ORDERS</Button>
           </Stack>

           <Box w="100%" maw={1000} mt={60}>
              <Center mb="xl">
                 <Text fw={600} size="lg" c="gray.7">Life cycle of a Sales Return</Text>
              </Center>
              
              <Box style={{ position: 'relative' }}>
                 <Group justify="center" gap={60} wrap="nowrap" align="center">
                    <LifecycleStep icon={<ShoppingCart size={18} />} label="SALES ORDER" color="green" />
                    <LifecycleStep icon={<Truck size={18} />} label="SHIPMENT" color="green" />
                    <LifecycleStep icon={<ArrowLeft size={18} />} label="PRODUCT RETURNED" />
                 </Group>

                 <Group justify="center" gap={60} wrap="nowrap" align="center" mt={60}>
                    <LifecycleStep icon={<DollarSign size={18} />} label="CREDIT NOTE" color="green" />
                    <LifecycleStep icon={<CheckCircle2 size={18} />} label="RECEIVE" color="green" />
                    <LifecycleStep icon={<RotateCcw size={18} />} label="SALES RETURN" color="orange" />
                 </Group>

                 {/* Custom Connectors (Simulated with Box) */}
                 <Box style={{ position: 'absolute', top: 35, left: '26%', right: '26%', zIndex: -1 }}>
                    <Divider variant="dotted" color="blue.2" />
                 </Box>
                 <Box style={{ position: 'absolute', bottom: 35, left: '26%', right: '26%', zIndex: -1 }}>
                    <Divider variant="dotted" color="blue.2" />
                 </Box>
                 <Box style={{ position: 'absolute', top: 35, right: '22%', bottom: 35, width: 2, borderRight: '1px dotted #e2e8f0', zIndex: -1 }} />
              </Box>
           </Box>

           <Box w="100%" maw={800} mt={60}>
              <Text fw={600} mb="xl">In the Sales Return module, you can:</Text>
              <Stack gap="sm">
                 <Group gap="sm">
                    <CheckCircle2 size={16} color="#228be6" />
                    <Text size="sm">Record receives of the returned items.</Text>
                 </Group>
                 <Group gap="sm">
                    <CheckCircle2 size={16} color="#228be6" />
                    <Text size="sm">Create Credit Notes to provide store credit to customers.</Text>
                 </Group>
                 <Group gap="sm">
                    <CheckCircle2 size={16} color="#228be6" />
                    <Text size="sm">Track the status of the return and the associated documents.</Text>
                 </Group>
              </Stack>
           </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function LifecycleStep({ icon, label, color = 'blue' }: { icon: React.ReactNode, label: string, color?: string }) {
  const colorMap: Record<string, string> = {
    green: '#40c057',
    orange: '#fab005',
    blue: '#228be6'
  };

  return (
    <Paper 
      withBorder 
      p="sm" 
      radius="sm" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        borderColor: colorMap[color] || '#e2e8f0',
        minWidth: '180px',
        backgroundColor: 'white'
      }}
    >
       <Box c={colorMap[color]}>{icon}</Box>
       <Text size="xs" fw={700} c="gray.8">{label}</Text>
    </Paper>
  );
}

import { TextInput } from '@mantine/core';
