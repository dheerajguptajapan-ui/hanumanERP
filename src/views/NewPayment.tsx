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
  Checkbox,
  Title,
  Anchor,
  Divider,
  ActionIcon,
  Radio,
  Table,
  ScrollArea,
  rem,
  FileButton,
  Paper
} from '@mantine/core';
import { ChevronDown, X, Settings, Info, Calendar, Upload } from 'lucide-react';

interface NewPaymentProps {
  opened: boolean;
  onClose: () => void;
}

export function NewPayment({ opened, onClose }: NewPaymentProps) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      size="100%" 
      fullScreen
      transitionProps={{ transition: 'slide-up' }}
      title={<Title order={4} fw={400} c="gray.7">Record Payment</Title>}
      padding={0}
      styles={{
        header: { borderBottom: '1px solid #e2e8f0', padding: '15px 20px' },
        body: { height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }} p="xl">
        <Box maw={1200} mx="auto">
           {/* Main Form Card */}
           <Paper p={30} radius="sm" withBorder bg="white">
              <Stack gap="lg">
                 <Group align="center">
                    <Text size="sm" w={200} c="red">Customer Name*</Text>
                    <Select 
                       data={['gupta industeria', 'Atul Hardware', 'Global Solutions']} 
                       defaultValue="gupta industeria"
                       style={{ flex: 1, maxWidth: 500 }} 
                       rightSection={<ChevronDown size={14} />}
                    />
                    <Box bg="gray.8" p={4} px={12} style={{ borderRadius: '4px', cursor: 'pointer' }} ml="md">
                       <Group gap={4}>
                          <Text size="xs" c="white" fw={500}>gupta industeria's De...</Text>
                          <ChevronDown size={12} color="white" />
                       </Group>
                    </Box>
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200} c="red">Amount Received*</Text>
                    <TextInput 
                       leftSection={<Text size="xs" fw={700}>JPY</Text>}
                       style={{ flex: 1, maxWidth: 500 }} 
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200}>Bank Charges (if any)</Text>
                    <TextInput 
                       style={{ flex: 1, maxWidth: 500 }} 
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200} c="red">Payment Date*</Text>
                    <TextInput 
                       defaultValue="2026/05/11"
                       style={{ flex: 1, maxWidth: 500 }} 
                       rightSection={<Calendar size={14} color="gray" />}
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200} c="red">Payment #*</Text>
                    <TextInput 
                       defaultValue="2"
                       style={{ flex: 1, maxWidth: 500 }} 
                       rightSection={<Settings size={14} color="blue" />}
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200}>Payment Mode</Text>
                    <Select 
                       data={['Cash', 'Bank Transfer', 'Cheque']} 
                       defaultValue="Cash"
                       style={{ flex: 1, maxWidth: 500 }} 
                       rightSection={<ChevronDown size={14} />}
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200} c="red">Deposit To*</Text>
                    <Select 
                       data={['Petty Cash', 'Bank Account', 'Undeposited Funds']} 
                       defaultValue="Petty Cash"
                       style={{ flex: 1, maxWidth: 500 }} 
                       rightSection={<ChevronDown size={14} />}
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200}>Reference#</Text>
                    <TextInput 
                       style={{ flex: 1, maxWidth: 500 }} 
                    />
                 </Group>

                 <Group align="center">
                    <Text size="sm" w={200}>Tax deducted?</Text>
                    <Group gap="xl">
                       <Radio label="No Tax deducted" value="no" checked color="blue" size="sm" />
                       <Radio label="Yes, TDS" value="yes" color="blue" size="sm" />
                    </Group>
                 </Group>
              </Stack>
           </Paper>

           {/* Unpaid Invoices Table */}
           <Box mt={40}>
              <Group justify="space-between" mb="md">
                 <Group gap="sm">
                    <Title order={5}>Unpaid Invoices</Title>
                    <Select 
                       size="xs" 
                       placeholder="Filter by Date Range" 
                       data={['Last 30 Days', 'This Month']} 
                       w={160}
                       leftSection={<Calendar size={12} />}
                    />
                 </Group>
                 <Anchor size="xs" c="blue">Clear Applied Amount</Anchor>
              </Group>

              <Paper withBorder radius="xs" bg="white">
                 <Table verticalSpacing="sm">
                    <Table.Thead bg="gray.0">
                       <Table.Tr>
                          <Table.Th><Text size="xs" fw={700}>DATE</Text></Table.Th>
                          <Table.Th><Text size="xs" fw={700}>INVOICE NUMBER</Text></Table.Th>
                          <Table.Th><Text size="xs" fw={700}>INVOICE AMOUNT</Text></Table.Th>
                          <Table.Th><Text size="xs" fw={700}>AMOUNT DUE</Text></Table.Th>
                          <Table.Th><Group gap={4}><Text size="xs" fw={700}>PAYMENT RECEIVED ON</Text><Info size={10} /></Group></Table.Th>
                          <Table.Th ta="right"><Text size="xs" fw={700}>PAYMENT</Text></Table.Th>
                       </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                       <Table.Tr>
                          <Table.Td colSpan={6} py={60}>
                             <Stack align="center" gap="xs">
                                <Text size="sm" c="dimmed">There are no unpaid invoices associated with this customer.</Text>
                             </Stack>
                          </Table.Td>
                       </Table.Tr>
                    </Table.Tbody>
                    <Table.Tfoot bg="white" style={{ borderTop: '1px solid #e2e8f0' }}>
                       <Table.Tr>
                          <Table.Td colSpan={3}><Text size="xs" fw={500} c="dimmed">**List contains only SENT Invoices</Text></Table.Td>
                          <Table.Td ta="right"><Text size="xs" fw={700}>Total</Text></Table.Td>
                          <Table.Td />
                          <Table.Td ta="right"><Text size="xs" fw={700}>0</Text></Table.Td>
                       </Table.Tr>
                    </Table.Tfoot>
                 </Table>
              </Paper>
           </Box>

           {/* Totals Section */}
           <Group justify="flex-end" mt="xl">
              <Paper p="xl" withBorder radius="sm" bg="blue.0" w={400} style={{ border: 'none', backgroundColor: '#f0f4f8' }}>
                 <Stack gap="sm">
                    <Group justify="space-between">
                       <Text size="sm">Amount Received :</Text>
                       <Text size="sm" fw={600}>0</Text>
                    </Group>
                    <Group justify="space-between">
                       <Text size="sm">Amount used for Payments :</Text>
                       <Text size="sm" fw={600}>0</Text>
                    </Group>
                    <Group justify="space-between">
                       <Text size="sm">Amount Refunded :</Text>
                       <Text size="sm" fw={600}>0</Text>
                    </Group>
                    <Group justify="space-between" c="red">
                       <Group gap={4}>
                          <Info size={14} />
                          <Text size="sm" fw={600}>Amount in Excess:</Text>
                       </Group>
                       <Text size="sm" fw={600}>¥ 0</Text>
                    </Group>
                 </Stack>
              </Paper>
           </Group>

           {/* Bottom Details */}
           <Stack gap="xl" mt={40}>
              <Stack gap="xs">
                 <Text size="sm">Notes (Internal use. Not visible to customer)</Text>
                 <Textarea placeholder="" minRows={3} radius="xs" />
              </Stack>

              <Stack gap="xs">
                 <Text size="sm" fw={500}>Attachments</Text>
                 <Group gap="xs">
                    <FileButton onChange={setFile} accept="image/png,image/jpeg">
                       {(props) => (
                          <Button {...props} variant="default" size="xs" leftSection={<Upload size={14} />}>
                             Upload File
                          </Button>
                       )}
                    </FileButton>
                    <ChevronDown size={14} color="gray" />
                 </Group>
                 <Text size="xs" c="dimmed">You can upload a maximum of 5 files, 5MB each</Text>
              </Stack>

              <Stack gap="xs">
                 <Checkbox label={<Text size="sm">Send a "Thank you" note for this payment</Text>} color="blue" checked />
                 <Box ml={25}>
                    <Checkbox label={<Text size="sm">pankaj gupta &lt;gupta@gmail.com&gt;</Text>} color="blue" checked />
                 </Box>
              </Stack>

              <Text size="xs" c="dimmed" fs="italic">
                 Additional Fields: Start adding custom fields for your payments received by going to Settings → Sales → Payments Received.
              </Text>
           </Stack>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box p="md" bg="white" style={{ borderTop: '1px solid #e2e8f0' }}>
        <Group justify="flex-start" gap="sm">
          <Button variant="default" color="gray" radius="xs" size="sm" px={30} onClick={onClose}>Save as Draft</Button>
          <Button color="blue" radius="xs" size="sm" px={30} onClick={onClose}>Save as Paid</Button>
          <Button variant="default" color="gray" radius="xs" size="sm" px={30} onClick={onClose}>Cancel</Button>
        </Group>
      </Box>
    </Modal>
  );
}
