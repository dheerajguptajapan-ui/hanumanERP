import React, { useState } from 'react';
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Table,
  TextInput,
  ActionIcon,
  Badge,
  Paper,
  Alert,
  NumberInput,
  Divider,
  Tooltip,
} from '@mantine/core';
import { Save, RefreshCw, Info, Hash } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type NumberSeries } from '../db';
import { notifications } from '@mantine/notifications';
import { DEFAULT_NUMBER_SERIES, formatDocNumber } from '../utils/numberSeries';

interface TransactionNumberSeriesProps {
  onNavigate?: (view: string) => void;
}

export function TransactionNumberSeries({ onNavigate }: TransactionNumberSeriesProps) {
  const series = useLiveQuery(() => db.numberSeries.orderBy('docType').toArray()) || [];
  const [editing, setEditing] = useState<Record<number, Partial<NumberSeries>>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const getEditValue = (id: number, field: keyof NumberSeries, defaultVal: any) => {
    return editing[id]?.[field] ?? defaultVal;
  };

  const setEditValue = (id: number, field: keyof NumberSeries, value: any) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSave = async (s: NumberSeries) => {
    if (!s.id) return;
    const changes = editing[s.id];
    if (!changes) return;

    const prefix = (changes.prefix ?? s.prefix).trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(prefix)) {
      notifications.show({
        title: 'Invalid Prefix',
        message: 'Prefix must be exactly 4 uppercase letters (e.g. INVX)',
        color: 'red'
      });
      return;
    }

    setSaving(s.id);
    try {
      await db.numberSeries.update(s.id, {
        prefix,
        nextNumber: changes.nextNumber ?? s.nextNumber,
        padLength: changes.padLength ?? s.padLength,
      });
      setEditing(prev => { const copy = { ...prev }; delete copy[s.id!]; return copy; });
      notifications.show({ title: 'Saved', message: `Number series for "${s.label}" updated.`, color: 'green' });
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Failed to save series.', color: 'red' });
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async (s: NumberSeries) => {
    if (!s.id) return;
    const def = DEFAULT_NUMBER_SERIES.find(d => d.docType === s.docType);
    if (!def) return;
    await db.numberSeries.update(s.id, { prefix: def.prefix, nextNumber: 1, padLength: 6 });
    setEditing(prev => { const copy = { ...prev }; delete copy[s.id!]; return copy; });
    notifications.show({ title: 'Reset', message: `${s.label} series reset to default.`, color: 'blue' });
  };

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Box>
          <Group gap="sm" mb={4}>
            <Hash size={20} color="#228be6" />
            <Title order={3} fw={600}>Transaction Number Series</Title>
          </Group>
          <Text size="sm" c="dimmed">
            Configure the prefix and numbering format for all business documents.
          </Text>
        </Box>
      </Group>

      <Alert icon={<Info size={16} />} color="blue" variant="light" mb="xl">
        <Text size="sm">
          Format: <strong>XXXX-000000</strong> — 4 uppercase letters, a hyphen, then a 6-digit zero-padded number.
          Example: <strong>GUPT-000001</strong>. Changing the prefix only affects <em>new</em> documents.
        </Text>
      </Alert>

      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Table verticalSpacing="md" horizontalSpacing="xl">
          <Table.Thead bg="#f8f9fa">
            <Table.Tr>
              <Table.Th>Document Type</Table.Th>
              <Table.Th>Prefix (4 letters)</Table.Th>
              <Table.Th>Next Number</Table.Th>
              <Table.Th>Preview</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {series.map(s => {
              const isDirty = !!editing[s.id!];
              const previewPrefix = (editing[s.id!]?.prefix ?? s.prefix).toUpperCase();
              const previewNum = editing[s.id!]?.nextNumber ?? s.nextNumber;
              const previewPad = editing[s.id!]?.padLength ?? s.padLength;
              const preview = formatDocNumber(previewPrefix, previewNum, previewPad);

              return (
                <Table.Tr key={s.id} style={{ backgroundColor: isDirty ? '#fff9db' : undefined }}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={600}>{s.label}</Text>
                      <Text size="xs" c="dimmed">{s.docType}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      value={getEditValue(s.id!, 'prefix', s.prefix)}
                      onChange={(e) => setEditValue(s.id!, 'prefix', e.target.value.toUpperCase().slice(0, 4))}
                      placeholder="e.g. INVX"
                      maxLength={4}
                      styles={{
                        input: {
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          width: 90,
                          textTransform: 'uppercase'
                        }
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={getEditValue(s.id!, 'nextNumber', s.nextNumber)}
                      onChange={(val) => setEditValue(s.id!, 'nextNumber', Number(val))}
                      min={1}
                      step={1}
                      w={120}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color="blue" size="lg" style={{ fontFamily: 'monospace' }}>
                      {preview}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        leftSection={<Save size={12} />}
                        onClick={() => handleSave(s)}
                        disabled={!isDirty}
                        loading={saving === s.id}
                        color="blue"
                      >
                        Save
                      </Button>
                      <Tooltip label="Reset to default">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => handleReset(s)}
                        >
                          <RefreshCw size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper withBorder p="xl" radius="md" mt="xl" bg="gray.0">
        <Stack gap="xs">
          <Text size="sm" fw={700}>💡 Tips</Text>
          <Divider />
          <Text size="sm">• Changing the prefix will not rename existing documents — only new ones will use the new prefix.</Text>
          <Text size="sm">• The "Next Number" can be set to any value — useful when migrating from another system.</Text>
          <Text size="sm">• Numbers are generated atomically — no two documents will ever receive the same number, even if created simultaneously.</Text>
        </Stack>
      </Paper>
    </Box>
  );
}
