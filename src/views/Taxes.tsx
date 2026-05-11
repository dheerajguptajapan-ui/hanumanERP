import React, { useState } from 'react';
import { 
  Box, 
  Stack, 
  Group, 
  Title, 
  Text, 
  Button, 
  Paper, 
  Table, 
  ActionIcon, 
  TextInput, 
  Checkbox,
  ScrollArea,
  Divider,
  Anchor,
  NumberInput,
  Menu,
  Tooltip
} from '@mantine/core';
import { 
  Search, 
  ChevronLeft, 
  Settings as SettingsIcon,
  X,
  Plus,
  MoreVertical,
  ChevronDown,
  Info
} from 'lucide-react';
import { db, type Tax } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface TaxesProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export function Taxes({ onBack, onNavigate }: TaxesProps) {
  const [view, setView] = useState<'list' | 'new'>('list');
  const taxes = useLiveQuery(() => db.taxes.toArray()) || [];

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
        {/* Sidebar */}
        <Box w={240} h="100%" bg="#f8f9fa" style={{ borderRight: '1px solid #e2e8f0' }} p="md">
           <Stack gap="xs">
              <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Organization Settings</Text>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('org-profile')}>
                 <Text size="sm" c="gray.7">Profile</Text>
              </Box>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('branding')}>
                 <Text size="sm" c="gray.7">Branding</Text>
              </Box>
              
              <Text size="xs" fw={700} c="dimmed" mt="md" mb="xs" tt="uppercase">Taxes & Compliance</Text>
              <Box p={8} bg="blue.0" style={{ borderRadius: '4px', cursor: 'pointer' }}>
                 <Text size="sm" fw={600} c="blue">Tax Rates</Text>
              </Box>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('users')}>
                 <Text size="sm" c="gray.7">Users & Roles</Text>
              </Box>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('general-settings')}>
                 <Text size="sm" c="gray.7">General Settings</Text>
              </Box>
           </Stack>
        </Box>

        {/* Content Area */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }} h="100%">
           {view === 'list' ? (
              <TaxesList taxes={taxes} onNew={() => setView('new')} />
           ) : (
              <NewTaxForm onCancel={() => setView('list')} />
           )}
        </Box>
      </Group>
    </Box>
  );
}

function TaxesList({ taxes, onNew }: { taxes: Tax[], onNew: () => void }) {
  return (
    <>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between">
            <Group gap="xs">
               <Title order={4} fw={500}>Active taxes</Title>
               <ChevronDown size={18} />
            </Group>
            <Group gap="sm">
               <Group gap={0}>
                  <Button color="red" leftSection={<Plus size={16} />} size="xs" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }} onClick={onNew}>
                    New Tax
                  </Button>
                  <Button color="red" size="xs" variant="filled" px={4} style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
                    <ChevronDown size={14} />
                  </Button>
               </Group>
               <ActionIcon variant="outline" color="gray"><MoreVertical size={16} /></ActionIcon>
            </Group>
         </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
         <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
               <Table.Tr>
                  <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">TAX NAME</Text></Table.Th>
                  <Table.Th w="20%"><Text size="xs" fw={700} tt="uppercase" c="dimmed">RATE (%)</Text></Table.Th>
                  <Table.Th w={50} />
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
               {taxes.map(tax => (
                  <Table.Tr key={tax.id}>
                     <Table.Td><Text size="sm">{tax.name}</Text></Table.Td>
                     <Table.Td><Text size="sm">{tax.rate}%</Text></Table.Td>
                     <Table.Td>
                        <ActionIcon variant="subtle" color="gray"><MoreVertical size={14} /></ActionIcon>
                     </Table.Td>
                  </Table.Tr>
               ))}
               {taxes.length === 0 && (
                  <Table.Tr>
                     <Table.Td colSpan={3} ta="center" py={100}>
                        <Text c="dimmed" size="sm">There are no active taxes</Text>
                     </Table.Td>
                  </Table.Tr>
               )}
            </Table.Tbody>
         </Table>
      </ScrollArea>
      <Box p="xs" style={{ position: 'absolute', right: 10, top: '50%' }}>
         <ActionIcon variant="subtle" color="gray"><Search size={14} /></ActionIcon>
      </Box>
    </>
  );
}

function NewTaxForm({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = useState('');
  const [rate, setRate] = useState<number | string>(0);
  const [isCompound, setIsCompound] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    await db.taxes.add({
      name,
      rate: Number(rate),
      isCompound,
      status: 'active'
    });
    onCancel();
  };

  return (
    <>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group gap="xs">
            <ActionIcon variant="subtle" color="blue" onClick={onCancel}><ChevronLeft size={20} /></ActionIcon>
            <Title order={4} fw={600}>New Tax</Title>
         </Group>
      </Box>
      <ScrollArea style={{ flex: 1 }} p="xl">
         <Stack gap="xl" maw={600}>
            <TextInput 
              label={<Text size="sm" c="red">Tax Name*</Text>} 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              styles={{ label: { marginBottom: 8 } }}
            />
            <NumberInput 
              label={<Text size="sm" c="red">Rate (%)*</Text>} 
              required 
              rightSection={<Text size="xs" c="dimmed">%</Text>}
              value={rate} 
              onChange={setRate}
              styles={{ label: { marginBottom: 8 } }}
            />
            <Group gap="xs">
               <Checkbox 
                 checked={isCompound} 
                 onChange={(e) => setIsCompound(e.currentTarget.checked)}
                 label={<Text size="sm">This tax is a compound tax.</Text>} 
               />
               <Tooltip label="A compound tax is calculated on top of the subtotal and other taxes.">
                  <Info size={14} color="gray" style={{ cursor: 'help' }} />
               </Tooltip>
            </Group>
         </Stack>
      </ScrollArea>
      <Box p="md" bg="#f8f9fa" style={{ borderTop: '1px solid #e2e8f0' }}>
         <Group gap="sm">
            <Button color="red" px="xl" size="xs" onClick={handleSave}>Save</Button>
            <Button variant="default" color="gray" px="xl" size="xs" onClick={onCancel}>Cancel</Button>
         </Group>
      </Box>
    </>
  );
}
