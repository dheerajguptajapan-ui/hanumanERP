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

interface PaymentsMadeProps {
  onViewChange?: (view: string, id?: number, extra?: any) => void;
}

export function PaymentsMade({ onViewChange }: PaymentsMadeProps) {
  const [search, setSearch] = useState('');
  
  const payments = useLiveQuery(
    () => db.payments.filter(p => 
      p.type === 'outbound' && 
      (p.paymentNumber.toLowerCase().includes(search.toLowerCase()) || 
       p.customerName.toLowerCase().includes(search.toLowerCase()))
    ).toArray(),
    [search]
  );

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/');
  };

  if (!payments || payments.length === 0) {
    return (
      <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
            <Group gap="xs">
              <Title order={4} fw={600} c="gray.8">All Payments</Title>
              <ChevronDown size={16} color="gray" />
            </Group>
            <Group gap="xs">
               <Button 
                 leftSection={<Plus size={16} />} 
                 color="blue" 
                 size="xs"
                 onClick={() => onViewChange?.('new-payment', undefined, { type: 'outbound' })}
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
                 <Title order={3} fw={400}>You haven't made any payments yet.</Title>
                 <Text size="sm" c="dimmed">Receipts of your bill payments will show up here.</Text>
               </Stack>
               <Group mt="md" gap="xs" align="center" style={{ flexDirection: 'column' }}>
                 <Button 
                   color="blue" 
                   size="md" 
                   radius="sm" 
                   px="xl"
                   onClick={() => onViewChange?.('bills', undefined, { filter: 'unpaid' })}
                 >
                   GO TO UNPAID BILLS
                 </Button>
                 <Text size="sm" c="blue" mt="xs" style={{ cursor: 'pointer' }}>Import Payments</Text>
               </Group>
            </Stack>

            {/* Lifecycle Diagram Placeholder */}
            <Stack mt={rem(80)} align="center" gap="xl">
               <Text size="sm" fw={600} c="gray.7" tt="uppercase">Life cycle of a Vendor Payment</Text>
               <Group gap={0} align="center">
                  <Box p="xs" style={{ border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', width: 100 }}>
                    <Text size="xs" fw={700} c="dimmed">BILLS</Text>
                  </Box>
               </Group>
               <Box h={40} style={{ borderLeft: '1px dashed #ced4da' }} />
               <Group gap="xl">
                  <Box p="xs" style={{ border: '1px solid #228be6', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8, width: 150 }}>
                    <Box h={20} w={20} bg="blue.0" style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Box h={8} w={8} bg="blue" style={{ borderRadius: '50%' }} />
                    </Box>
                    <Text size="xs" fw={600} c="blue">ACH PAYMENT</Text>
                  </Box>
                  <Box p="xs" style={{ border: '1px solid #228be6', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8, width: 150 }}>
                    <Box h={20} w={20} bg="blue.0" style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Box h={8} w={8} bg="blue" style={{ borderRadius: '50%' }} />
                    </Box>
                    <Text size="xs" fw={600} c="blue">CHECK</Text>
                  </Box>
                  <Box p="xs" style={{ border: '1px solid #228be6', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8, width: 150 }}>
                    <Box h={20} w={20} bg="blue.0" style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Box h={8} w={8} bg="blue" style={{ borderRadius: '50%' }} />
                    </Box>
                    <Text size="xs" fw={600} c="blue">MANUAL / OFFLINE</Text>
                  </Box>
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
            <Title order={4} fw={600} c="gray.8">All Payments</Title>
            <ChevronDown size={16} color="gray" />
          </Group>
          <Group gap="xs">
            <Button 
              leftSection={<Plus size={16} />} 
              color="blue" 
              size="xs"
              onClick={() => onViewChange?.('new-payment', undefined, { type: 'outbound' })}
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
                    placeholder="Search Payments" 
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
                        <Table.Th>PAYMENT#</Table.Th>
                        <Table.Th>VENDOR NAME</Table.Th>
                        <Table.Th>REFERENCE#</Table.Th>
                        <Table.Th>BILL#</Table.Th>
                        <Table.Th>MODE</Table.Th>
                        <Table.Th ta="right">AMOUNT</Table.Th>
                        <Table.Th>STATUS</Table.Th>
                     </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                     {payments.map(p => (
                        <Table.Tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => onViewChange?.('payment-detail', p.id)}>
                           <Table.Td><Text size="sm">{formatDate(p.date)}</Text></Table.Td>
                           <Table.Td><Text size="sm" c="blue" fw={500}>{p.paymentNumber}</Text></Table.Td>
                           <Table.Td><Text size="sm">{p.customerName}</Text></Table.Td>
                           <Table.Td><Text size="sm">{p.reference || '-'}</Text></Table.Td>
                           <Table.Td><Text size="sm" c="blue">BILL-{p.purchaseBillId || '-'}</Text></Table.Td>
                           <Table.Td><Text size="sm">{p.paymentMode}</Text></Table.Td>
                           <Table.Td ta="right"><Text size="sm" fw={600}>₹{p.amount.toLocaleString()}</Text></Table.Td>
                           <Table.Td><Badge size="xs" color="green" variant="light">{p.status.toUpperCase()}</Badge></Table.Td>
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
