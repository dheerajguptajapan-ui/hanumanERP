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
  Select,
  TextInput
} from '@mantine/core';
import { 
  Plus, 
  MoreVertical,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  FileText,
  Search,
  DollarSign,
  XCircle,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { NewCreditNote } from './NewCreditNote';

export function CreditNotes() {
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Group gap={4}>
               <Title order={4} fw={600}>All Credit Notes</Title>
               <ActionIcon variant="subtle" color="gray" size="sm"><ChevronDown size={14} /></ActionIcon>
            </Group>
          </Group>
          <Group gap="xs">
            <TextInput 
              placeholder="Search in Credit Notes (/)" 
              size="xs" 
              w={250} 
              leftSection={<Search size={14} />} 
            />
            <Button size="xs" leftSection={<Plus size={14} />} color="blue" onClick={() => setShowNewModal(true)}>+ New</Button>
            <ActionIcon variant="outline" color="gray" size="sm"><MoreVertical size={14} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p={100}>
        <Stack align="center" gap={40}>
           <Stack align="center" gap="md">
              <Title order={2} fw={400}>Handle Returns and Adjustments With Credit Notes</Title>
              <Text c="dimmed" ta="center" maw={700}>
                 Create credit notes for returns, refunds, or invoice corrections without modifying the original invoice.
              </Text>
              <Button size="md" color="blue" mt="md" onClick={() => setShowNewModal(true)}>CREATE CREDIT NOTE</Button>
              <Anchor size="sm" c="blue" mt="xs">Import Credit Notes</Anchor>
           </Stack>

           <Box w="100%" maw={1000} mt={60}>
              <Center mb="xl">
                 <Text fw={600} size="lg" c="gray.7">Life cycle of a Credit Note</Text>
              </Center>
              
              <Box style={{ position: 'relative' }}>
                 <Group justify="center" gap={40} wrap="nowrap" align="center">
                    <Stack gap={40}>
                       <LifecycleStep icon={<RotateCcw size={18} />} label="PRODUCT RETURNED" color="orange" />
                       <LifecycleStep icon={<XCircle size={18} />} label="ORDER CANCELLED" color="red" />
                    </Stack>

                    <Box style={{ borderLeft: '1px dotted #228be6', height: 120, position: 'relative' }}>
                       <Box style={{ position: 'absolute', top: '50%', left: 0, width: 40, borderTop: '1px dotted #228be6' }} />
                    </Box>

                    <LifecycleStep icon={<FileText size={18} />} label="CREDIT NOTES" color="blue" />

                    <Box style={{ borderLeft: '1px dotted #228be6', height: 120, position: 'relative' }}>
                       <Box style={{ position: 'absolute', top: '20%', left: 0, width: 40, borderTop: '1px dotted #228be6' }} />
                       <Box style={{ position: 'absolute', top: '80%', left: 0, width: 40, borderTop: '1px dotted #228be6' }} />
                    </Box>

                    <Stack gap={40}>
                       <LifecycleStep icon={<DollarSign size={18} />} label="REFUND" color="blue" />
                       <LifecycleStep icon={<CheckCircle2 size={18} />} label="CREDITS" color="purple" />
                    </Stack>

                    <LifecycleConnector />

                    <LifecycleStep icon={<FileText size={18} />} label="APPLY TO FUTURE INVOICES" color="teal" />
                 </Group>
              </Box>
           </Box>
        </Stack>
      </Box>
      <NewCreditNote opened={showNewModal} onClose={() => setShowNewModal(false)} />
    </Box>
  );
}

function LifecycleStep({ icon, label, color = 'blue' }: { icon: React.ReactNode, label: string, color?: string }) {
  const colorMap: Record<string, string> = {
    green: '#40c057',
    orange: '#fab005',
    red: '#fa5252',
    blue: '#228be6',
    purple: '#be4bdb',
    teal: '#12b886'
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

function LifecycleConnector() {
  return (
    <Box style={{ display: 'flex', alignItems: 'center' }}>
       <Box h={1} bg="blue.2" w={40} style={{ position: 'relative', borderTop: '1px dotted #228be6' }}>
          <Box 
            style={{ 
              position: 'absolute', 
              right: -4, 
              top: -3, 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              backgroundColor: '#228be6' 
            }} 
          />
       </Box>
    </Box>
  );
}

import { Anchor } from '@mantine/core';
