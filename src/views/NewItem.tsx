import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Button, 
  TextInput, 
  NumberInput,
  Stack,
  Text,
  Select,
  Box,
  Radio,
  Checkbox,
  Textarea,
  SimpleGrid,
  Divider,
  ActionIcon,
  rem,
  UnstyledButton,
  Flex,
  Grid,
  Modal,
  Combobox,
  useCombobox,
  InputBase,
  Input,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { X, Upload, Plus, HelpCircle, Folder, Tag, Factory, FileText, Settings as SettingsIcon } from 'lucide-react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { notifications } from '@mantine/notifications';

const TAX_OPTIONS = [
  { label: 'GST 5% (CGST 2.5% + SGST 2.5%)', value: 'gst5' },
  { label: 'GST 12% (CGST 6% + SGST 6%)', value: 'gst12' },
  { label: 'GST 18% (CGST 9% + SGST 9%)', value: 'gst18' },
  { label: 'GST 28% (CGST 14% + SGST 14%)', value: 'gst28' },
  { label: 'IGST 5%', value: 'igst5' },
  { label: 'IGST 12%', value: 'igst12' },
  { label: 'IGST 18%', value: 'igst18' },
  { label: 'IGST 28%', value: 'igst28' },
  { label: 'Non-Taxable', value: 'none' },
];

interface NewItemProps {
  onClose: () => void;
  editingId?: number;
  isCloning?: boolean;
}

