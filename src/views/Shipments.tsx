import React, { useState } from 'react';
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
  Select
} from '@mantine/core';
import { 
  Plus, 
  MoreVertical,
  ChevronDown,
  Package,
  Truck,
  CheckCircle2,
  FileCheck,
  User,
} from 'lucide-react';
import { NewShipment } from './NewShipment';

export function Shipments() {
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Group gap={4}>
               <Title order={4} fw={600}>All Shipments</Title>
               <ActionIcon variant="subtle" color="gray" size="sm"><ChevronDown size={14} /></ActionIcon>
            </Group>
            <Divider orientation="vertical" />
            <Group gap="xs">
               <Text size="xs" c="dimmed">Filter By :</Text>
               <Select 
                 size="xs" 
                 defaultValue="All" 
                 data={['All', 'Shipped', 'Delivered']} 
                 w={100} 
                 variant="filled" 
               />
            </Group>
          </Group>
          <Group gap="xs">
            <Text size="xs" c="blue" fw={500} style={{ cursor: 'pointer' }}>View EasyPost Usage</Text>
            <Box bg="blue.0" p={4} px={8} style={{ borderRadius: '4px' }}>
               <Text size="xs" fw={800} c="blue.9">easypost</Text>
            </Box>
            <Group gap={0}>
               <Button size="xs" leftSection={<Plus size={14} />} color="blue" radius="4px 0 0 4px" onClick={() => setShowNewModal(true)}>+ New</Button>
               <ActionIcon variant="filled" color="blue" size={30} radius="0 4px 4px 0" style={{ borderLeft: '1px solid rgba(255,255,255,0.3)' }} onClick={() => setShowNewModal(true)}>
                  <ChevronDown size={14} />
               </ActionIcon>
            </Group>
            <ActionIcon variant="outline" color="gray" size="sm"><MoreVertical size={14} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p={100}>
        <Stack align="center" gap={40}>
           <Stack align="center" gap="md">
              <Box p={40} bg="blue.0" style={{ borderRadius: '50%' }}>
                 <Truck size={80} color="#228be6" strokeWidth={1} />
              </Box>
              <Title order={3}>Ship with Confidence and Accuracy</Title>
              <Text c="dimmed">Create shipment records and track delivery status for your orders.</Text>
              <Button size="md" color="blue" mt="md" onClick={() => setShowNewModal(true)}>CREATE SHIPMENT</Button>
           </Stack>

           <Box w="100%" maw={1100} mt={60}>
              <Center mb="xl">
                 <Text fw={600} size="lg" c="gray.7">Life cycle of Shipments</Text>
              </Center>
              
              <Group justify="center" gap={0} wrap="nowrap" align="center">
                 <LifecycleStep icon={<FileCheck size={18} />} label="Sales Order Confirmed" />
                 <LifecycleConnector />
                 <LifecycleStep icon={<Package size={18} />} label="Packages Created" />
                 <LifecycleConnector />
                 <LifecycleStep icon={<Truck size={18} />} label="Create Shipment" active />
                 
                 <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginLeft: '40px' }}>
                    <Group gap={0}>
                       <Box w={40} h={1} bg="blue.2" />
                       <LifecycleStep icon={<Truck size={18} />} label="Via Carrier" />
                    </Group>
                    <Group gap={0}>
                       <Box w={40} h={1} bg="blue.2" />
                       <LifecycleStep icon={<User size={18} />} label="Manually" />
                    </Group>
                 </Box>

                 <Box ml={40} style={{ display: 'flex', alignItems: 'center' }}>
                    <Box h={1} bg="blue.2" w={40} />
                    <LifecycleStep icon={<Truck size={18} />} label="Shipped" />
                    <LifecycleConnector />
                    <LifecycleStep icon={<CheckCircle2 size={18} />} label="Delivered" />
                 </Box>
              </Group>
           </Box>
        </Stack>
      </Box>
      <NewShipment opened={showNewModal} onClose={() => setShowNewModal(false)} />
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
        minWidth: '180px'
      }}
    >
       <Box c={active ? 'blue' : 'gray.5'}>{icon}</Box>
       <Text size="xs" fw={600} c={active ? 'blue' : 'gray.7'}>{label}</Text>
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
