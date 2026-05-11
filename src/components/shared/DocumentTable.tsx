import React from 'react';
import { 
  Table, 
  Group, 
  ActionIcon, 
  Select, 
  NumberInput, 
  Text,
  Box,
  Paper
} from '@mantine/core';
import { Trash2, Image as ImageIcon } from 'lucide-react';

export interface LineItem {
  productId: string | number;
  productName?: string;
  quantity: number;
  rate: number;
  tax: string;
  amount: number;
}

interface DocumentTableProps {
  items: LineItem[];
  products: any[];
  onItemChange: (index: number, field: keyof LineItem, value: any) => void;
  onRemoveItem: (index: number) => void;
  taxOptions?: { value: string; label: string }[];
}

export function DocumentTable({ 
  items, 
  products, 
  onItemChange, 
  onRemoveItem,
  taxOptions = [
    { value: '0', label: 'GST0 (0%)' },
    { value: '5', label: 'GST5 (5%)' },
    { value: '12', label: 'GST12 (12%)' },
    { value: '18', label: 'GST18 (18%)' }
  ]
}: DocumentTableProps) {
  return (
    <Paper withBorder>
      <Table>
        <Table.Thead bg="#f8f9fa">
          <Table.Tr>
            <Table.Th style={{ width: 400 }}>ITEM DETAILS</Table.Th>
            <Table.Th style={{ width: 100 }}>QUANTITY</Table.Th>
            <Table.Th style={{ width: 120 }}>RATE</Table.Th>
            <Table.Th style={{ width: 120 }}>TAX</Table.Th>
            <Table.Th ta="right" style={{ width: 120 }}>AMOUNT</Table.Th>
            <Table.Th style={{ width: 40 }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Group wrap="nowrap" gap="xs">
                  <ActionIcon variant="light" color="gray" size="lg"><ImageIcon size={16} /></ActionIcon>
                  <Select 
                    placeholder="Type or click to select an item."
                    data={products.map(p => ({ value: p.id.toString(), label: p.name }))}
                    searchable
                    variant="unstyled"
                    w="100%"
                    value={item.productId.toString()}
                    onChange={(val) => {
                      const product = products.find(p => p.id.toString() === val);
                      if (product) {
                        onItemChange(index, 'productId', val);
                        onItemChange(index, 'productName', product.name);
                        onItemChange(index, 'rate', product.purchasePrice || product.price || 0);
                      }
                    }}
                  />
                </Group>
              </Table.Td>
              <Table.Td>
                <NumberInput 
                  value={item.quantity} 
                  onChange={(val) => onItemChange(index, 'quantity', Number(val))}
                  min={1}
                  variant="unstyled"
                  hideControls
                />
              </Table.Td>
              <Table.Td>
                <NumberInput 
                  value={item.rate} 
                  onChange={(val) => onItemChange(index, 'rate', Number(val))}
                  min={0}
                  variant="unstyled"
                  decimalScale={2}
                  hideControls
                />
              </Table.Td>
              <Table.Td>
                <Select 
                  data={taxOptions}
                  value={item.tax}
                  onChange={(val) => onItemChange(index, 'tax', val)}
                  variant="unstyled"
                />
              </Table.Td>
              <Table.Td ta="right">
                <Text size="sm" fw={500}>{(item.quantity * item.rate).toFixed(2)}</Text>
              </Table.Td>
              <Table.Td>
                <ActionIcon 
                  color="red" 
                  variant="subtle" 
                  onClick={() => onRemoveItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
