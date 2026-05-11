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
  ScrollArea,
  rem,
  Center,
  Image
} from '@mantine/core';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Settings, 
  MoreHorizontal,
  Download,
  Filter,
  X
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface VendorCreditsProps {
  onViewChange?: (view: string, id?: number) => void;
}

export function VendorCredits({ onViewChange }: VendorCreditsProps) {
  const [search, setSearch] = useState('');
  
  const credits = useLiveQuery(
    () => db.vendorCredits?.filter(c => 
      c.creditNoteNumber.toLowerCase().includes(search.toLowerCase()) || 
      c.vendorName.toLowerCase().includes(search.toLowerCase())
    ).toArray() || [],
    [search]
  );

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/');
  };

  if (!credits || credits.length === 0) {
    return (
      <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
            <Group gap="xs">
              <Title order={4} fw={600} c="gray.8">All Vendor Credits</Title>
              <ChevronDown size={16} color="gray" />
            </Group>
            <Group gap="xs">
               <Button 
                 leftSection={<Plus size={16} />} 
                 color="blue" 
                 size="xs"
                 onClick={() => onViewChange?.('new-vendor-credit')}
               >
                 New
               </Button>
               <ActionIcon variant="default"><MoreHorizontal size={16} /></ActionIcon>
            </Group>
          </Group>
        </Box>

        {/* Empty State */}
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          <Center py={rem(100)} style={{ flexDirection: 'column' }}>
            <Stack align="center" gap="lg" maw={600} ta="center">
               <Stack gap={5}>
                 <Title order={3} fw={400}>You deserve some credit too.</Title>
                 <Text size="sm" c="dimmed">Create vendor credits and apply them to multiple bills when buying stuff from your vendor.</Text>
               </Stack>
               <Group mt="md" gap="xs" align="center" style={{ flexDirection: 'column' }}>
                 <Button 
                   color="blue" 
                   size="md" 
                   radius="sm" 
                   px="xl"
                   onClick={() => onViewChange?.('new-vendor-credit')}
                 >
                   CREATE VENDOR CREDITS
                 </Button>
                 <Text size="sm" c="blue" mt="xs" style={{ cursor: 'pointer' }}>Import Vendor Credits</Text>
               </Group>
            </Stack>

            {/* Lifecycle Diagram Placeholder */}
            <Stack mt={rem(80)} align="center" gap="xl">
               <Text size="sm" fw={600} c="gray.7" tt="uppercase">Life cycle of a Vendor Credit</Text>
               <Group gap="xl" align="center">
                  <Box p="sm" style={{ border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', width: 150 }}>
                    <Text size="xs" fw={700} c="dimmed">PRODUCT RETURNED / CANCELLED</Text>
                  </Box>
                  <Box h={1} w={30} style={{ borderTop: '1px dashed #ced4da' }} />
                  <Box p="sm" style={{ border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', width: 150 }}>
                    <Text size="xs" fw={700} c="dimmed">CREDIT NOTE RECEIVED</Text>
                  </Box>
                  <Box h={1} w={30} style={{ borderTop: '1px dashed #ced4da' }} />
                  <Box p="sm" style={{ border: '1px solid #228be6', borderRadius: '4px', textAlign: 'center', width: 150 }}>
                    <Text size="xs" fw={700} c="blue">RECORD VENDOR CREDITS</Text>
                  </Box>
                  <Box h={1} w={30} style={{ borderTop: '1px dashed #ced4da' }} />
                  <Stack gap={0} align="center">
                    <Text size="xs" fw={700} c="dimmed" mb={4}>MARK AS OPEN</Text>
                    <Box h={40} style={{ borderLeft: '1px dashed #ced4da' }} />
                  </Stack>
                  <Stack gap="md">
                     <Box p="xs" style={{ border: '1px solid #2f9e44', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8, width: 180 }}>
                        <Box h={20} w={20} bg="green.0" style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Box h={8} w={8} bg="green" style={{ borderRadius: '50%' }} />
                        </Box>
                        <Text size="xs" fw={600} c="green">APPLY TO FUTURE BILLS</Text>
                     </Box>
                     <Box p="xs" style={{ border: '1px solid #228be6', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8, width: 180 }}>
                        <Box h={20} w={20} bg="blue.0" style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Box h={8} w={8} bg="blue" style={{ borderRadius: '50%' }} />
                        </Box>
                        <Text size="xs" fw={600} c="blue">RECORD REFUND</Text>
                     </Box>
                  </Stack>
               </Group>
            </Stack>
          </Center>
        </Box>
      </Box>
    );
  }

  return (
    <Box h="100%" bg="#f8f9fa" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="xs">
            <Title order={4} fw={600} c="gray.8">All Vendor Credits</Title>
            <ChevronDown size={16} color="gray" />
          </Group>
          <Group gap="xs">
            <Button 
              leftSection={<Plus size={16} />} 
              color="blue" 
              size="xs"
              onClick={() => onViewChange?.('new-vendor-credit')}
            >
              New
            </Button>
            <ActionIcon variant="default"><MoreHorizontal size={16} /></ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* List Content */}
      <Box p="md" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
         <Paper withBorder radius="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box p="sm" style={{ borderBottom: '1px solid #e2e8f0' }}>
               <Group justify="space-between">
                  <TextInput 
                    placeholder="Search Vendor Credits" 
                    leftSection={<Search size={14} />} 
                    size="xs" 
                    w={300}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Group gap="xs">
                     <ActionIcon variant="default"><Filter size={14} /></ActionIcon>
                     <ActionIcon variant="default"><Download size={14} /></ActionIcon>
                  </Group>
               </Group>
            </Box>

            <ScrollArea style={{ flex: 1 }}>
               <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead bg="#f8f9fa">
                     <Table.Tr>
                        <Table.Th>DATE</Table.Th>
                        <Table.Th>CREDIT NOTE#</Table.Th>
                        <Table.Th>VENDOR NAME</Table.Th>
                        <Table.Th>REFERENCE#</Table.Th>
                        <Table.Th>STATUS</Table.Th>
                        <Table.Th ta="right">AMOUNT</Table.Th>
                        <Table.Th ta="right">BALANCE</Table.Th>
                     </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                     {credits.map(c => (
                        <Table.Tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => onViewChange?.('vendor-credit-detail', c.id)}>
                           <Table.Td><Text size="sm">{formatDate(c.date)}</Text></Table.Td>
                           <Table.Td><Text size="sm" c="blue" fw={500}>{c.creditNoteNumber}</Text></Table.Td>
                           <Table.Td><Text size="sm">{c.vendorName}</Text></Table.Td>
                           <Table.Td><Text size="sm">{c.reference || '-'}</Text></Table.Td>
                           <Table.Td><Badge size="xs" color={c.status === 'open' ? 'blue' : 'green'} variant="light">{c.status.toUpperCase()}</Badge></Table.Td>
                           <Table.Td ta="right"><Text size="sm" fw={600}>₹{c.total.toLocaleString()}</Text></Table.Td>
                           <Table.Td ta="right"><Text size="sm">₹{c.balance.toLocaleString()}</Text></Table.Td>
                        </Table.Tr>
                     ))}
                  </Table.Tbody>
               </Table>
            </ScrollArea>
         </Paper>
      </Box>
    </Box>
  );
}
