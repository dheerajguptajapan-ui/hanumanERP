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
  Table,
  Badge,
  Modal,
  Switch,
  Textarea
} from '@mantine/core';
import { 
  ChevronLeft, 
  Plus, 
  Trash2,
  Bell
} from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

export function RemindersSettings({ onBack }: { onBack: () => void }) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({ 
    type: 'invoice', 
    days: 3, 
    subject: 'Payment Reminder: [Invoice Number]', 
    message: 'Dear Customer, this is a reminder regarding your outstanding invoice.',
    active: true 
  });

  useEffect(() => {
    db.settings.toCollection().first().then(s => {
      if (s?.reminders) {
        setReminders(s.reminders);
      } else {
        const initial = [
          { type: 'invoice-due', days: 1, subject: 'Payment Due Tomorrow', message: 'Invoice [Number] is due tomorrow.', active: true },
          { type: 'invoice-overdue', days: 7, subject: 'Payment Overdue', message: 'Invoice [Number] is now 7 days overdue.', active: true }
        ];
        setReminders(initial);
        db.settings.toCollection().first().then(existing => {
           if (existing) db.settings.update(existing.id!, { reminders: initial });
        });
      }
    });
  }, []);

  const handleSave = async (updated: any[]) => {
    setReminders(updated);
    const existing = await db.settings.toCollection().first();
    if (existing) {
      await db.settings.update(existing.id!, { reminders: updated });
    }
  };

  const addReminder = () => {
    const updated = [...reminders, newReminder];
    handleSave(updated);
    setModalOpen(false);
  };

  const removeReminder = (idx: number) => {
    const updated = reminders.filter((_, i) => i !== idx);
    handleSave(updated);
  };

  const toggleReminder = (idx: number) => {
    const updated = [...reminders];
    updated[idx].active = !updated[idx].active;
    handleSave(updated);
  };

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
       <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
             <Group gap="md">
                <ActionIcon variant="subtle" color="gray" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                <Title order={4}>Reminders</Title>
             </Group>
             <Button leftSection={<Plus size={14} />} onClick={() => setModalOpen(true)}>Add Reminder Rule</Button>
          </Group>
       </Box>

       <ScrollArea style={{ flex: 1 }} p="xl" bg="#f8f9fa">
          <Stack maw={800} mx="auto">
             <Paper withBorder p="xl" radius="md">
                <Stack gap="xl">
                   <Text size="sm" c="dimmed">Automate your collection process with scheduled reminders. Notifications will be sent based on invoice due dates.</Text>
                   
                   <Table verticalSpacing="md">
                      <Table.Thead bg="gray.0">
                         <Table.Tr>
                            <Table.Th>Rule Type</Table.Th>
                            <Table.Th>Days Offset</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th ta="right">Actions</Table.Th>
                         </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                         {reminders.map((r, i) => (
                            <Table.Tr key={i}>
                               <Table.Td><Text fw={700} tt="capitalize">{r.type.replace('-', ' ')}</Text></Table.Td>
                               <Table.Td><Text>{r.days} Days</Text></Table.Td>
                               <Table.Td>
                                  <Switch checked={r.active} onChange={() => toggleReminder(i)} size="sm" />
                               </Table.Td>
                               <Table.Td ta="right">
                                  <ActionIcon variant="subtle" color="red" onClick={() => removeReminder(i)}>
                                     <Trash2 size={14} />
                                  </ActionIcon>
                               </Table.Td>
                            </Table.Tr>
                         ))}
                      </Table.Tbody>
                   </Table>
                </Stack>
             </Paper>
          </Stack>
       </ScrollArea>

       <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Reminder Rule" size="lg">
          <Stack>
             <TextInput 
                label="Rule Subject" 
                placeholder="e.g. Payment Overdue Reminder"
                value={newReminder.subject}
                onChange={(e) => setNewReminder({...newReminder, subject: e.currentTarget.value})}
             />
             <NumberInput 
                label="Days (Before/After Due Date)" 
                value={newReminder.days}
                onChange={(val) => setNewReminder({...newReminder, days: Number(val)})}
             />
             <Textarea 
                label="Message Body" 
                placeholder="Enter the automated email message..."
                minRows={4}
                value={newReminder.message}
                onChange={(e) => setNewReminder({...newReminder, message: e.currentTarget.value})}
             />
             <Button fullWidth mt="md" onClick={addReminder}>Add Rule</Button>
          </Stack>
       </Modal>
    </Box>
  );
}
