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
  rem,
  Center,
} from '@mantine/core';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  ChevronDown, 
  Filter, 
  List, 
  MoreHorizontal,
  Download,
  Settings,
  Receipt,
  FileText,
  CreditCard
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

interface ExpensesProps {
  onViewChange?: (view: string, id?: number) => void;
}

export function Expenses({ onViewChange }: ExpensesProps) {
  const [search, setSearch] = useState('');
  
  const expenses = useLiveQuery(
    () => db.expenses.filter(e => 
      e.category.toLowerCase().includes(search.toLowerCase()) || 
      (e.reference ? e.reference.toLowerCase().includes(search.toLowerCase()) : false)
    ).toArray(),
    [search]
  );

  const handleDelete = async (id: number | undefined) => {
    if (id && confirm('Permanently remove this expense?')) {
      await db.expenses.delete(id);
      notifications.show({ title: 'Success', message: 'Expense removed', color: 'blue' });
    }
  };

  return (
    <Box bg="#f8f9fa" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="xl">
            <Text size="sm" c="dimmed" style={{ cursor: 'pointer' }}>Receipts Inbox</Text>
            <Group gap={4} style={{ cursor: 'pointer', borderBottom: '2px solid #3b82f6', paddingBottom: '4px' }}>
              <Title order={4} fw={600} c="blue">All Expenses</Title>
              <ChevronDown size={16} color="#3b82f6" />
            </Group>
          </Group>
          <Group gap="xs">
            <Button 
              leftSection={<Plus size={16} />} 
              color="blue" 
              size="sm"
              onClick={() => onViewChange?.('new-expense')}
            >
              New
            </Button>
            <ActionIcon variant="subtle" color="gray"><Settings size={18} /></ActionIcon>
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={18} /></ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                 <Menu.Item leftSection={<Download size={14} />}>Import Expenses</Menu.Item>
                 <Menu.Item leftSection={<Download size={14} />} style={{ transform: 'rotate(180deg)' }}>Export Expenses</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      {/* Main Content Area */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p="md">
        {!expenses || expenses.length === 0 ? (
          <Center h="100%" style={{ flexDirection: 'column' }}>
            <Stack align="center" gap="lg" maw={800} w="100%">
               <Stack gap={5} align="center">
                 <Title order={3} fw={400}>Time To Manage Your Expenses!</Title>
                 <Text size="sm" c="dimmed" ta="center">Create and manage expenses that are part of your organization's operating costs.</Text>
               </Stack>
               <Group mt="md">
                 <Button color="blue" size="md" radius="sm" onClick={() => onViewChange?.('new-expense')}>RECORD EXPENSE</Button>
               </Group>
               <Button variant="transparent" size="sm" color="blue">Import Expenses</Button>

               <Box mt={rem(60)} w="100%">
                 <Title order={5} ta="center" fw={500} mb="xl">Life cycle of an Expense</Title>
                 
                 {/* CSS Lifecycle Diagram */}
                 <Center>
                   <Group gap="xl" align="center" wrap="nowrap">
                      {/* Step 1 */}
                      <Box style={{ border: '1px solid #93c5fd', borderRadius: '4px', padding: '8px 16px', background: 'white' }}>
                        <Group gap="xs">
                          <Receipt size={16} color="#3b82f6" />
                          <Text size="xs" fw={600} c="dimmed">EXPENSE INCURRED</Text>
                        </Group>
                      </Box>

                      {/* Arrow */}
                      <Box style={{ flex: 1, height: '2px', background: '#93c5fd', borderStyle: 'dashed' }} />

                      {/* Step 2 */}
                      <Box style={{ border: '1px solid #93c5fd', borderRadius: '4px', padding: '8px 16px', background: 'white' }}>
                        <Group gap="xs">
                          <CreditCard size={16} color="#3b82f6" />
                          <Text size="xs" fw={600} c="dimmed">RECORD EXPENSE</Text>
                        </Group>
                      </Box>

                      {/* Split Arrow */}
                      <Box style={{ position: 'relative', width: '50px', height: '100px' }}>
                         <Box style={{ position: 'absolute', top: '50%', left: 0, width: '20px', height: '2px', background: '#93c5fd', borderStyle: 'dashed' }} />
                         <Box style={{ position: 'absolute', top: '20%', left: '20px', width: '2px', height: '60%', background: '#93c5fd', borderStyle: 'dashed' }} />
                         <Box style={{ position: 'absolute', top: '20%', left: '20px', width: '30px', height: '2px', background: '#93c5fd', borderStyle: 'dashed' }} />
                         <Box style={{ position: 'absolute', bottom: '20%', left: '20px', width: '30px', height: '2px', background: '#93c5fd', borderStyle: 'dashed' }} />
                      </Box>

                      <Stack gap="xl" justify="space-between" h={100}>
                        {/* Step 3 Top */}
                        <Group gap="xl" wrap="nowrap">
                          <Box style={{ border: '1px solid #93c5fd', borderRadius: '4px', padding: '8px 16px', background: 'white' }}>
                            <Group gap="xs">
                              <Receipt size={16} color="#22c55e" />
                              <Text size="xs" fw={600} c="dimmed">BILLABLE</Text>
                            </Group>
                          </Box>
                          
                          <Box style={{ width: '40px', height: '2px', background: '#93c5fd', borderStyle: 'dashed' }} />
                          
                          <Box style={{ border: '1px solid #93c5fd', borderRadius: '4px', padding: '8px 16px', background: 'white' }}>
                            <Group gap="xs">
                              <FileText size={16} color="#3b82f6" />
                              <Text size="xs" fw={600} c="dimmed">CONVERT TO INVOICE</Text>
                            </Group>
                          </Box>
                          
                          <Box style={{ width: '40px', height: '2px', background: '#93c5fd', borderStyle: 'dashed' }} />
                          
                          <Box style={{ border: '1px solid #93c5fd', borderRadius: '4px', padding: '8px 16px', background: 'white' }}>
                            <Group gap="xs">
                              <Box style={{ border: '1px solid #22c55e', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text size={rem(10)} fw={700} c="green">$</Text>
                              </Box>
                              <Text size="xs" fw={600} c="dimmed">GET REIMBURSED</Text>
                            </Group>
                          </Box>
                        </Group>

                        {/* Step 3 Bottom */}
                        <Box style={{ border: '1px solid #93c5fd', borderRadius: '4px', padding: '8px 16px', background: 'white', alignSelf: 'flex-start' }}>
                          <Group gap="xs">
                            <Receipt size={16} color="#ef4444" />
                            <Text size="xs" fw={600} c="dimmed">NON-BILLABLE</Text>
                          </Group>
                        </Box>
                      </Stack>
                   </Group>
                 </Center>
               </Box>
            </Stack>
          </Center>
        ) : (
          <Paper withBorder radius="md">
            {/* Toolbar when data exists */}
            <Box p="xs" px="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
               <Group justify="space-between">
                  <Group gap="xs">
                     <TextInput 
                        placeholder="Search in Expenses (/)" 
                        size="xs" 
                        w={250}
                        leftSection={<Search size={14} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                     />
                     <ActionIcon variant="subtle" color="gray"><Filter size={16} /></ActionIcon>
                  </Group>
                  <Group gap="xs">
                     <ActionIcon variant="subtle" color="gray"><List size={16} /></ActionIcon>
                  </Group>
               </Group>
            </Box>

            <Table verticalSpacing="md" highlightOnHover>
              <Table.Thead bg="#f8f9fa">
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}><TextInput type="checkbox" size="xs" /></Table.Th>
                  <Table.Th>DATE</Table.Th>
                  <Table.Th>CATEGORY</Table.Th>
                  <Table.Th>REFERENCE#</Table.Th>
                  <Table.Th>CUSTOMER</Table.Th>
                  <Table.Th>STATUS</Table.Th>
                  <Table.Th ta="right">AMOUNT</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {expenses.map((expense: any) => (
                  <Table.Tr key={expense.id} style={{ cursor: 'pointer' }}>
                    <Table.Td><TextInput type="checkbox" size="xs" /></Table.Td>
                    <Table.Td>
                      <Text size="sm">{expense.date.toISOString().split('T')[0]}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="blue" fw={500}>{expense.category}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{expense.reference || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{expense.customerId || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="gray" variant="light">Non-Billable</Badge>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={600}>₹{expense.amount.toFixed(2)}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
