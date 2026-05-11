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
  Checkbox,
  Tabs,
  ActionIcon,
  rem,
  UnstyledButton,
  Grid,
  Divider,
  Table,
  ScrollArea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { X, HelpCircle, Mail, Phone, Upload, Plus, FileText } from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';
import { INDIAN_STATES } from '../utils';
import { validateGSTIN, validatePAN } from '../utils/gstValidator';

interface NewCustomerProps {
  onClose: () => void;
  editingId?: number;
}

export function NewCustomer({ onClose, editingId }: NewCustomerProps) {
  const [activeTab, setActiveTab] = useState<string | null>('other_details');

  const form = useForm({
    initialValues: {
      customerType: 'Business',
      salutation: 'Salutation',
      firstName: '',
      lastName: '',
      companyName: '',
      displayName: '',
      email: '',
      workPhone: '',
      mobilePhone: '',
      language: 'English',
      taxRate: '',
      companyId: '',
      currency: '₹- Indian Rupee',
      paymentTerms: 'Due on Receipt',
      enablePortal: false,
      gstin: '',
      pan: '',
      registrationType: 'Regular',
      
      // Billing Address
      billingAttention: '',
      billingCountry: 'India',
      billingLine1: '',
      billingLine2: '',
      billingCity: '',
      billingState: '',
      billingPincode: '',
      billingPhone: '',
      billingFax: '',

      // Shipping Address
      shippingAttention: '',
      shippingCountry: 'India',
      shippingLine1: '',
      shippingLine2: '',
      shippingCity: '',
      shippingState: '',
      shippingPincode: '',
      shippingPhone: '',
      shippingFax: '',

      contactPersons: [] as any[],
      attachments: [] as { name: string, base64: string }[],
    },
    validate: {
      displayName: (value) => (value.length < 1 ? 'Display Name is required' : null),
      gstin: (value) => {
        if (!value) return null;
        const result = validateGSTIN(value);
        return result.isValid ? null : result.error;
      },
      pan: (value) => {
        if (!value) return null;
        const result = validatePAN(value);
        return result.isValid ? null : result.error;
      }
    },
  });

  useEffect(() => {
    const loadCustomer = async () => {
      if (editingId) {
        const customer = await db.partners.get(editingId);
        if (customer) {
          form.setValues({
            customerType: customer.customerType || 'Business',
            salutation: 'Mr.', 
            firstName: customer.name.split(' ')[0] || '',
            lastName: customer.name.split(' ').slice(1).join(' ') || '',
            companyName: customer.companyName || '',
            displayName: customer.name,
            email: customer.email || '',
            workPhone: '',
            mobilePhone: customer.phone || '',
            language: 'English',
            taxRate: '',
            companyId: '',
            currency: '₹- Indian Rupee',
            paymentTerms: customer.paymentTerms || 'Due on Receipt',
            enablePortal: false,
            gstin: (customer as any).gstin || '',
            pan: (customer as any).pan || '',
            registrationType: (customer as any).registrationType || 'Regular',
            billingAttention: customer.billingAttention || '',
            billingCountry: customer.billingCountry || 'India',
            billingLine1: customer.billingLine1 || '',
            billingLine2: customer.billingLine2 || '',
            billingCity: customer.billingCity || '',
            billingState: customer.billingState || '',
            billingPincode: customer.billingPincode || '',
            billingPhone: customer.billingPhone || '',
            billingFax: customer.billingFax || '',
            shippingAttention: customer.shippingAttention || '',
            shippingCountry: customer.shippingCountry || 'India',
            shippingLine1: customer.shippingLine1 || '',
            shippingLine2: customer.shippingLine2 || '',
            shippingCity: customer.shippingCity || '',
            shippingState: customer.shippingState || '',
            shippingPincode: customer.shippingPincode || '',
            shippingPhone: customer.shippingPhone || '',
            shippingFax: customer.shippingFax || '',
            contactPersons: customer.contactPersons || [],
            attachments: (customer as any).attachments || [],
          });
        }
      }
    };
    loadCustomer();
  }, [editingId]);

  const handleSave = async (values: typeof form.values) => {
    try {
      const customerData = {
        name: values.displayName,
        phone: values.mobilePhone || values.workPhone,
        email: values.email,
        customerType: values.customerType as any,
        companyName: values.companyName,
        type: 'customer' as const,
        group: 'Retail' as const,
        state: values.billingState || 'Delhi',
        
        billingAttention: values.billingAttention,
        billingCountry: values.billingCountry,
        billingLine1: values.billingLine1,
        billingLine2: values.billingLine2,
        billingCity: values.billingCity,
        billingState: values.billingState,
        billingPincode: values.billingPincode,
        billingPhone: values.billingPhone,
        billingFax: values.billingFax,

        shippingAttention: values.shippingAttention,
        shippingCountry: values.shippingCountry,
        shippingLine1: values.shippingLine1,
        shippingLine2: values.shippingLine2,
        shippingCity: values.shippingCity,
        shippingState: values.shippingState,
        shippingPincode: values.shippingPincode,
        shippingPhone: values.shippingPhone,
        shippingFax: values.shippingFax,

        contactPersons: values.contactPersons,
        currency: values.currency,
        paymentTerms: values.paymentTerms,
        enablePortal: values.enablePortal,
        attachments: values.attachments,
        gstin: values.gstin,
        pan: values.pan,
        registrationType: values.registrationType,
      };

      if (editingId) {
        await db.partners.update(editingId, customerData);
        notifications.show({ title: 'Success', message: 'Customer updated successfully', color: 'green' });
      } else {
        await db.partners.add(customerData);
        notifications.show({ title: 'Success', message: 'Customer created successfully', color: 'green' });
      }
      onClose();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to save customer', color: 'red' });
    }
  };

  const copyBillingToShipping = () => {
    form.setFieldValue('shippingAttention', form.values.billingAttention);
    form.setFieldValue('shippingCountry', form.values.billingCountry);
    form.setFieldValue('shippingLine1', form.values.billingLine1);
    form.setFieldValue('shippingLine2', form.values.billingLine2);
    form.setFieldValue('shippingCity', form.values.billingCity);
    form.setFieldValue('shippingState', form.values.billingState);
    form.setFieldValue('shippingPincode', form.values.billingPincode);
    form.setFieldValue('shippingPhone', form.values.billingPhone);
    form.setFieldValue('shippingFax', form.values.billingFax);
  };

  const addContactPerson = () => {
    form.insertListItem('contactPersons', {
      salutation: 'Mr.',
      firstName: '',
      lastName: '',
      email: '',
      workPhone: '',
      mobile: ''
    });
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <Group justify="space-between">
          <Title order={3} fw={500}>New Customer</Title>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}>
            <X size={20} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto' }} p="xl">
        <Box maw={1200} mx="auto">
          <form onSubmit={form.onSubmit(handleSave)}>
            <Stack gap="xl">
              <Box>
                {/* Customer Type */}
                <Grid align="center" mb="md">
                  <Grid.Col span={2}>
                    <Group gap="xs">
                      <Text size="sm">Customer Type</Text>
                      <HelpCircle size={14} color="#adb5bd" />
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <Radio.Group {...form.getInputProps('customerType')}>
                      <Group>
                        <Radio value="Business" label="Business" />
                        <Radio value="Individual" label="Individual" />
                      </Group>
                    </Radio.Group>
                  </Grid.Col>
                </Grid>

                {/* Primary Contact */}
                <Grid align="center" mb="md">
                  <Grid.Col span={2}>
                    <Group gap="xs">
                      <Text size="sm">Primary Contact</Text>
                      <HelpCircle size={14} color="#adb5bd" />
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <Group gap="sm" grow>
                      <Select 
                        data={['Salutation', 'Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.']} 
                        {...form.getInputProps('salutation')}
                        maw={120}
                      />
                      <TextInput placeholder="First Name" {...form.getInputProps('firstName')} />
                      <TextInput placeholder="Last Name" {...form.getInputProps('lastName')} />
                    </Group>
                  </Grid.Col>
                </Grid>

                {/* Company Name */}
                <Grid align="center" mb="md">
                  <Grid.Col span={2}>
                    <Text size="sm">Company Name</Text>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <TextInput {...form.getInputProps('companyName')} />
                  </Grid.Col>
                </Grid>

                {/* Display Name */}
                <Grid align="center" mb="md">
                  <Grid.Col span={2}>
                    <Group gap="xs">
                      <Text size="sm" c="red">Display Name*</Text>
                      <HelpCircle size={14} color="#adb5bd" />
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <TextInput 
                      placeholder="Display Name" 
                      required
                      {...form.getInputProps('displayName')}
                    />
                  </Grid.Col>
                </Grid>

                {/* Email Address */}
                <Grid align="center" mb="md">
                  <Grid.Col span={2}>
                    <Group gap="xs">
                      <Text size="sm">Email Address</Text>
                      <HelpCircle size={14} color="#adb5bd" />
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <TextInput 
                      leftSection={<Mail size={16} color="#adb5bd" />} 
                      {...form.getInputProps('email')} 
                    />
                  </Grid.Col>
                </Grid>

                {/* Phone */}
                <Grid align="center" mb="md">
                  <Grid.Col span={2}>
                    <Group gap="xs">
                      <Text size="sm">Phone</Text>
                      <HelpCircle size={14} color="#adb5bd" />
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <Group grow>
                      <Group gap={0}>
                        <Select data={['+91', '+1', '+81']} defaultValue="+91" w={80} styles={{ input: { borderRadius: '4px 0 0 4px', borderRight: 'none' } }} />
                        <TextInput placeholder="Work Phone" style={{ flex: 1 }} styles={{ input: { borderRadius: '0 4px 4px 0' } }} {...form.getInputProps('workPhone')} />
                      </Group>
                      <Group gap={0}>
                        <Select data={['+91', '+1', '+81']} defaultValue="+91" w={80} styles={{ input: { borderRadius: '4px 0 0 4px', borderRight: 'none' } }} />
                        <TextInput placeholder="Mobile" style={{ flex: 1 }} styles={{ input: { borderRadius: '0 4px 4px 0' } }} {...form.getInputProps('mobilePhone')} />
                      </Group>
                    </Group>
                  </Grid.Col>
                </Grid>

                {/* Language */}
                <Grid align="center" mb="md">
                  <Grid.Col span={2}>
                    <Group gap="xs">
                      <Text size="sm">Customer Language</Text>
                      <HelpCircle size={14} color="#adb5bd" />
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <Select 
                      data={['English', 'Japanese', 'Hindi']} 
                      {...form.getInputProps('language')} 
                      maw={300}
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              {/* Tabs Section */}
              <Box mt="xl">
                <Tabs value={activeTab} onChange={setActiveTab} styles={{
                  tab: { paddingBottom: rem(12) },
                  list: { borderBottom: '1px solid #e2e8f0' }
                }}>
                  <Tabs.List>
                    <Tabs.Tab value="other_details">Other Details</Tabs.Tab>
                    <Tabs.Tab value="address">Address</Tabs.Tab>
                    <Tabs.Tab value="contact_persons">Contact Persons</Tabs.Tab>
                    <Tabs.Tab value="custom_fields">Custom Fields</Tabs.Tab>
                    <Tabs.Tab value="reporting_tags">Reporting Tags</Tabs.Tab>
                    <Tabs.Tab value="remarks">Remarks</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="other_details" pt="xl">
                    <Stack gap="lg">
                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Text size="sm">Tax Rate</Text>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <Select placeholder="Select a Tax" data={['GST 18%', 'GST 12%', 'GST 5%', 'GST 0%']} maw={400} />
                        </Grid.Col>
                      </Grid>

                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Group gap="xs">
                            <Text size="sm">Company ID</Text>
                            <HelpCircle size={14} color="#adb5bd" />
                          </Group>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <TextInput {...form.getInputProps('companyId')} maw={400} />
                        </Grid.Col>
                      </Grid>

                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Text size="sm">GSTIN</Text>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <TextInput placeholder="15-digit GSTIN" {...form.getInputProps('gstin')} maw={400} onChange={(e) => form.setFieldValue('gstin', e.target.value.toUpperCase())} />
                        </Grid.Col>
                      </Grid>

                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Text size="sm">PAN</Text>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <TextInput placeholder="10-digit PAN" {...form.getInputProps('pan')} maw={400} onChange={(e) => form.setFieldValue('pan', e.target.value.toUpperCase())} />
                        </Grid.Col>
                      </Grid>

                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Text size="sm">Registration Type</Text>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <Select 
                            data={['Regular', 'Composition', 'Consumer', 'Unregistered', 'SEZ']} 
                            {...form.getInputProps('registrationType')} 
                            maw={400} 
                          />
                        </Grid.Col>
                      </Grid>

                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Text size="sm">Currency</Text>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <Select data={['₹- Indian Rupee', 'JPY- Japanese Yen', 'USD- US Dollar']} {...form.getInputProps('currency')} maw={400} />
                        </Grid.Col>
                      </Grid>

                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Text size="sm">Payment Terms</Text>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <Select data={['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60']} {...form.getInputProps('paymentTerms')} maw={400} />
                        </Grid.Col>
                      </Grid>

                      <Grid align="center">
                        <Grid.Col span={2}>
                          <Group gap="xs">
                            <Text size="sm">Enable Portal?</Text>
                            <HelpCircle size={14} color="#adb5bd" />
                          </Group>
                        </Grid.Col>
                        <Grid.Col span={10}>
                          <Checkbox label="Allow portal access for this customer" {...form.getInputProps('enablePortal', { type: 'checkbox' })} />
                        </Grid.Col>
                      </Grid>
                    </Stack>
                  </Tabs.Panel>
                  
                  <Tabs.Panel value="address" pt="xl">
                    <Grid gutter="xl">
                      <Grid.Col span={6}>
                        <Title order={5} mb="lg">Billing Address</Title>
                        <Stack gap="sm">
                          <TextInput label="Attention" {...form.getInputProps('billingAttention')} />
                          <Select label="Country/Region" data={['India', 'Japan', 'USA']} {...form.getInputProps('billingCountry')} />
                          <TextInput label="Address" placeholder="Street 1" {...form.getInputProps('billingLine1')} />
                          <TextInput placeholder="Street 2" {...form.getInputProps('billingLine2')} />
                          <TextInput label="City" {...form.getInputProps('billingCity')} />
                          <Select label="State" data={INDIAN_STATES} searchable {...form.getInputProps('billingState')} />
                          <TextInput label="ZIP Code" {...form.getInputProps('billingPincode')} />
                          <TextInput label="Phone" {...form.getInputProps('billingPhone')} />
                          <TextInput label="Fax Number" {...form.getInputProps('billingFax')} />
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Group justify="space-between" mb="lg">
                          <Title order={5}>Shipping Address</Title>
                          <Button variant="subtle" size="xs" onClick={copyBillingToShipping}>Copy billing address</Button>
                        </Group>
                        <Stack gap="sm">
                          <TextInput label="Attention" {...form.getInputProps('shippingAttention')} />
                          <Select label="Country/Region" data={['India', 'Japan', 'USA']} {...form.getInputProps('shippingCountry')} />
                          <TextInput label="Address" placeholder="Street 1" {...form.getInputProps('shippingLine1')} />
                          <TextInput placeholder="Street 2" {...form.getInputProps('shippingLine2')} />
                          <TextInput label="City" {...form.getInputProps('shippingCity')} />
                          <Select label="State" data={INDIAN_STATES} searchable {...form.getInputProps('shippingState')} />
                          <TextInput label="ZIP Code" {...form.getInputProps('shippingPincode')} />
                          <TextInput label="Phone" {...form.getInputProps('shippingPhone')} />
                          <TextInput label="Fax Number" {...form.getInputProps('shippingFax')} />
                        </Stack>
                      </Grid.Col>
                    </Grid>
                  </Tabs.Panel>

                  <Tabs.Panel value="contact_persons" pt="xl">
                    <Table verticalSpacing="sm">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>SALUTATION</Table.Th>
                          <Table.Th>FIRST NAME</Table.Th>
                          <Table.Th>LAST NAME</Table.Th>
                          <Table.Th>EMAIL ADDRESS</Table.Th>
                          <Table.Th>WORK PHONE</Table.Th>
                          <Table.Th>MOBILE</Table.Th>
                          <Table.Th />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {form.values.contactPersons.map((_, index) => (
                          <Table.Tr key={index}>
                            <Table.Td>
                              <Select data={['Mr.', 'Mrs.', 'Ms.', 'Dr.']} {...form.getInputProps(`contactPersons.${index}.salutation`)} />
                            </Table.Td>
                            <Table.Td>
                              <TextInput {...form.getInputProps(`contactPersons.${index}.firstName`)} />
                            </Table.Td>
                            <Table.Td>
                              <TextInput {...form.getInputProps(`contactPersons.${index}.lastName`)} />
                            </Table.Td>
                            <Table.Td>
                              <TextInput {...form.getInputProps(`contactPersons.${index}.email`)} />
                            </Table.Td>
                            <Table.Td>
                              <TextInput {...form.getInputProps(`contactPersons.${index}.workPhone`)} />
                            </Table.Td>
                            <Table.Td>
                              <TextInput {...form.getInputProps(`contactPersons.${index}.mobile`)} />
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon color="red" variant="subtle" onClick={() => form.removeListItem('contactPersons', index)}>
                                <X size={16} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                    <Button variant="subtle" leftSection={<Plus size={16} />} mt="md" onClick={addContactPerson}>
                      Add Contact Person
                    </Button>
                  </Tabs.Panel>
                  
                  <Tabs.Panel value="remarks" pt="xl">
                    <Stack gap="md">
                      <Box>
                        <Text size="sm" fw={500} mb="xs">Attachments</Text>
                        <Paper withBorder p="md" radius="md">
                          <Stack gap="xs">
                            {form.values.attachments.map((file, idx) => (
                              <Group key={idx} justify="space-between" bg="gray.0" p="xs" style={{ borderRadius: '4px' }}>
                                <Group gap="xs">
                                  <FileText size={16} color="#64748b" />
                                  <Text size="sm">{file.name}</Text>
                                </Group>
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => form.removeListItem('attachments', idx)}>
                                  <X size={14} />
                                </ActionIcon>
                              </Group>
                            ))}
                            <Button 
                              variant="light" 
                              leftSection={<Upload size={16} />} 
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.onchange = (e: any) => {
                                  Array.from(e.target.files).forEach((file: any) => {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      form.insertListItem('attachments', {
                                        name: file.name,
                                        base64: event.target?.result as string
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                };
                                input.click();
                              }}
                            >
                              Upload Documents
                            </Button>
                            <Text size="xs" c="dimmed">Upload tax docs, agreements or other files.</Text>
                          </Stack>
                        </Paper>
                      </Box>
                    </Stack>
                  </Tabs.Panel>
                </Tabs>
              </Box>
            </Stack>

            {/* Sticky Footer Actions */}
            <Box py="md" mt="xl" style={{ borderTop: '1px solid #e2e8f0' }}>
              <Group>
                <Button type="submit" color="indigo" radius="md">Save</Button>
                <Button variant="outline" color="gray" radius="md" onClick={onClose}>Cancel</Button>
              </Group>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
