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
  Select
} from '@mantine/core';
import { 
  ChevronLeft, 
  Settings as SettingsIcon,
  X,
  Plus,
  Trash2,
  DollarSign,
  Search
} from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

export function CurrencySettings({ onBack }: { onBack: () => void }) {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ code: 'USD', symbol: '$', exchangeRate: 1, isBase: false });

  useEffect(() => {
    db.settings.toCollection().first().then(s => {
      if (s?.currencies) {
        setCurrencies(s.currencies);
      } else {
        const initial = [{ code: 'INR', symbol: '₹', exchangeRate: 1, isBase: true }];
        setCurrencies(initial);
        db.settings.toCollection().first().then(existing => {
           if (existing) db.settings.update(existing.id!, { currencies: initial });
        });
      }
    });
  }, []);

  const handleSave = async (updated: any[]) => {
    setCurrencies(updated);
    const existing = await db.settings.toCollection().first();
    if (existing) {
      await db.settings.update(existing.id!, { currencies: updated });
    }
  };

  const addCurrency = () => {
    const updated = [...currencies, newCurrency];
    handleSave(updated);
    setModalOpen(false);
  };

  const removeCurrency = (idx: number) => {
    if (currencies[idx].isBase) return;
    const updated = currencies.filter((_, i) => i !== idx);
    handleSave(updated);
  };

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
       <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
             <Group gap="md">
                <ActionIcon variant="subtle" color="gray" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                <Title order={4}>Currencies</Title>
             </Group>
             <Button leftSection={<Plus size={14} />} onClick={() => setModalOpen(true)}>Add New Currency</Button>
          </Group>
       </Box>

       <ScrollArea style={{ flex: 1 }} p="xl" bg="#f8f9fa">
          <Stack maw={800} mx="auto">
             <Paper withBorder p="xl" radius="md">
                <Stack gap="xl">
                   <Text size="sm" c="dimmed">Manage the currencies your business accepts. The base currency is used for all internal accounting.</Text>
                   
                   <Table verticalSpacing="md">
                      <Table.Thead bg="gray.0">
                         <Table.Tr>
                            <Table.Th>Currency Code</Table.Th>
                            <Table.Th>Symbol</Table.Th>
                            <Table.Th>Exchange Rate</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th ta="right">Actions</Table.Th>
                         </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                         {currencies.map((c, i) => (
                            <Table.Tr key={i}>
                               <Table.Td><Text fw={700}>{c.code}</Text></Table.Td>
                               <Table.Td><Text>{c.symbol}</Text></Table.Td>
                               <Table.Td><Text>{c.isBase ? '1.000 (Base)' : c.exchangeRate}</Text></Table.Td>
                               <Table.Td>
                                  {c.isBase ? <Badge color="blue">Base Currency</Badge> : <Badge color="gray">Foreign</Badge>}
                               </Table.Td>
                               <Table.Td ta="right">
                                  {!c.isBase && (
                                     <ActionIcon variant="subtle" color="red" onClick={() => removeCurrency(i)}>
                                        <Trash2 size={14} />
                                     </ActionIcon>
                                  )}
                               </Table.Td>
                            </Table.Tr>
                         ))}
                      </Table.Tbody>
                   </Table>
                </Stack>
             </Paper>
          </Stack>
       </ScrollArea>

       <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Currency">
          <Stack>
             <Select 
                label="Currency Code" 
                data={['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'AED']} 
                value={newCurrency.code}
                onChange={(val: any) => setNewCurrency({...newCurrency, code: val})}
             />
             <TextInput 
                label="Symbol" 
                value={newCurrency.symbol}
                onChange={(e) => setNewCurrency({...newCurrency, symbol: e.currentTarget.value})}
             />
             <NumberInput 
                label="Exchange Rate (to Base)" 
                decimalScale={4}
                value={newCurrency.exchangeRate}
                onChange={(val) => setNewCurrency({...newCurrency, exchangeRate: Number(val)})}
             />
             <Button fullWidth mt="md" onClick={addCurrency}>Add Currency</Button>
          </Stack>
       </Modal>
    </Box>
  );
}
