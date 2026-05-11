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
  Image,
  Divider,
  ActionIcon
} from '@mantine/core';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  MoreVertical,
  ChevronRight,
  PackageCheck,
  Package as PackageIcon,
  Truck,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface PackagesProps {
  onViewChange?: (view: string) => void;
}

export function Packages({ onViewChange }: PackagesProps) {
  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Title order={4} fw={600}>All Packages</Title>
            <ActionIcon variant="subtle" color="gray" size="sm"><ChevronRight size={14} /></ActionIcon>
          </Group>
          <Group gap="xs">
            <Group gap={0} bg="gray.1" style={{ borderRadius: '4px', border: '1px solid #e2e8f0' }}>
               <ActionIcon variant="subtle" color="gray" size="sm" radius="0"><List size={14} /></ActionIcon>
               <ActionIcon variant="default" color="gray" size="sm" radius="0" style={{ border: 'none' }}><LayoutGrid size={14} /></ActionIcon>
            </Group>
            <Button size="xs" leftSection={<Plus size={14} />} color="blue">+ New</Button>
            <ActionIcon variant="outline" color="gray" size="sm"><MoreVertical size={14} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p={100}>
        <Stack align="center" gap={40}>
           <Stack align="center" gap="md">
              <Box p={40} bg="blue.0" style={{ borderRadius: '50%' }}>
                 <PackageIcon size={80} color="#228be6" strokeWidth={1} />
              </Box>
              <Title order={3}>Start Creating Packages!</Title>
              <Text c="dimmed">Create packages and ship them via carrier.</Text>
              <Button size="md" color="blue" mt="md" onClick={() => onViewChange?.('sales_orders')}>GO TO SALES ORDER</Button>
           </Stack>

           <Box w="100%" maw={1000} mt={60}>
              <Center mb="xl">
                 <Text fw={600} size="lg" c="gray.7">Life cycle of a Package</Text>
              </Center>
              
              <Group justify="center" gap={0} wrap="nowrap">
                 <LifecycleStep icon={<FileCheck size={20} />} label="CONFIRMED SO" />
                 <LifecycleConnector />
                 <LifecycleStep icon={<PackageIcon size={20} />} label="NEW PACKAGE" active />
                 <LifecycleConnector />
                 <LifecycleStep icon={<PackageCheck size={20} />} label="NOT SHIPPED" />
                 <LifecycleConnector />
                 <LifecycleStep icon={<Truck size={20} />} label="SHIPPED" />
                 <LifecycleConnector />
                 <LifecycleStep icon={<CheckCircle2 size={20} />} label="DELIVERED" />
              </Group>

              <Divider mt={100} label="In the Packages module, you can:" labelPosition="center" />
           </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function LifecycleStep({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Paper 
      withBorder 
      p="xs" 
      radius="sm" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        backgroundColor: active ? '#f8f9fa' : 'white',
        borderColor: active ? '#228be6' : '#e2e8f0',
        minWidth: '160px'
      }}
    >
       <Box c={active ? 'blue' : 'gray.5'}>{icon}</Box>
       <Text size="xs" fw={700} c={active ? 'blue' : 'gray.6'} tt="uppercase">{label}</Text>
    </Paper>
  );
}

function LifecycleConnector() {
  return (
    <Box h={1} bg="blue.2" w={40} style={{ position: 'relative' }}>
       <Box 
         style={{ 
           position: 'absolute', 
           right: -4, 
           top: -2, 
           width: 6, 
           height: 6, 
           borderRadius: '50%', 
           backgroundColor: '#228be6' 
         }} 
       />
    </Box>
  );
}
