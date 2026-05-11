import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Group, 
  Text, 
  Stack, 
  TextInput, 
  Select, 
  Textarea, 
  Box, 
  Title,
  Divider,
  ActionIcon,
  Anchor,
  Table,
  rem,
  NumberInput,
  Paper
} from '@mantine/core';
import { ChevronDown, X, Settings, Info, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface NewCreditNoteProps {
  opened: boolean;
  onClose: () => void;
}

export function NewCreditNote({ opened, onClose }: NewCreditNoteProps) {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      size="100%" 
      fullScreen
      transitionProps={{ transition: 'slide-up' }}
      title={<Title order={4} fw={600}>New Credit Note</Title>}
      padding={0}
      styles={{
        header: { borderBottom: '1px solid #e2e8f0', padding: '15px 20px' },
        body: { height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }} p="xl">
        <Box maw={1200} mx="auto">
           <Paper p={30} radius="sm" withBorder bg="white">
              <Stack gap="lg">
                 <Group align="center">
                    <Text size="sm" w={200} c="red">Customer Name*</Text>
                    <Group gap={0} style={{ flex: 1, maxWidth: 500 }}>
                       <Select 
                          placeholder="Select or add a customer"
                          data={['gupta industeria', 'Atul Hardware', 'Global Solutions']} 
                          style={{ flex: 1 }} 
                          rightSection={<ChevronDown size={14} />}
                       />
                       <ActionIcon variant="filled" color="blue" size={36} radius={0} style={{ borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}>
                          <Search size={16} />
                       </ActionIcon>
                    </Group>
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200} c="red">Credit Note#*</Text>
                    <TextInput 
                       defaultValue="CN-00001"
                       style={{ flex: 1, maxWidth: 500 }} 
                       rightSection={<Settings size={14} color="blue" />}
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200}>Reference#</Text>
                    <TextInput 
                       style={{ flex: 1, maxWidth: 500 }} 
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200} c="red">Credit Note Date*</Text>
                    <TextInput 
                       defaultValue="2026/05/11"
                       style={{ flex: 1, maxWidth: 500 }} 
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200}>Salesperson</Text>
                    <Select 
                       placeholder="Select or Add Salesperson"
                       data={['System Admin', 'John Doe']} 
                       style={{ flex: 1, maxWidth: 500 }} 
                       rightSection={<ChevronDown size={14} />}
                    />
                 </Group>

                 <Group align="flex-start">
                    <Group gap={4} w={200}>
                       <Text size="sm">Subject</Text>
                       <Info size={14} color="gray" />
                    </Group>
                    <Textarea 
                       placeholder="Let your customer know what this Credit Note is for" 
                       minRows={2}
                       style={{ flex: 1, maxWidth: 500 }} 
                    />
                 </Group>
              </Stack>

              {/* Item Table */}
              <Box mt={40}>
                 <Group justify="space-between" mb="xs">
                    <Title order={5}>Item Table</Title>
                    <Button variant="subtle" size="xs" leftSection={<CheckCircle2 size={14} />}>Bulk Actions</Button>
                 </Group>
                 
                 <Paper withBorder radius="xs">
                    <Table verticalSpacing="sm">
                       <Table.Thead bg="gray.0">
                          <Table.Tr>
                             <Table.Th><Text size="xs" fw={700}>ITEM DETAILS</Text></Table.Th>
                             <Table.Th><Text size="xs" fw={700}>ACCOUNT</Text></Table.Th>
                             <Table.Th ta="right"><Text size="xs" fw={700}>QUANTITY</Text></Table.Th>
                             <Table.Th ta="right"><Text size="xs" fw={700}>RATE</Text></Table.Th>
                             <Table.Th><Text size="xs" fw={700}>TAX</Text></Table.Th>
                             <Table.Th ta="right"><Text size="xs" fw={700}>AMOUNT</Text></Table.Th>
                          </Table.Tr>
                       </Table.Thead>
                       <Table.Tbody>
                          <Table.Tr>
                             <Table.Td>
                                <Group gap="sm">
                                   <Box w={40} h={40} bg="gray.1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                      <Search size={18} color="#adb5bd" />
                                   </Box>
                                   <Text size="xs" c="dimmed">Type or click to select an item.</Text>
                                </Group>
                             </Table.Td>
                             <Table.Td>
                                <Select 
                                   defaultValue="Select an account"
                                   data={['Sales', 'Inventory', 'Other Income']} 
                                   variant="unstyled"
                                   size="xs"
                                   rightSection={<ChevronDown size={12} />}
                                />
                             </Table.Td>
                             <Table.Td ta="right">
                                <Text size="xs">1.00</Text>
                             </Table.Td>
                             <Table.Td ta="right">
                                <Text size="xs">0.00</Text>
                             </Table.Td>
                             <Table.Td>
                                <Select 
                                   placeholder="Select a Tax"
                                   data={['GST (0%)', 'GST (5%)', 'GST (18%)']} 
                                   variant="unstyled"
                                   size="xs"
                                   rightSection={<ChevronDown size={12} />}
                                />
                             </Table.Td>
                             <Table.Td ta="right">
                                <Text size="xs" fw={700}>0</Text>
                             </Table.Td>
                          </Table.Tr>
                       </Table.Tbody>
                    </Table>
                 </Paper>

                 <Group mt="md" gap="sm">
                    <Button variant="filled" color="blue" size="xs" leftSection={<Plus size={14} />}>Add New Row</Button>
                    <Button variant="default" size="xs">Add Items in Bulk</Button>
                 </Group>
              </Box>

              <Group align="flex-start" mt={40} justify="space-between">
                 <Stack gap="xl" style={{ flex: 1, maxWidth: 500 }}>
                    <Stack gap="xs">
                       <Text size="sm">Customer Notes</Text>
                       <Textarea placeholder="Will be displayed on the credit note" minRows={3} />
                    </Stack>
                    <Stack gap="xs">
                       <Text size="sm">Terms & Conditions</Text>
                       <Textarea placeholder="Enter the terms and conditions of your business to be displayed in your transaction" minRows={4} />
                    </Stack>
                 </Stack>

                 <Paper p="xl" withBorder radius="sm" bg="gray.0" w={450}>
                    <Stack gap="md">
                       <Group justify="space-between">
                          <Text size="sm" fw={700}>Sub Total</Text>
                          <Text size="sm">0</Text>
                       </Group>
                       <Group justify="space-between">
                          <Group gap="xs">
                             <Text size="sm">Discount</Text>
                             <Group gap={0}>
                                <TextInput size="xs" w={60} defaultValue="0" ta="right" />
                                <Box bg="white" p={4} px={8} style={{ border: '1px solid #ced4da', borderLeft: 0 }}>%</Box>
                             </Group>
                          </Group>
                          <Text size="sm">0</Text>
                       </Group>
                       <Group justify="space-between">
                          <Group gap="xs">
                             <Text size="sm">Shipping Charges</Text>
                             <ActionIcon variant="subtle" size="xs"><Info size={12} /></ActionIcon>
                          </Group>
                          <TextInput size="xs" w={100} ta="right" defaultValue="0" />
                       </Group>
                       <Group justify="space-between">
                          <Group gap="xs">
                             <Text size="sm">Adjustment</Text>
                             <ActionIcon variant="subtle" size="xs"><Info size={12} /></ActionIcon>
                          </Group>
                          <TextInput size="xs" w={100} ta="right" defaultValue="0" />
                       </Group>
                       <Divider />
                       <Group justify="space-between">
                          <Text fw={700} size="lg">Total ( ¥ )</Text>
                          <Text fw={700} size="lg">0</Text>
                       </Group>
                    </Stack>
                 </Paper>
              </Group>
           </Paper>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box p="md" bg="white" style={{ borderTop: '1px solid #e2e8f0' }}>
        <Group justify="flex-start" gap="sm">
          <Button variant="default" color="gray" radius="xs" size="sm" px={30} onClick={onClose}>Save as Draft</Button>
          <Button color="blue" radius="xs" size="sm" px={30} onClick={onClose}>Save as Open</Button>
          <Button variant="default" color="gray" radius="xs" size="sm" px={30} onClick={onClose}>Cancel</Button>
          <Box style={{ flex: 1 }} />
          <Text size="xs" c="dimmed">PDF Template: 'Standard Template' <Anchor size="xs">Change</Anchor></Text>
        </Group>
      </Box>
    </Modal>
  );
}

