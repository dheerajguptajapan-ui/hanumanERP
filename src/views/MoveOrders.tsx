import React from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Button, 
  Text, 
  Box, 
  Stack, 
  ActionIcon
} from '@mantine/core';
import { 
  Plus, 
  MoreVertical,
  ChevronDown,
  MoveHorizontal,
  ArrowRightLeft
} from 'lucide-react';

export function MoveOrders() {
  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Group gap={4}>
               <Title order={4} fw={600}>All Move Orders</Title>
               <ActionIcon variant="subtle" color="gray" size="sm"><ChevronDown size={14} /></ActionIcon>
            </Group>
          </Group>
          <Group gap="xs">
            <Button size="xs" leftSection={<Plus size={14} />} color="blue">+ New</Button>
            <ActionIcon variant="outline" color="gray" size="sm"><MoreVertical size={14} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p={100}>
        <Stack align="center" gap={40} mt={100}>
           <Box p={40} bg="blue.0" style={{ borderRadius: '50%' }}>
              <ArrowRightLeft size={80} color="#228be6" strokeWidth={1} />
           </Box>
           <Stack align="center" gap="md">
              <Title order={3}>Organize Your Inventory Efficiently</Title>
              <Text c="dimmed">Create move orders to relocate item within the same warehouse.</Text>
              <Button size="md" color="blue" mt="md">CREATE MOVE ORDER</Button>
           </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
