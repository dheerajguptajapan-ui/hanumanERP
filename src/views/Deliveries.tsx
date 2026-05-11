import React from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Stack, 
  Text, 
  Badge,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { Truck, Eye, Printer, PackageCheck } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function Deliveries() {
  const deliveries = useLiveQuery(() => 
    db.deliveryNotes.orderBy('date').reverse().toArray()
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Dispatch & Delivery Notes</Title>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>DN #</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>SO Reference</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th align="right">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {deliveries?.map((dn) => (
              <Table.Tr key={dn.id}>
                <Table.Td fw={500}>DN-{dn.id?.toString().padStart(4, '0')}</Table.Td>
                <Table.Td>{dn.customerName}</Table.Td>
                <Table.Td>{new Date(dn.date).toLocaleDateString()}</Table.Td>
                <Table.Td>SO-{dn.salesOrderId.toString().padStart(4, '0')}</Table.Td>
                <Table.Td>
                  <Badge color="blue" variant="light" leftSection={<Truck size={12} />}>
                    {dn.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={5} justify="flex-end">
                    <Tooltip label="View Picking List"><ActionIcon variant="subtle" color="gray"><Eye size={16} /></ActionIcon></Tooltip>
                    <Tooltip label="Print Delivery Challan"><ActionIcon variant="subtle" color="blue"><Printer size={16} /></ActionIcon></Tooltip>
                    <Tooltip label="Mark as Delivered"><ActionIcon variant="light" color="green"><PackageCheck size={16} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {(!deliveries || deliveries.length === 0) && (
              <Table.Tr><Table.Td colSpan={6} align="center"><Text c="dimmed" py="xl">No deliveries in progress</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