export function NewItem({ onClose, editingId, isCloning }: NewItemProps) {
  const [manageCatOpened, { open: openManageCat, close: closeManageCat }] = useDisclosure(false);
  const [manageBrandOpened, { open: openManageBrand, close: closeManageBrand }] = useDisclosure(false);
  const [manageMfgOpened, { open: openManageMfg, close: closeManageMfg }] = useDisclosure(false);

  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddMfg, setShowAddMfg] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [parentCatId, setParentCatId] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [newMfgName, setNewMfgName] = useState('');

  const categories = useLiveQuery(() => db.categories.toArray());
  const brands = useLiveQuery(() => db.brands.toArray());
  const manufacturers = useLiveQuery(() => db.manufacturers.toArray());
  const vendors = useLiveQuery(() => db.partners.where('type').equals('Supplier').toArray());

  const [images, setImages] = useState<{front?: string, rear?: string, others: string[]}>({ others: [] });
  const frontInputRef = React.useRef<HTMLInputElement>(null);
  const rearInputRef = React.useRef<HTMLInputElement>(null);
  const othersInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'rear' | 'others') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'front') setImages(prev => ({ ...prev, front: dataUrl }));
      else if (type === 'rear') setImages(prev => ({ ...prev, rear: dataUrl }));
      else setImages(prev => ({ ...prev, others: [...prev.others, dataUrl] }));
    };
    reader.readAsDataURL(file);
  };

  const salesAccounts = [
    { group: 'Income', items: ['Discount', 'General Income', 'Interest Income', 'Late Fee Income', 'Other Charges', 'Sales'] }
  ];

  const purchaseAccounts = [
    { group: 'Expense', items: ['Advertising and Marketing', 'Automobile Expense', 'Bad Debt', 'Bank Fees and Charges', 'Consultant Expense', 'Cost of Goods Sold', 'Depreciation Expense'] }
  ];

  const inventoryAccounts = [
    { group: 'Stock', items: ['Inventory Asset'] }
  ];

  const catCombobox = useCombobox();
  const brandCombobox = useCombobox();
  const mfgCombobox = useCombobox();

  const form = useForm({
    initialValues: {
      name: '',
      type: 'Goods',
      category: '',
      brand: '',
      manufacturer: '',
      itemType: 'Single Item',
      unit: '',
      sku: '',
      hsnCode: '',
      description: '',
      salesPrice: 0,
      salesAccount: 'Sales',
      costPrice: 0,
      purchaseAccount: 'Cost of Goods Sold',
      trackInventory: true,
      inventoryAccount: 'Inventory Asset',
      valuationMethod: 'FIFO (First In, First Out)',
      reorderPoint: 0,
      returnable: 'Yes',
      length: 0,
      width: 0,
      height: 0,
      dimensionUnit: 'cm',
      weight: 0,
      weightUnit: 'kg',
      preferredVendor: '',
      taxType: 'gst18',
      salesDescription: '',
      purchaseTaxType: 'gst18',
      attachments: [] as { name: string, base64: string }[],
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name is required' : null),
      unit: (value) => (!value ? 'Unit is required' : null),
    },
  });

  React.useEffect(() => {
    if (editingId) {
      db.products.get(editingId).then(item => {
        if (item) {
          form.setValues({
            name: isCloning ? `${item.name} (Copy)` : item.name,
            unit: item.unit,
            sku: isCloning ? `${item.sku}-COPY` : item.sku,
            hsnCode: item.hsnCode || '',
            category: item.category,
            brand: (item as any).brand || '',
            manufacturer: (item as any).manufacturer || '',
            description: item.description,
            salesPrice: item.price,
            costPrice: item.costPrice,
            reorderPoint: item.minStock,
            preferredVendor: (item as any).preferredVendorId?.toString() || '',
            type: (item as any).type || 'Goods',
            itemType: (item as any).itemType || 'Single Item',
            salesAccount: (item as any).salesAccount || 'Sales',
            purchaseAccount: (item as any).purchaseAccount || 'Cost of Goods Sold',
            trackInventory: (item as any).trackInventory !== undefined ? (item as any).trackInventory : true,
            inventoryAccount: (item as any).inventoryAccount || 'Inventory Asset',
            valuationMethod: (item as any).valuationMethod || 'FIFO (First In, First Out)',
            returnable: (item as any).returnable || 'Yes',
            length: (item as any).length || 0,
            width: (item as any).width || 0,
            height: (item as any).height || 0,
            dimensionUnit: (item as any).dimensionUnit || 'cm',
            weight: (item as any).weight || 0,
            weightUnit: (item as any).weightUnit || 'kg',
            attachments: (item as any).attachments || [],
          });
          if ((item as any).images) {
            setImages({ 
              front: (item as any).images[0], 
              rear: (item as any).images[1], 
              others: (item as any).images.slice(2) 
            });
          }
        }
      });
    }
  }, [editingId, isCloning]);

  const handleSaveCat = async () => {
    if (!newCatName) return;
    try {
      await db.categories.add({ name: newCatName, parentId: parentCatId ? Number(parentCatId) : undefined });
      setNewCatName('');
      setParentCatId(null);
      setShowAddCat(false);
      notifications.show({ title: 'Success', message: 'Category added', color: 'green' });
    } catch (e) { notifications.show({ title: 'Error', message: 'Failed to add category', color: 'red' }); }
  };

  const handleSaveBrand = async () => {
    if (!newBrandName) return;
    try {
      await db.brands.add({ name: newBrandName });
      setNewBrandName('');
      setShowAddBrand(false);
      notifications.show({ title: 'Success', message: 'Brand added', color: 'green' });
    } catch (e) { notifications.show({ title: 'Error', message: 'Failed to add brand', color: 'red' }); }
  };

  const handleSaveMfg = async () => {
    if (!newMfgName) return;
    try {
      await db.manufacturers.add({ name: newMfgName });
      setNewMfgName('');
      setShowAddMfg(false);
      notifications.show({ title: 'Success', message: 'Manufacturer added', color: 'green' });
    } catch (e) { notifications.show({ title: 'Error', message: 'Failed to add manufacturer', color: 'red' }); }
  };

  const handleSave = async (values: typeof form.values) => {
    try {
      const itemData = {
        name: values.name,
        sku: values.sku,
        hsnCode: values.hsnCode,
        category: values.category || 'General',
        price: values.salesPrice,
        costPrice: values.costPrice,
        stock: (editingId && !isCloning) ? undefined : 0, 
        minStock: values.reorderPoint,
        unit: values.unit,
        description: values.description,
        gstRate: parseInt(values.taxType.replace(/\D/g, '')) || 0,
        taxType: values.taxType,
        brand: values.brand,
        manufacturer: values.manufacturer,
        preferredVendorId: values.preferredVendor ? Number(values.preferredVendor) : undefined,
        images: [images.front, images.rear, ...images.others].filter(Boolean) as string[],
        type: values.type,
        itemType: values.itemType,
        salesAccount: values.salesAccount,
        purchaseAccount: values.purchaseAccount,
        trackInventory: values.trackInventory,
        inventoryAccount: values.inventoryAccount,
        valuationMethod: values.valuationMethod,
        returnable: values.returnable,
        length: values.length,
        width: values.width,
        height: values.height,
        dimensionUnit: values.dimensionUnit,
        weight: values.weight,
        weightUnit: values.weightUnit,
        attachments: values.attachments,
      };

      if (editingId && !isCloning) {
        await db.products.update(editingId, itemData);
        notifications.show({ title: 'Success', message: 'Item updated successfully', color: 'blue' });
      } else {
        await db.products.add(itemData as any);
        notifications.show({ title: 'Success', message: isCloning ? 'Item cloned successfully' : 'Item created successfully', color: 'green' });
      }
      onClose();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to save item', color: 'red' });
    }
  };

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <input type="file" ref={frontInputRef} style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'front')} accept="image/*" />
      <input type="file" ref={rearInputRef} style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'rear')} accept="image/*" />
      <input type="file" ref={othersInputRef} style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'others')} accept="image/*" />

      {/* Category Modal */}
      <Modal opened={manageCatOpened} onClose={closeManageCat} title={<Text fw={600}>Manage Categories</Text>} size="lg" padding="0">
        <Box p="xl">
          {!showAddCat ? (
            <>
              <Group justify="space-between" mb="md">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Categories</Text>
                <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={() => setShowAddCat(true)}>Add New Category</Button>
              </Group>
              <Divider mb="md" />
              <Stack gap="xs">
                {categories?.map(c => (
                  <Group key={c.id} gap="sm" p="xs" style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <Folder size={16} color="#3b82f6" />
                    <Text size="sm">{c.name}</Text>
                  </Group>
                ))}
              </Stack>
              <Button variant="default" onClick={closeManageCat} mt="xl">Cancel</Button>
            </>
          ) : (
            <Stack gap="lg">
              <Grid align="center">
                <Grid.Col span={4}><Text size="sm" c="red">Category Name*</Text></Grid.Col>
                <Grid.Col span={8}><TextInput value={newCatName} onChange={(e) => setNewCatName(e.currentTarget.value)} /></Grid.Col>
              </Grid>
              <Grid align="center">
                <Grid.Col span={4}><Text size="sm">Parent Category</Text></Grid.Col>
                <Grid.Col span={8}><Select placeholder="Select a category" data={categories?.map(c => ({ value: c.id!.toString(), label: c.name })) || []} value={parentCatId} onChange={setParentCatId} /></Grid.Col>
              </Grid>
              <Group gap="sm"><Button color="blue" onClick={handleSaveCat}>Save</Button><Button variant="default" onClick={() => setShowAddCat(false)}>Cancel</Button></Group>
            </Stack>
          )}
        </Box>
      </Modal>

      {/* Brand Modal */}
      <Modal opened={manageBrandOpened} onClose={closeManageBrand} title={<Text fw={600}>Manage Brands</Text>} size="lg" padding="0">
        <Box p="xl">
          {!showAddBrand ? (
            <>
              <Group justify="space-between" mb="md">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Brands</Text>
                <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={() => setShowAddBrand(true)}>Add New Brand</Button>
              </Group>
              <Divider mb="md" />
              <Stack gap="xs">
                {brands?.map(b => (
                  <Group key={b.id} gap="sm" p="xs" style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <Tag size={16} color="#3b82f6" />
                    <Text size="sm">{b.name}</Text>
                  </Group>
                ))}
              </Stack>
              <Button variant="default" onClick={closeManageBrand} mt="xl">Cancel</Button>
            </>
          ) : (
            <Stack gap="lg">
              <Grid align="center">
                <Grid.Col span={4}><Text size="sm" c="red">Brand Name*</Text></Grid.Col>
                <Grid.Col span={8}><TextInput value={newBrandName} onChange={(e) => setNewBrandName(e.currentTarget.value)} /></Grid.Col>
              </Grid>
              <Group gap="sm"><Button color="blue" onClick={handleSaveBrand}>Save</Button><Button variant="default" onClick={() => setShowAddBrand(false)}>Cancel</Button></Group>
            </Stack>
          )}
        </Box>
      </Modal>

      {/* Mfg Modal */}
      <Modal opened={manageMfgOpened} onClose={closeManageMfg} title={<Text fw={600}>Manage Manufacturers</Text>} size="lg" padding="0">
        <Box p="xl">
          {!showAddMfg ? (
            <>
              <Group justify="space-between" mb="md">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Manufacturers</Text>
                <Button variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={() => setShowAddMfg(true)}>Add New Manufacturer</Button>
              </Group>
              <Divider mb="md" />
              <Stack gap="xs">
                {manufacturers?.map(m => (
                  <Group key={m.id} gap="sm" p="xs" style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <Factory size={16} color="#3b82f6" />
                    <Text size="sm">{m.name}</Text>
                  </Group>
                ))}
              </Stack>
              <Button variant="default" onClick={closeManageMfg} mt="xl">Cancel</Button>
            </>
          ) : (
            <Stack gap="lg">
              <Grid align="center">
                <Grid.Col span={4}><Text size="sm" c="red">Manufacturer Name*</Text></Grid.Col>
                <Grid.Col span={8}><TextInput value={newMfgName} onChange={(e) => setNewMfgName(e.currentTarget.value)} /></Grid.Col>
              </Grid>
              <Group gap="sm"><Button color="blue" onClick={handleSaveMfg}>Save</Button><Button variant="default" onClick={() => setShowAddMfg(false)}>Cancel</Button></Group>
            </Stack>
          )}
        </Box>
      </Modal>

      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <Group justify="space-between">
          <Title order={3} fw={500}>{isCloning ? 'Clone Item' : editingId ? 'Edit Item' : 'New Item'}</Title>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}><X size={20} /></ActionIcon>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflowY: 'auto' }} p="xl">
        <Box maw={1200} mx="auto">
          <form onSubmit={form.onSubmit(handleSave)}>
            <Grid gutter={40}>
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="lg">
                  <Box>
                    <Grid align="center" mb="sm">
                      <Grid.Col span={3}><Text size="sm" fw={500} c="red">Name*</Text></Grid.Col>
                      <Grid.Col span={9}><TextInput placeholder="" required {...form.getInputProps('name')} styles={{ input: { borderColor: '#3b82f6' } }} /></Grid.Col>
                    </Grid>

                    <Grid align="center" mb="sm">
                      <Grid.Col span={3}><Text size="sm">SKU</Text></Grid.Col>
                      <Grid.Col span={9}><TextInput placeholder="SKU-001" {...form.getInputProps('sku')} /></Grid.Col>
                    </Grid>

                    <Grid align="center" mb="sm">
                      <Grid.Col span={3}><Text size="sm">HSN Code</Text></Grid.Col>
                      <Grid.Col span={9}><TextInput placeholder="HSN Code" {...form.getInputProps('hsnCode')} /></Grid.Col>
                    </Grid>

                    <Grid align="center" mb="sm">
                      <Grid.Col span={3}><Group gap="xs"><Text size="sm">Type</Text><HelpCircle size={14} color="#adb5bd" /></Group></Grid.Col>
                      <Grid.Col span={9}>
                        <Radio.Group {...form.getInputProps('type')}>
                          <Group><Radio value="Goods" label="Goods" /><Radio value="Service" label="Service" /></Group>
                        </Radio.Group>
                      </Grid.Col>
                    </Grid>

                    <Grid align="center" mb="sm">
                      <Grid.Col span={3}><Text size="sm">Category</Text></Grid.Col>
                      <Grid.Col span={9}>
                        <Combobox store={catCombobox} onOptionSubmit={(val) => { form.setFieldValue('category', val); catCombobox.closeDropdown(); }}>
                          <Combobox.Target><InputBase component="button" type="button" pointer onClick={() => catCombobox.toggleDropdown()} rightSection={<Combobox.Chevron />}>{form.values.category || <Input.Placeholder>Select a category</Input.Placeholder>}</InputBase></Combobox.Target>
                          <Combobox.Dropdown>
                            <Combobox.Search placeholder="Search" />
                            <Combobox.Options><ScrollArea.Autosize mah={200}>{categories?.map(c => <Combobox.Option value={c.name} key={c.id}>{c.name}</Combobox.Option>)}</ScrollArea.Autosize></Combobox.Options>
                            <Divider /><Box p="xs"><UnstyledButton onClick={() => { catCombobox.closeDropdown(); openManageCat(); }} style={{ width: '100%' }}><Group gap="xs"><SettingsIcon size={14} color="#3b82f6" /><Text size="sm" c="blue">Manage Categories</Text></Group></UnstyledButton></Box>
                          </Combobox.Dropdown>
                        </Combobox>
                      </Grid.Col>
                    </Grid>

                    <Grid align="center" mb="sm">
                      <Grid.Col span={3}><Text size="sm">Brand</Text></Grid.Col>
                      <Grid.Col span={9}>
                        <Combobox store={brandCombobox} onOptionSubmit={(val) => { form.setFieldValue('brand', val); brandCombobox.closeDropdown(); }}>
                          <Combobox.Target><InputBase component="button" type="button" pointer onClick={() => brandCombobox.toggleDropdown()} rightSection={<Combobox.Chevron />}>{form.values.brand || <Input.Placeholder>Select or Add Brand</Input.Placeholder>}</InputBase></Combobox.Target>
                          <Combobox.Dropdown>
                            <Combobox.Search placeholder="Search" />
                            <Combobox.Options><ScrollArea.Autosize mah={200}>{brands?.map(b => <Combobox.Option value={b.name} key={b.id}>{b.name}</Combobox.Option>)}</ScrollArea.Autosize></Combobox.Options>
                            <Divider /><Box p="xs"><UnstyledButton onClick={() => { brandCombobox.closeDropdown(); openManageBrand(); }} style={{ width: '100%' }}><Group gap="xs"><SettingsIcon size={14} color="#3b82f6" /><Text size="sm" c="blue">Manage Brands</Text></Group></UnstyledButton></Box>
                          </Combobox.Dropdown>
                        </Combobox>
                      </Grid.Col>
                    </Grid>

                    <Grid align="center" mb="sm">
                      <Grid.Col span={3}><Text size="sm">Manufacturer</Text></Grid.Col>
                      <Grid.Col span={9}>
                        <Combobox store={mfgCombobox} onOptionSubmit={(val) => { form.setFieldValue('manufacturer', val); mfgCombobox.closeDropdown(); }}>
                          <Combobox.Target><InputBase component="button" type="button" pointer onClick={() => mfgCombobox.toggleDropdown()} rightSection={<Combobox.Chevron />}>{form.values.manufacturer || <Input.Placeholder>Select or Add Manufacturer</Input.Placeholder>}</InputBase></Combobox.Target>
                          <Combobox.Dropdown>
                            <Combobox.Search placeholder="Search" />
                            <Combobox.Options><ScrollArea.Autosize mah={200}>{manufacturers?.map(m => <Combobox.Option value={m.name} key={m.id}>{m.name}</Combobox.Option>)}</ScrollArea.Autosize></Combobox.Options>
                            <Divider /><Box p="xs"><UnstyledButton onClick={() => { mfgCombobox.closeDropdown(); openManageMfg(); }} style={{ width: '100%' }}><Group gap="xs"><SettingsIcon size={14} color="#3b82f6" /><Text size="sm" c="blue">Manage Manufacturers</Text></Group></UnstyledButton></Box>
                          </Combobox.Dropdown>
                        </Combobox>
                      </Grid.Col>
                    </Grid>
                  </Box>

                  <Box>
                    <Title order={5} mb="lg">Item Description</Title>
                    <Grid mb="sm">
                      <Grid.Col span={3}><Text size="sm">Description</Text></Grid.Col>
                      <Grid.Col span={9}><Textarea rows={4} {...form.getInputProps('description')} /></Grid.Col>
                    </Grid>
                  </Box>

                  {/* Sales Information */}
                  <Box mt="xl">
                    <Group gap="xs" mb="lg"><Checkbox checked readOnly /><Title order={5}>Sales Information</Title></Group>
                    <Grid gutter="xl">
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <Group grow align="center"><Text size="sm" c="red" w={100}>Selling Price*</Text><NumberInput prefix="₹ " {...form.getInputProps('salesPrice')} /></Group>
                          <Group grow align="center"><Text size="sm" w={100}>Description</Text><Textarea rows={3} {...form.getInputProps('salesDescription')} /></Group>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <Group grow align="center"><Text size="sm" c="red" w={100}>Account*</Text><Select data={salesAccounts.map(g => ({ group: g.group, items: g.items }))} searchable placeholder="Select an account" {...form.getInputProps('salesAccount')} /></Group>
                          <Group grow align="center"><Group gap="xs" w={100}><Text size="sm">Tax</Text><HelpCircle size={14} color="#adb5bd" /></Group><Select placeholder="Select Tax" data={TAX_OPTIONS} {...form.getInputProps('taxType')} /></Group>
                        </Stack>
                      </Grid.Col>
                    </Grid>
                  </Box>

                  <Divider my="xl" />

                  {/* Purchase Information */}
                  <Box>
                    <Group gap="xs" mb="lg"><Checkbox checked readOnly /><Title order={5}>Purchase Information</Title></Group>
                    <Grid gutter="xl">
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <Group grow align="center"><Text size="sm" c="red" w={100}>Cost Price*</Text><NumberInput prefix="₹ " {...form.getInputProps('costPrice')} /></Group>
                          <Group grow align="center"><Text size="sm" w={100}>Description</Text><Textarea rows={3} /></Group>
                          <Group grow align="center"><Text size="sm" w={100}>Preferred Vendor</Text><Select placeholder="Select vendor" data={vendors?.map(v => ({ value: v.id!.toString(), label: v.name })) || []} searchable {...form.getInputProps('preferredVendor')} /></Group>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <Group grow align="center"><Text size="sm" c="red" w={100}>Account*</Text><Select data={purchaseAccounts.map(g => ({ group: g.group, items: g.items }))} searchable placeholder="Select an account" {...form.getInputProps('purchaseAccount')} /></Group>
                          <Group grow align="center"><Group gap="xs" w={100}><Text size="sm">Tax</Text><HelpCircle size={14} color="#adb5bd" /></Group><Select placeholder="Select Tax" data={TAX_OPTIONS} {...form.getInputProps('purchaseTaxType')} /></Group>
                        </Stack>
                      </Grid.Col>
                    </Grid>
                  </Box>

                  <Divider my="xl" />

                  {/* Inventory Tracking */}
                  <Box>
                    <Group gap="xs" mb="sm"><Checkbox {...form.getInputProps('trackInventory', { type: 'checkbox' })} /><Title order={5}>Track Inventory</Title><HelpCircle size={16} color="#adb5bd" /></Group>
                    <Text size="xs" c="dimmed" ml={30} mb="lg">Inventory tracking once enabled cannot be disabled easily.</Text>
                    <Grid gutter="xl">
                      <Grid.Col span={6}>
                        <Group grow align="center"><Text size="sm" c="red" w={100}>Inventory Account*</Text><Select placeholder="Select an account" data={inventoryAccounts.map(g => ({ group: g.group, items: g.items }))} searchable {...form.getInputProps('inventoryAccount')} /></Group>
                        <Group grow align="center" mt="md"><Text size="sm" w={100}>Reorder Point</Text><NumberInput {...form.getInputProps('reorderPoint')} /></Group>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Group grow align="center"><Group gap="xs" w={100}><Text size="sm" c="red">Valuation Method*</Text></Group><Select data={['FIFO (First In, First Out)']} {...form.getInputProps('valuationMethod')} /></Group>
                      </Grid.Col>
                    </Grid>
                  </Box>

                  <Divider my="xl" />

                  {/* Cancellation and Returns */}
                  <Box>
                    <Title order={5} mb="lg">Cancellation and Returns</Title>
                    <Grid align="center">
                      <Grid.Col span={3}><Group gap="xs"><Text size="sm">Returnable Item</Text><HelpCircle size={14} color="#adb5bd" /></Group></Grid.Col>
                      <Grid.Col span={9}><Radio.Group {...form.getInputProps('returnable')}><Group><Radio value="Yes" label="Yes" /><Radio value="No" label="No" /></Group></Radio.Group></Grid.Col>
                    </Grid>
                  </Box>

                  <Divider my="xl" />

                  {/* Fulfilment Details */}
                  <Box mb="xl">
                    <Title order={5} mb="lg">Fulfilment Details</Title>
                    <Grid align="center" mb="md">
                      <Grid.Col span={3}><Text size="sm">Dimensions</Text></Grid.Col>
                      <Grid.Col span={6}>
                        <Group gap="0" grow>
                          <NumberInput placeholder="x" {...form.getInputProps('length')} styles={{ input: { borderRadius: '4px 0 0 4px', textAlign: 'center' } }} />
                          <NumberInput placeholder="x" {...form.getInputProps('width')} styles={{ input: { borderRadius: '0', textAlign: 'center', borderLeft: 'none' } }} />
                          <NumberInput placeholder="x" {...form.getInputProps('height')} styles={{ input: { borderRadius: '0', textAlign: 'center', borderLeft: 'none' } }} />
                          <Select data={['cm', 'in', 'mm']} {...form.getInputProps('dimensionUnit')} styles={{ input: { borderRadius: '0 4px 4px 0', borderLeft: 'none', backgroundColor: '#f8f9fa' } }} />
                        </Group>
                      </Grid.Col>
                      <Grid.Col span={1} style={{ textAlign: 'right' }}><Text size="sm">Weight</Text></Grid.Col>
                      <Grid.Col span={2}>
                        <Group gap="0"><NumberInput style={{ flex: 1 }} {...form.getInputProps('weight')} styles={{ input: { borderRadius: '4px 0 0 4px' } }} /><Select data={['kg', 'g', 'lb', 'oz']} {...form.getInputProps('weightUnit')} w={60} styles={{ input: { borderRadius: '0 4px 4px 0', borderLeft: 'none', backgroundColor: '#f8f9fa' } }} /></Group>
                      </Grid.Col>
                    </Grid>
                  </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Paper withBorder p="xl" radius="md" bg="#fdfdfd" style={{ position: 'sticky', top: 80 }}>
                  <Stack gap="xl">
                    <Box>
                      <Text size="sm" fw={500} mb="sm">Front View</Text>
                      <Paper withBorder p="xl" style={{ borderStyle: 'dashed', textAlign: 'center', cursor: 'pointer', backgroundImage: images.front ? `url(${images.front})` : 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', minHeight: 120 }} radius="md" onClick={() => frontInputRef.current?.click()}>
                        {!images.front && <Stack gap="xs" align="center"><Upload size={20} color="#3b82f6" /><Text size="sm" c="blue" fw={500}>Upload Front Image</Text></Stack>}
                      </Paper>
                    </Box>
                    <Box>
                      <Text size="sm" fw={500} mb="sm">Rear View</Text>
                      <Paper withBorder p="xl" style={{ borderStyle: 'dashed', textAlign: 'center', cursor: 'pointer', backgroundImage: images.rear ? `url(${images.rear})` : 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', minHeight: 120 }} radius="md" onClick={() => rearInputRef.current?.click()}>
                        {!images.rear && <Stack gap="xs" align="center"><Upload size={20} color="#3b82f6" /><Text size="sm" c="blue" fw={500}>Upload Rear Image</Text></Stack>}
                      </Paper>
                    </Box>
                    <Box>
                      <Text size="sm" fw={500} mb="sm">Other Images</Text>
                      <Paper withBorder p="xl" h={200} style={{ borderStyle: 'dashed', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} radius="md" onClick={() => othersInputRef.current?.click()}>
                        <Stack gap="xs" align="center">
                          <Box p="4px" style={{ display: 'inline-flex', backgroundColor: '#3b82f6', borderRadius: '100%' }}><Upload size={16} color="white" /></Box>
                          <Text size="sm" fw={700}>Drag & Drop Images</Text>
                          <Text size="xs" c="dimmed" maw={200}>You can add up to 15 images including front, rear and other images, each not exceeding 5 MB.</Text>
                          {images.others.length > 0 && <Text size="xs" c="blue">{images.others.length} images added</Text>}
                        </Stack>
                      </Paper>
                    </Box>
                    <Box>
                      <Text size="sm" fw={500} mb="sm">Attachments</Text>
                      <Paper withBorder p="md" radius="md">
                        <Stack gap="xs">
                          {form.values.attachments.map((file, idx) => (
                            <Group key={idx} justify="space-between" bg="gray.0" p="xs" style={{ borderRadius: '4px' }}>
                              <Group gap="xs">
                                <FileText size={16} color="#64748b" />
                                <Text size="sm" truncate maw={200}>{file.name}</Text>
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
                          <Text size="xs" c="dimmed">Upload manual, warranty or other docs.</Text>
                        </Stack>
                      </Paper>
                    </Box>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>

            <Box py="md" mt="xl" style={{ borderTop: '1px solid #e2e8f0' }}>
              <Group><Button type="submit" color="indigo" radius="md">Save</Button><Button variant="outline" color="gray" radius="md" onClick={onClose}>Cancel</Button></Group>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
