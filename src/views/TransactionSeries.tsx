import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stack, 
  Group, 
  Title, 
  Text, 
  Button, 
  Paper, 
  TextInput, 
  NumberInput,
  ActionIcon,
  Divider,
  ScrollArea,
  Anchor,
  Table,
  Badge,
  rem
} from '@mantine/core';
import { 
  ChevronLeft, 
  Settings as SettingsIcon,
  X,
  Search,
  Plus,
  RefreshCcw,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import { db, type Settings } from '../db';
import { notifications } from '@mantine/notifications';

interface TransactionSeriesProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

const DEFAULT_SERIES = {
  'Invoice': { prefix: 'INV', nextNumber: 1, digitCount: 6 },
  'Sales Order': { prefix: 'SO', nextNumber: 1, digitCount: 6 },
  'Purchase Order': { prefix: 'PO', nextNumber: 1, digitCount: 6 },
  'Quote': { prefix: 'QT', nextNumber: 1, digitCount: 6 },
  'Credit Note': { prefix: 'CN', nextNumber: 1, digitCount: 6 },
  'Bill': { prefix: 'BILL', nextNumber: 1, digitCount: 6 }
};

export function TransactionSeries({ onBack, onNavigate }: TransactionSeriesProps) {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(DEFAULT_SERIES);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    db.settings.toCollection().first().then(saved => {
      if (saved?.transactionSeries) {
        setSeries(saved.transactionSeries);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    const existing = await db.settings.toCollection().first();
    if (existing) {
      await db.settings.update(existing.id!, { transactionSeries: series });
    } else {
      await db.settings.add({ transactionSeries: series, id: 1 } as any);
    }
    notifications.show({
      title: 'Success',
      message: 'Transaction numbering series updated',
      color: 'green'
    });
  };

  const updateSeries = (key: string, field: string, value: any) => {
    setSeries({
      ...series,
      [key]: { ...series[key], [field]: value }
    });
  };

  if (loading) return null;

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
               <Box p={6} bg="orange.0" style={{ borderRadius: '4px' }}>
                  <SettingsIcon size={20} color="#f76707" />
               </Box>
               <Stack gap={0}>
                  <Group gap={4}>
                     <ActionIcon variant="subtle" color="gray" size="sm" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                     <Text fw={700} size="sm">All Settings</Text>
                  </Group>
                  <Text size="xs" c="dimmed">jhakkasdheeraj</Text>
               </Stack>
            </Group>

            <Box style={{ flex: 1, maxWidth: 500 }} mx="xl">
               <TextInput 
                  placeholder="Search settings (/)" 
                  leftSection={<Search size={14} />} 
                  size="sm"
                  styles={{ input: { backgroundColor: '#f1f3f5', border: 'none' } }}
               />
            </Box>

            <Button 
               variant="subtle" 
               color="red" 
               size="xs" 
               rightSection={<X size={14} />}
               onClick={onBack}
            >
               Close Settings
            </Button>
         </Group>
      </Box>

      <Group align="flex-start" gap={0} style={{ flex: 1, overflow: 'hidden' }} wrap="nowrap">
        {/* Settings Sidebar */}
        <Box w={240} h="100%" bg="#f8f9fa" style={{ borderRight: '1px solid #e2e8f0' }} p="md">
           <Stack gap="xs">
              <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Customization</Text>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('templates')}>
                 <Text size="sm" c="gray.7">PDF Templates</Text>
              </Box>
              <Box p={8} bg="blue.0" style={{ borderRadius: '4px', cursor: 'pointer' }}>
                 <Text size="sm" fw={600} c="blue">Transaction Number Series</Text>
              </Box>
              
              <Text size="xs" fw={700} c="dimmed" mt="md" mb="xs" tt="uppercase">Other</Text>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }}>
                 <Text size="sm" c="gray.7">Email Notifications</Text>
              </Box>
           </Stack>
        </Box>

        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }} h="100%">
          <ScrollArea style={{ flex: 1 }} p="xl" bg="#f8f9fa">
            <Stack gap={30} maw={1000} mx="auto">
               <Paper p="xl" radius="md" withBorder bg="white">
                  <Stack gap="xl">
                     <Group justify="space-between">
                        <Stack gap={4}>
                           <Title order={3} fw={700}>Transaction Number Series</Title>
                           <Text size="sm" c="dimmed">Configure how your document numbers (Invoices, SOs, etc.) are generated.</Text>
                        </Stack>
                        <Button color="blue" onClick={handleSave}>Save Changes</Button>
                     </Group>

                     <Divider />

                     <Table verticalSpacing="md">
                        <Table.Thead bg="gray.0">
                           <Table.Tr>
                              <Table.Th>Document Type</Table.Th>
                              <Table.Th>Prefix</Table.Th>
                              <Table.Th>Next Number</Table.Th>
                              <Table.Th>Digit Count</Table.Th>
                              <Table.Th>Preview</Table.Th>
                              <Table.Th ta="right">Actions</Table.Th>
                           </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                           {Object.entries(series).map(([key, value]: [string, any]) => (
                              <Table.Tr key={key}>
                                 <Table.Td><Text fw={600}>{key}</Text></Table.Td>
                                 <Table.Td>
                                    <TextInput 
                                       size="xs" 
                                       w={80} 
                                       value={value.prefix} 
                                       onChange={(e) => updateSeries(key, 'prefix', e.currentTarget.value)}
                                    />
                                 </Table.Td>
                                 <Table.Td>
                                    <NumberInput 
                                       size="xs" 
                                       w={100} 
                                       value={value.nextNumber} 
                                       onChange={(val) => updateSeries(key, 'nextNumber', val)}
                                       min={1}
                                    />
                                 </Table.Td>
                                 <Table.Td>
                                    <Select 
                                       size="xs" 
                                       w={100}
                                       data={['3', '4', '5', '6', '7', '8']}
                                       value={String(value.digitCount)}
                                       onChange={(val) => updateSeries(key, 'digitCount', Number(val))}
                                    />
                                 </Table.Td>
                                 <Table.Td>
                                    <Badge color="gray" variant="outline" size="lg">
                                       {`${value.prefix}-${String(value.nextNumber).padStart(value.digitCount, '0')}`}
                                    </Badge>
                                 </Table.Td>
                                 <Table.Td ta="right">
                                    <Group gap="xs" justify="flex-end">
                                       <ActionIcon variant="subtle" color="blue"><Edit2 size={14} /></ActionIcon>
                                       <ActionIcon variant="subtle" color="gray" onClick={() => updateSeries(key, 'nextNumber', 1)}><RefreshCcw size={14} /></ActionIcon>
                                    </Group>
                                 </Table.Td>
                              </Table.Tr>
                           ))}
                        </Table.Tbody>
                     </Table>

                     <Paper p="md" bg="blue.0" radius="md" withBorder style={{ borderColor: '#228be6' }}>
                        <Group gap="md">
                           <Box p="xs" bg="blue.1" style={{ borderRadius: '50%' }}>
                              <Plus size={20} color="#228be6" />
                           </Box>
                           <Stack gap={2}>
                              <Text size="sm" fw={700}>Add New Series</Text>
                              <Text size="xs" c="dimmed">Create custom numbering ranges for different branches or departments.</Text>
                           </Stack>
                        </Group>
                     </Paper>
                  </Stack>
               </Paper>
            </Stack>
          </ScrollArea>
        </Box>
      </Group>
    </Box>
  );
}

import { Select } from '@mantine/core';
