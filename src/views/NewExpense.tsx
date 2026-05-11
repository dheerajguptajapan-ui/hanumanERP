import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Button, 
  TextInput, 
  Stack,
  Text,
  Select,
  Box,
  Radio,
  Tabs,
  ActionIcon,
  rem,
  Grid,
  Textarea,
  NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, Search, Image as ImageIcon, Upload } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';

interface NewExpenseProps {
  onClose: () => void;
  editingId?: number;
}

const EXPENSE_CATEGORIES = [
  'Advertising And Marketing',
  'Automobile Expense',
  'Bad Debt',
  'Bank Fees and Charges',
  'Consultant Expense',
  'Cost of Goods Sold',
  'Credit Card Charges',
  'Depreciation Expense',
  'IT and Internet Expenses',
  'Janitorial Expense',
  'Lodging',
  'Meals and Entertainment',
  'Office Supplies',
  'Other Expenses',
  'Postage',
  'Printing and Stationery',
  'Purchase Discounts',
  'Rent Expense',
  'Repairs and Maintenance',
  'Salaries and Employee Wages',
  'Telephone Expense'
];

export function NewExpense({ onClose, editingId }: NewExpenseProps) {
  const [activeTab, setActiveTab] = useState<string | null>('record_expense');
  const [vendors, setVendors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const form = useForm({
    initialValues: {
      date: new Date(),
      category: '',
      currency: 'JPY',
      amount: '',
      isTaxInclusive: 'exclusive',
      taxRate: '',
      vendorId: '',
      reference: '',
      notes: '',
      customerId: '',
      attachments: [] as { name: string, base64: string }[],
    },
    validate: {
      category: (value) => (!value ? 'Category is required' : null),
      amount: (value) => (!value || Number(value) <= 0 ? 'Valid amount is required' : null),
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const v = await db.partners.filter(p => p.type === 'supplier' || p.type === 'both').toArray();
      setVendors(v);

      const c = await db.partners.filter(p => p.type === 'customer' || p.type === 'both').toArray();
      setCustomers(c);

      if (editingId) {
        const expense = await db.expenses.get(editingId);
        if (expense) {
          form.setValues({
            date: expense.date,
            category: expense.category,
            currency: 'JPY', // Hardcoded as per screenshot, but should come from settings
            amount: expense.amount.toString(),
            isTaxInclusive: expense.isTaxInclusive ? 'inclusive' : 'exclusive',
            taxRate: expense.taxRate || '',
            vendorId: expense.vendorId?.toString() || '',
            reference: expense.reference || '',
            notes: expense.notes || '',
            customerId: expense.customerId?.toString() || '',
            attachments: expense.attachments || [],
          });
        }
      }
    };
    loadData();
  }, [editingId]);

  const handleSave = async (values: typeof form.values) => {
    try {
      const expenseData = {
        date: values.date,
        category: values.category,
        amount: Number(values.amount),
        isTaxInclusive: values.isTaxInclusive === 'inclusive',
        taxRate: values.taxRate,
        vendorId: values.vendorId ? Number(values.vendorId) : undefined,
        reference: values.reference,
        notes: values.notes,
        customerId: values.customerId ? Number(values.customerId) : undefined,
        attachments: values.attachments,
      };

      if (editingId) {
        await db.expenses.update(editingId, expenseData);
        notifications.show({ title: 'Success', message: 'Expense updated successfully', color: 'green' });
      } else {
        await db.expenses.add(expenseData);
        notifications.show({ title: 'Success', message: 'Expense recorded successfully', color: 'green' });
      }
      onClose();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to save expense', color: 'red' });
    }
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <Group justify="space-between">
          <Title order={3} fw={500}>{editingId ? 'Edit Expense' : 'Record Expense'}</Title>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} px="md" pt="sm" styles={{ list: { borderBottom: '1px solid #e2e8f0' }}}>
        <Tabs.List>
          <Tabs.Tab value="record_expense">Record Expense</Tabs.Tab>
          <Tabs.Tab value="record_mileage">Record Mileage</Tabs.Tab>
          <Tabs.Tab value="bulk_add">Bulk Add Expenses</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p="xl" bg="#f8f9fa">
        <Box maw={1000} mx="auto">
          <Paper withBorder p="xl" radius="md" bg="white">
            <form onSubmit={form.onSubmit(handleSave)}>
              <Grid gutter="xl">
                {/* Left Form Area */}
                <Grid.Col span={8}>
                  <Stack gap="lg">
                    <Grid align="center">
                      <Grid.Col span={3}>
                        <Text size="sm" c="red">Date*</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <DateInput
                          valueFormat="YYYY/MM/DD"
                          placeholder="YYYY/MM/DD"
                          {...form.getInputProps('date')}
                          maw={300}
                        />
                      </Grid.Col>
                    </Grid>

                    <Grid align="flex-start">
                      <Grid.Col span={3} pt={8}>
                        <Text size="sm" c="red">Category Name*</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Select 
                          placeholder="Select Category"
                          data={EXPENSE_CATEGORIES}
                          searchable
                          {...form.getInputProps('category')}
                          maw={300}
                        />
                        <Text size="xs" c="blue" mt={4} style={{ cursor: 'pointer' }}>Itemize</Text>
                      </Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={3}>
                        <Text size="sm" c="red">Amount*</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Group gap={0}>
                          <Select 
                            data={['JPY', 'USD', 'INR']} 
                            {...form.getInputProps('currency')} 
                            w={80} 
                            styles={{ input: { borderRadius: '4px 0 0 4px', borderRight: 'none' } }} 
                          />
                          <TextInput 
                            placeholder="0.00" 
                            style={{ flex: 1, maxWidth: 220 }} 
                            styles={{ input: { borderRadius: '0 4px 4px 0' } }} 
                            {...form.getInputProps('amount')} 
                          />
                        </Group>
                      </Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={3}>
                        <Text size="sm">Amount Is</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Radio.Group {...form.getInputProps('isTaxInclusive')}>
                          <Group mt="xs">
                            <Radio value="inclusive" label="Tax Inclusive" />
                            <Radio value="exclusive" label="Tax Exclusive" />
                          </Group>
                        </Radio.Group>
                      </Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={3}>
                        <Text size="sm">Tax</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Select 
                          placeholder="Select a Tax"
                          data={['GST0 (0%)', 'GST5 (5%)', 'GST12 (12%)', 'GST18 (18%)']}
                          {...form.getInputProps('taxRate')}
                          maw={300}
                        />
                      </Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={3}>
                        <Text size="sm">Vendor</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Group gap="xs" wrap="nowrap">
                          <Select 
                            placeholder="Select a Vendor"
                            data={vendors.map(v => ({ value: v.id.toString(), label: v.name }))}
                            searchable
                            {...form.getInputProps('vendorId')}
                            maw={300}
                            style={{ flex: 1 }}
                          />
                          <ActionIcon color="blue" variant="filled" size="lg"><Search size={16} /></ActionIcon>
                        </Group>
                      </Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={3}>
                        <Text size="sm">Reference#</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <TextInput {...form.getInputProps('reference')} maw={300} />
                      </Grid.Col>
                    </Grid>

                    <Grid align="flex-start">
                      <Grid.Col span={3} pt={8}>
                        <Text size="sm">Notes</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Textarea 
                          placeholder="Max. 500 characters" 
                          autosize 
                          minRows={3} 
                          maxRows={5}
                          {...form.getInputProps('notes')}
                          maw={400}
                        />
                      </Grid.Col>
                    </Grid>

                    <Grid align="center">
                      <Grid.Col span={3}>
                        <Text size="sm">Customer Name</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Group gap="xs" wrap="nowrap">
                          <Select 
                            placeholder="Select or add a customer"
                            data={customers.map(c => ({ value: c.id.toString(), label: c.name }))}
                            searchable
                            {...form.getInputProps('customerId')}
                            maw={300}
                            style={{ flex: 1 }}
                          />
                          <ActionIcon color="blue" variant="filled" size="lg"><Search size={16} /></ActionIcon>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Grid.Col>

                {/* Right Receipt Upload Area */}
                <Grid.Col span={4}>
                  <Box 
                    style={{ 
                      border: '1px dashed #ced4da', 
                      borderRadius: '8px', 
                      padding: '40px 20px', 
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      height: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {form.values.attachments.length > 0 ? (
                      <Stack align="center" gap="sm">
                        <ImageIcon size={48} color="#3b82f6" />
                        <Text size="sm" fw={500}>{form.values.attachments.length} file(s) attached</Text>
                        <Button 
                          variant="light" 
                          color="red" 
                          size="xs" 
                          onClick={() => form.setFieldValue('attachments', [])}
                        >
                          Clear
                        </Button>
                      </Stack>
                    ) : (
                      <>
                        <Box mb="md">
                           {/* Decorative Icon matching screenshot */}
                           <Box style={{ background: '#1e3a8a', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                              <ImageIcon size={32} color="white" />
                           </Box>
                        </Box>
                        <Text fw={600} size="sm">Drag or Drop your Receipts</Text>
                        <Text size="xs" c="dimmed" mb="lg">Maximum file size allowed is 10MB</Text>
                        <Button 
                          variant="light" 
                          color="gray"
                          leftSection={<Upload size={16} />}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.onchange = (e: any) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  form.setFieldValue('attachments', [{
                                    name: file.name,
                                    base64: event.target?.result as string
                                  }]);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          Upload your Files
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid.Col>
              </Grid>

              {/* Action Buttons */}
              <Group mt="xl" pt="xl" style={{ borderTop: '1px solid #e2e8f0' }}>
                <Button type="submit" color="blue">Save (Alt+S)</Button>
                <Button variant="default">Save and New (Alt+N)</Button>
                <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
              </Group>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
