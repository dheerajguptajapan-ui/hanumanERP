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
  Modal
} from '@mantine/core';
import { 
  ChevronLeft, 
  Plus, 
  Trash2,
  Clock
} from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

export function PaymentTermsSettings({ onBack }: { onBack: () => void }) {
  const [terms, setTerms] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTerm, setNewTerm] = useState({ label: 'Net 30', days: 30 });

  useEffect(() => {
    db.settings.toCollection().first().then(s => {
      if (s?.paymentTerms) {
        setTerms(s.paymentTerms);
      } else {
        const initial = [
          { label: 'Due on Receipt', days: 0 },
          { label: 'Net 15', days: 15 },
          { label: 'Net 30', days: 30 },
          { label: 'Net 45', days: 45 },
          { label: 'Net 60', days: 60 }
        ];
        setTerms(initial);
        db.settings.toCollection().first().then(existing => {
           if (existing) db.settings.update(existing.id!, { paymentTerms: initial });
        });
      }
    });
  }, []);

  const handleSave = async (updated: any[]) => {
    setTerms(updated);
    const existing = await db.settings.toCollection().first();
    if (existing) {
      await db.settings.update(existing.id!, { paymentTerms: updated });
    }
  };

  const addTerm = () => {
    const updated = [...terms, newTerm];
    handleSave(updated);
    setModalOpen(false);
  };

  const removeTerm = (idx: number) => {
    const updated = terms.filter((_, i) => i !== idx);
    handleSave(updated);
  };

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
       <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
             <Group gap="md">
                <ActionIcon variant="subtle" color="gray" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                <Title order={4}>Payment Terms</Title>
             </Group>
             <Button leftSection={<Plus size={14} />} onClick={() => setModalOpen(true)}>Add New Term</Button>
          </Group>
       </Box>

       <ScrollArea style={{ flex: 1 }} p="xl" bg="#f8f9fa">
          <Stack maw={800} mx="auto">
             <Paper withBorder p="xl" radius="md">
                <Stack gap="xl">
                   <Text size="sm" c="dimmed">Define the standard payment durations for your invoices and bills. These will appear as selectable options during transaction creation.</Text>
                   
                   <Table verticalSpacing="md">
                      <Table.Thead bg="gray.0">
                         <Table.Tr>
                            <Table.Th>Label</Table.Th>
                            <Table.Th>Days</Table.Th>
                            <Table.Th ta="right">Actions</Table.Th>
                         </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                         {terms.map((t, i) => (
                            <Table.Tr key={i}>
                               <Table.Td><Text fw={700}>{t.label}</Text></Table.Td>
                               <Table.Td><Text>{t.days} Days</Text></Table.Td>
                               <Table.Td ta="right">
                                  <ActionIcon variant="subtle" color="red" onClick={() => removeTerm(i)}>
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

       <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Payment Term">
          <Stack>
             <TextInput 
                label="Label" 
                placeholder="e.g. Net 30"
                value={newTerm.label}
                onChange={(e) => setNewTerm({...newTerm, label: e.currentTarget.value})}
             />
             <NumberInput 
                label="Number of Days" 
                value={newTerm.days}
                onChange={(val) => setNewTerm({...newTerm, days: Number(val)})}
             />
             <Button fullWidth mt="md" onClick={addTerm}>Add Payment Term</Button>
          </Stack>
       </Modal>
    </Box>
  );
}
