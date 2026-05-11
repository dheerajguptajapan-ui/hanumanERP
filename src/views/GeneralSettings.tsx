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
  Checkbox,
  ScrollArea,
  Divider,
  Radio,
  Select,
  NumberInput,
  ActionIcon,
  Tooltip,
  Anchor,
  Table,
  Switch
} from '@mantine/core';
import { 
  Search, 
  ChevronLeft, 
  Settings as SettingsIcon,
  X,
  Info
} from 'lucide-react';
import { db, type Settings } from '../db';
import { notifications } from '@mantine/notifications';

interface GeneralSettingsProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export function GeneralSettings({ onBack, onNavigate }: GeneralSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Partial<Settings>>({
    enabledModules: ['salesReceipts', 'retainerInvoices'],
    attachPDF: true,
    discountType: 'transaction',
    discountOption: 'before-tax',
    stockTrackingMode: 'accounting',
    showSalesperson: true,
    additionalCharges: ['Adjustments', 'Shipping Charges'],
    taxInclusive: 'exclusive',
    roundOffTax: 'transaction',
    salesRounding: 'none',
    printPreferences: 'I will choose while printing',
    documentCopyLabels: {
      two: ['ORIGINAL', 'DUPLICATE'],
      three: ['ORIGINAL', 'DUPLICATE', 'TRIPLICATE'],
      five: ['ORIGINAL', 'DUPLICATE', 'TRIPLICATE', 'QUADRUPLICATE', 'QUINTUPLICATE']
    },
    addressFormat: '${ORGANIZATION.CITY} ${ORGANIZATION.STATE}\n${ORGANIZATION.POSTAL_CODE}\n${ORGANIZATION.COUNTRY}'
  });

  useEffect(() => {
    db.settings.toCollection().first().then(saved => {
      if (saved) {
        setSettings(prev => ({ ...prev, ...saved }));
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    const existing = await db.settings.toCollection().first();
    if (existing) {
      await db.settings.update(existing.id!, settings);
    } else {
      await db.settings.add({ ...settings, id: 1 } as any);
    }
    notifications.show({
      title: 'Success',
      message: 'General settings saved successfully',
      color: 'green'
    });
  };

  const toggleModule = (mod: string) => {
    const mods = settings.enabledModules || [];
    if (mods.includes(mod)) {
      setSettings({ ...settings, enabledModules: mods.filter(m => m !== mod) });
    } else {
      setSettings({ ...settings, enabledModules: [...mods, mod] });
    }
  };

  if (loading) return null;

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
               <Box p={6} bg="orange.0" style={{ borderRadius: '4px' }}>
                  <SettingsIcon size={20} color="#f76707" />
               </Box>
               <Stack gap={0}>
                  <Group gap={4}>
                     <ActionIcon variant="subtle" color="gray" size="sm" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                     <Text fw={700} size="sm">All Settings</Text>
                  </Group>
                  <Text size="xs" c="dimmed">jhakkasdheeraj</Text>
               </Stack>
            </Group>

            <Box style={{ flex: 1, maxWidth: 500 }} mx="xl">
               <TextInput 
                  placeholder="Search settings (/)" 
                  leftSection={<Search size={14} />} 
                  size="sm"
                  styles={{ input: { backgroundColor: '#f1f3f5', border: 'none' } }}
               />
            </Box>

            <Button 
               variant="subtle" 
               color="red" 
               size="xs" 
               rightSection={<X size={14} />}
               onClick={onBack}
            >
               Close Settings
            </Button>
         </Group>
      </Box>

      <Group align="flex-start" gap={0} style={{ flex: 1, overflow: 'hidden' }} wrap="nowrap">
        {/* Settings Sidebar */}
        <Box w={240} h="100%" bg="#f8f9fa" style={{ borderRight: '1px solid #e2e8f0' }} p="md">
           <Stack gap="xs">
              <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Organization Settings</Text>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('org-profile')}>
                 <Text size="sm" c="gray.7">Profile</Text>
              </Box>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('branding')}>
                 <Text size="sm" c="gray.7">Branding</Text>
              </Box>
              
              <Text size="xs" fw={700} c="dimmed" mt="md" mb="xs" tt="uppercase">Users & Roles</Text>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('users')}>
                 <Text size="sm" c="gray.7">Users</Text>
              </Box>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('roles')}>
                 <Text size="sm" c="gray.7">Roles</Text>
              </Box>

              <Text size="xs" fw={700} c="dimmed" mt="md" mb="xs" tt="uppercase">Setup & Config</Text>
              <Box p={8} bg="blue.0" style={{ borderRadius: '4px', cursor: 'pointer' }}>
                 <Text size="sm" fw={600} c="blue">General</Text>
              </Box>
              <Box p={8} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onNavigate?.('taxes')}>
                 <Text size="sm" c="gray.7">Taxes</Text>
              </Box>
           </Stack>
        </Box>

        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }} h="100%">
          <ScrollArea style={{ flex: 1 }} p="xl" bg="#f8f9fa">
            <Stack gap={30} maw={800} mx="auto">
            <Paper p="xl" radius="md" withBorder bg="white">
               <Stack gap="xl">
                  <Title order={4} fw={600}>General</Title>
                  
                  <Stack gap="md">
                     <Text size="sm" fw={500}>Select the modules you would like to enable.</Text>
                     <Stack gap="xs">
                        <Checkbox label="Sales Receipts" checked={settings.enabledModules?.includes('salesReceipts')} onChange={() => toggleModule('salesReceipts')} />
                        <Checkbox label="Retainer Invoices" checked={settings.enabledModules?.includes('retainerInvoices')} onChange={() => toggleModule('retainerInvoices')} />
                        <Checkbox label="Picklists" checked={settings.enabledModules?.includes('picklists')} onChange={() => toggleModule('picklists')} />
                        <Checkbox label="Stock Counts" checked={settings.enabledModules?.includes('stockCounts')} onChange={() => toggleModule('stockCounts')} />
                        <Checkbox label="Tasks" checked={settings.enabledModules?.includes('tasks')} onChange={() => toggleModule('tasks')} />
                        <Checkbox label="Self Billed Invoice" checked={settings.enabledModules?.includes('selfBilledInvoice')} onChange={() => toggleModule('selfBilledInvoice')} />
                     </Stack>
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={500}>PDF Attachment</Text>
                     <Stack gap="xs">
                        <Checkbox 
                           label="Attach an invoice PDF to email notifications which contain invoice payment links." 
                           checked={settings.attachPDF} 
                           onChange={(e) => setSettings({ ...settings, attachPDF: e.currentTarget.checked })} 
                        />
                        <Checkbox 
                          label="I would like to encrypt the PDF files that I send." 
                          checked={settings.encryptPDF}
                          onChange={(e) => setSettings({ ...settings, encryptPDF: e.currentTarget.checked })}
                        />
                        <Text size="xs" c="dimmed" pl={28}>This will ensure that the PDF files cannot be edited or converted into another file format</Text>
                     </Stack>
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={500}>Do you give discounts?</Text>
                     <Radio.Group value={settings.discountType} onChange={(val: any) => setSettings({ ...settings, discountType: val })}>
                        <Stack gap="xs">
                           <Radio value="none" label="I don't give discounts" />
                           <Radio value="line-item" label="At Line Item Level" />
                           <Radio value="transaction" label="At Transaction Level" />
                        </Stack>
                     </Radio.Group>
                     {settings.discountType === 'transaction' && (
                        <Box pl={28}>
                           <Select 
                              data={[{ value: 'before-tax', label: 'Discount Before Tax' }, { value: 'after-tax', label: 'Discount After Tax' }]} 
                              value={settings.discountOption} 
                              onChange={(val: any) => setSettings({ ...settings, discountOption: val })}
                              size="sm"
                              maw={250}
                           />
                        </Box>
                     )}
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={500}>Select any additional charges you'll like to add</Text>
                     <Stack gap="xs">
                        <Checkbox label="Adjustments" checked={settings.additionalCharges?.includes('Adjustments')} />
                        <Checkbox label="Shipping Charges" checked={settings.additionalCharges?.includes('Shipping Charges')} />
                        <Box pl={28}>
                           <Checkbox label="Enable tax automation for shipping charges" />
                           <Text size="xs" c="dimmed" mt={5}>
                              Once enabled, the tax rate associated with a customer will be applied to the shipping charge in a transaction. If a tax rate is not associated to a customer, the tax rate will be applied to the shipping charge based on the option you select below. <Anchor size="xs">How does it work?</Anchor>
                           </Text>
                        </Box>
                     </Stack>
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={500}>Do you sell your items at rates inclusive of Tax?</Text>
                     <Radio.Group value={settings.taxInclusive} onChange={(val: any) => setSettings({ ...settings, taxInclusive: val })}>
                        <Stack gap="xs">
                           <Radio value="inclusive" label="Tax Inclusive" />
                           <Radio value="exclusive" label="Tax Exclusive" />
                           <Box pl={28}>
                              <Group gap="xs">
                                 <Text size="sm">Round Off Tax</Text>
                                 <Tooltip label="Round off the tax amount at transaction level.">
                                    <Info size={14} color="gray" />
                                 </Tooltip>
                              </Group>
                              <Select 
                                data={['transaction', 'line-item']} 
                                value={settings.roundOffTax} 
                                onChange={(val: any) => setSettings({ ...settings, roundOffTax: val })}
                                size="sm" 
                                maw={250} 
                                mt={5} 
                              />
                           </Box>
                           <Radio value="both" label="Tax Inclusive or Tax Exclusive" />
                        </Stack>
                     </Radio.Group>
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={500}>Rounding off in Sales Transactions</Text>
                     <Radio.Group value={settings.salesRounding} onChange={(val: any) => setSettings({ ...settings, salesRounding: val })}>
                        <Stack gap="xs">
                           <Radio value="none" label="No Rounding" />
                           <Radio value="whole" label="Round off the total to the nearest whole number" />
                           <Radio value="incremental" label="Round off the total to the nearest incremental value" />
                        </Stack>
                     </Radio.Group>
                  </Stack>

                  <Divider />

                  <Checkbox 
                    label="I want to add a field for salesperson" 
                    checked={settings.showSalesperson} 
                    onChange={(e) => setSettings({ ...settings, showSalesperson: e.currentTarget.checked })}
                  />

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={600}>{`${'Profit Margin'}`}</Text>
                     <Checkbox 
                       label="Enable Profit Margin estimation at line item and transaction level." 
                       checked={settings.enableProfitMargin}
                       onChange={(e) => setSettings({ ...settings, enableProfitMargin: e.currentTarget.checked })}
                     />
                     <Text size="xs" c="dimmed" pl={28}>
                        Once enabled, a profit margin estimate will be shown for each line item in the items table, as well as for the overall transaction <Anchor size="xs">Learn More.</Anchor>
                     </Text>
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={500}>Billable Bills and Expenses</Text>
                     <Group gap="xs">
                        <Text size="sm">Default Markup Percentage</Text>
                        <Tooltip label="Default markup for billable expenses.">
                           <Info size={14} color="gray" />
                        </Tooltip>
                     </Group>
                     <NumberInput 
                       rightSection={<Text size="xs" c="dimmed">%</Text>} 
                       maw={150} 
                       value={settings.markupPercentage}
                       onChange={(val: any) => setSettings({ ...settings, markupPercentage: val })}
                     />
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Text size="sm" fw={500}>Mode of Stock tracking</Text>
                     <Radio.Group value={settings.stockTrackingMode} onChange={(val: any) => setSettings({ ...settings, stockTrackingMode: val })}>
                        <Stack gap="xs">
                           <Radio value="physical" label="Physical Stock - The stock on hand will be calculated based on Receives & Shipments" />
                           <Radio value="accounting" label="Accounting Stock - The stock on hand will be calculated based on Bills & Invoices" />
                        </Stack>
                     </Radio.Group>
                     <Paper p="sm" bg="orange.0" radius="sm">
                        <Text size="xs">The physical stock gets updated automatically when you raise <b>standalone bills and invoices.</b> <Anchor size="xs">Change</Anchor></Text>
                     </Paper>
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                     <Group gap="xs">
                        <Text size="sm" fw={500}>Document copy label</Text>
                        <Tooltip label="Set labels for printed copies.">
                           <Info size={14} color="gray" />
                        </Tooltip>
                     </Group>
                     <Paper withBorder radius="sm">
                        <Table verticalSpacing="xs" withColumnBorders>
                           <Table.Thead bg="gray.0">
                              <Table.Tr>
                                 <Table.Th />
                                 <Table.Th><Text size="xs" fw={700} tt="uppercase" ta="center">ORIGINAL</Text></Table.Th>
                                 <Table.Th><Text size="xs" fw={700} tt="uppercase" ta="center">DUPLICATE</Text></Table.Th>
                                 <Table.Th><Text size="xs" fw={700} tt="uppercase" ta="center">TRIPLICATE</Text></Table.Th>
                                 <Table.Th><Text size="xs" fw={700} tt="uppercase" ta="center">QUADRUPLICATE</Text></Table.Th>
                                 <Table.Th><Text size="xs" fw={700} tt="uppercase" ta="center">QUINTUPLICATE</Text></Table.Th>
                              </Table.Tr>
                           </Table.Thead>
                           <Table.Tbody>
                              <Table.Tr>
                                 <Table.Td><Text size="xs">Two Copies</Text></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.two?.[0]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.two?.[1]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td /><Table.Td /><Table.Td />
                              </Table.Tr>
                              <Table.Tr>
                                 <Table.Td><Text size="xs">Three Copies</Text></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.three?.[0]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.three?.[1]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.three?.[2]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td /><Table.Td />
                              </Table.Tr>
                              <Table.Tr>
                                 <Table.Td><Text size="xs">Four/Five Copies</Text></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.five?.[0]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.five?.[1]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.five?.[2]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.five?.[3]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                                 <Table.Td><TextInput size="xs" value={settings.documentCopyLabels?.five?.[4]} styles={{ input: { textAlign: 'center' } }} /></Table.Td>
                              </Table.Tr>
                           </Table.Tbody>
                        </Table>
                     </Paper>
                     <Group justify="space-between" bg="gray.0" p="xs" style={{ borderRadius: '4px' }}>
                        <Text size="sm">Default print preferences</Text>
                        <Select 
                          data={['I will choose while printing', 'Original Only']} 
                          value={settings.printPreferences} 
                          onChange={(val: any) => setSettings({ ...settings, printPreferences: val })}
                          size="xs" 
                          maw={250} 
                        />
                     </Group>
                  </Stack>

                  <Divider />

                  <Group justify="space-between">
                     <Stack gap={0}>
                        <Text size="sm" fw={500}>Payment Retention</Text>
                        <Text size="xs" c="dimmed">Enable this option to allow your customers to retain a part of their total invoice amount. <Anchor size="xs">How does it work?</Anchor></Text>
                     </Stack>
                     <Group gap="xs">
                        <Text size="xs" c="dimmed">{settings.paymentRetention ? 'Enabled' : 'Disabled'}</Text>
                        <Switch 
                          checked={settings.paymentRetention} 
                          onChange={(e) => setSettings({ ...settings, paymentRetention: e.currentTarget.checked })}
                        />
                     </Group>
                  </Group>

                  <Divider />

                  <Stack gap="md">
                     <Group gap="xs">
                        <Text size="sm" fw={500}>Organization Address Format <Text span c="dimmed" fw={400}>(Displayed in PDF only)</Text></Text>
                        <Tooltip label="Set how the organization address appears on PDFs.">
                           <Info size={14} color="gray" />
                        </Tooltip>
                     </Group>
                     <Paper withBorder radius="sm" p={0}>
                        <Box p="xs" style={{ borderBottom: '1px solid #e2e8f0' }}>
                           <Group justify="space-between">
                              <Select 
                                 placeholder="Insert Placeholders" 
                                 data={['${ORGANIZATION.CITY}', '${ORGANIZATION.STATE}', '${ORGANIZATION.POSTAL_CODE}', '${ORGANIZATION.COUNTRY}']} 
                                 size="xs"
                                 variant="unstyled"
                                 maw={150}
                                 onChange={(val) => setSettings({ ...settings, addressFormat: `${settings.addressFormat || ''} ${val}` })}
                              />
                              <Anchor size="xs">Preview</Anchor>
                           </Group>
                        </Box>
                        <Box p="md">
                           <Text size="sm" c="gray.7" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                              {settings.addressFormat}
                           </Text>
                        </Box>
                     </Paper>
                  </Stack>

                  <Divider />

                  <Button color="red" w="fit-content" onClick={handleSave}>Save</Button>
               </Stack>
            </Paper>
         </Stack>
          </ScrollArea>
        </Box>
      </Group>
    </Box>
  );
}
