import React, { useRef } from 'react';
import {
  Box,
  Title,
  Text,
  Group,
  Button,
  ActionIcon,
  Badge,
  Tabs,
  Paper,
  Grid,
  Stack,
  Divider,
  rem,
  Menu,
  ScrollArea,
  Table,
  Select,
  Image as MantineImage
} from '@mantine/core';
import { 
  Edit, 
  MoreHorizontal, 
  X, 
  ChevronDown, 
  History, 
  ArrowLeft,
  Upload,
  Info,
  Package,
  FileText
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ProductService } from '../services/product.service';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { notifications } from '@mantine/notifications';

interface ItemDetailProps {
  itemId: number;
  onClose: () => void;
  onEdit: (id: number) => void;
  onClone?: (id: number) => void;
  onViewChange?: (view: string, id?: number, clone?: boolean) => void;
}

export function ItemDetail({ itemId, onClose, onEdit, onClone, onViewChange }: ItemDetailProps) {
  const item = useLiveQuery(() => ProductService.getById(itemId), [itemId]);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const rearInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      await ProductService.delete(itemId);
      notifications.show({ title: 'Deleted', message: 'Item removed from inventory', color: 'gray' });
      onClose();
    }
  };

  const handleImageUpload = async (file: File, type: 'front' | 'rear') => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (type === 'front') {
        await ProductService.update(itemId, { imageFront: base64 });
      } else {
        await ProductService.update(itemId, { imageRear: base64 });
      }
      notifications.show({
        title: 'Success',
        message: `${type === 'front' ? 'Front' : 'Rear'} image uploaded`,
        color: 'green'
      });
    };
    reader.readAsDataURL(file);
  };

  const chartData = [
    { name: '01 May', sales: 0 },
    { name: '05 May', sales: 0 },
    { name: '10 May', sales: 0 },
    { name: '15 May', sales: 0 },
    { name: '20 May', sales: 0 },
    { name: '25 May', sales: 0 },
    { name: '31 May', sales: 0 },
  ];

  return (
    <Box bg="white" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <input 
        type="file" 
        hidden 
        ref={frontInputRef} 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'front')} 
      />
      <input 
        type="file" 
        hidden 
        ref={rearInputRef} 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'rear')} 
      />
      
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <ArrowLeft size={20} />
            </ActionIcon>
            <Stack gap={0}>
              <Title order={3} fw={500}>{item.name}</Title>
              <Group gap="xs">
                <Badge variant="dot" color="blue" size="sm">Returnable Item</Badge>
              </Group>
            </Stack>
          </Group>
          <Group gap="sm">
            <Button 
              variant="default" 
              leftSection={<Edit size={16} />} 
              onClick={() => onEdit(itemId)}
            >
              Edit
            </Button>
            <Button color="blue" onClick={() => onViewChange?.('adjust-stock', itemId)}>Adjust Stock</Button>
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <Button variant="default" rightSection={<ChevronDown size={16} />}>More</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<FileText size={14} />} onClick={() => onClone?.(itemId)}>Clone</Menu.Item>
                <Menu.Item leftSection={<History size={14} />}>Transactions</Menu.Item>
                <Menu.Item color="red" leftSection={<X size={14} />} onClick={handleDelete}>Delete</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <X size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Tabs */}
      <Tabs defaultValue="overview" styles={{
        root: { display: 'flex', flexDirection: 'column', flex: 1 },
        panel: { flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }
      }}>
        <Box px="md" style={{ backgroundColor: 'white' }}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>
        </Box>

        <Tabs.Panel value="overview" p="xl">
          <Box maw={1400} mx="auto">
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="xl">
                  {/* Primary Details */}
                  <Box>
                    <Title order={5} mb="md" fw={600}>Primary Details</Title>
                    <Grid gutter="xs">
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Item Name</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm" fw={500} c="blue">{item.name}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">SKU</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.sku || '-'}</Text></Grid.Col>

                      <Grid.Col span={4}><Text size="sm" c="dimmed">HSN Code</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.hsnCode || '-'}</Text></Grid.Col>

                      <Grid.Col span={4}><Text size="sm" c="dimmed">Item Type</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">Inventory Items</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Category</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.category}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Unit</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.unit}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Brand</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.brand || '-'}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Created Source</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">User</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Inventory Account</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.inventoryAccount || 'Inventory Asset'}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Inventory Valuation Method</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">FIFO (First In First Out)</Text></Grid.Col>
                    </Grid>
                  </Box>

                  {/* Purchase Information */}
                  <Box>
                    <Title order={5} mb="md" fw={600}>Purchase Information</Title>
                    <Grid gutter="xs">
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Cost Price</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm" fw={500}>₹{item.costPrice.toLocaleString()}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Purchase Account</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.purchaseAccount || 'Cost of Goods Sold'}</Text></Grid.Col>
                    </Grid>
                  </Box>

                  {/* Sales Information */}
                  <Box>
                    <Title order={5} mb="md" fw={600}>Sales Information</Title>
                    <Grid gutter="xs">
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Selling Price</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm" fw={500}>₹{item.price.toLocaleString()}</Text></Grid.Col>
                      
                      <Grid.Col span={4}><Text size="sm" c="dimmed">Sales Account</Text></Grid.Col>
                      <Grid.Col span={8}><Text size="sm">{item.salesAccount || 'Sales'}</Text></Grid.Col>
                    </Grid>
                  </Box>

                  {/* Attachments */}
                  <Box>
                    <Title order={5} mb="md" fw={600}>Attachments</Title>
                    {item.attachments && item.attachments.length > 0 ? (
                      <Stack gap="xs">
                        {item.attachments.map((file, idx) => (
                          <Group key={idx} justify="space-between" bg="#f8f9fa" p="xs" style={{ borderRadius: '4px' }}>
                            <Group gap="xs">
                              <FileText size={16} color="#64748b" />
                              <Text size="sm">{file.name}</Text>
                            </Group>
                            <Button 
                              variant="subtle" 
                              size="xs" 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.base64;
                                link.download = file.name;
                                link.click();
                              }}
                            >
                              Download
                            </Button>
                          </Group>
                        ))}
                      </Stack>
                    ) : (
                      <Text size="xs" c="dimmed">No attachments uploaded for this item.</Text>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="xl">
                  {/* Image Section */}
                  <Paper withBorder p="md" radius="md" bg="white">
                    <Grid gutter="md">
                      <Grid.Col span={6}>
                        <Text size="xs" fw={500} mb="xs">Front View</Text>
                        <Box 
                          h={100} 
                          style={{ 
                            border: '1px dashed #dee2e6', 
                            borderRadius: '4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                          onClick={() => frontInputRef.current?.click()}
                        >
                          {item.imageFront ? (
                            <MantineImage src={item.imageFront} h="100%" w="100%" style={{ objectFit: 'cover' }} />
                          ) : (
                            <Stack gap={4} align="center">
                              <Upload size={14} color="#3b82f6" />
                              <Text size="xs" c="blue" fw={500}>Upload Front</Text>
                            </Stack>
                          )}
                        </Box>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" fw={500} mb="xs">Rear View</Text>
                        <Box 
                          h={100} 
                          style={{ 
                            border: '1px dashed #dee2e6', 
                            borderRadius: '4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                          onClick={() => rearInputRef.current?.click()}
                        >
                          {item.imageRear ? (
                            <MantineImage src={item.imageRear} h="100%" w="100%" style={{ objectFit: 'cover' }} />
                          ) : (
                            <Stack gap={4} align="center">
                              <Upload size={14} color="#3b82f6" />
                              <Text size="xs" c="blue" fw={500}>Upload Rear</Text>
                            </Stack>
                          )}
                        </Box>
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <Text size="xs" fw={500} mb="xs">Other Images</Text>
                        <Box h={100} style={{ border: '1px dashed #dee2e6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
                          <Stack gap={4} align="center">
                            <Upload size={14} color="#3b82f6" />
                            <Text size="xs" fw={700}>Drag & Drop Images</Text>
                            <Text size="xs" c="dimmed" style={{ textAlign: 'center' }}>each not exceeding 5 MB.</Text>
                          </Stack>
                        </Box>
                      </Grid.Col>
                    </Grid>
                  </Paper>

                  {/* Stock Info */}
                  <Box>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={600}>Opening Stock : {item.stock || 0.00}</Text>
                      <ActionIcon variant="subtle" size="sm" color="blue"><Edit size={14} /></ActionIcon>
                    </Group>
                    
                    <Stack gap="md" mt="xl">
                      <Box>
                        <Group gap="xs" mb="xs">
                          <Text size="sm" fw={600}>Accounting Stock</Text>
                          <Info size={14} color="#adb5bd" />
                        </Group>
                        <Grid gutter="xs">
                          <Grid.Col span={8}><Text size="xs" c="dimmed">Stock on Hand</Text></Grid.Col>
                          <Grid.Col span={4}><Text size="xs" fw={500}>: {item.stock || 0.00}</Text></Grid.Col>
                          
                          <Grid.Col span={8}><Text size="xs" c="dimmed">Committed Stock</Text></Grid.Col>
                          <Grid.Col span={4}><Text size="xs" fw={500}>: 0.00</Text></Grid.Col>
                          
                          <Grid.Col span={8}><Text size="xs" c="dimmed">Available for Sale</Text></Grid.Col>
                          <Grid.Col span={4}><Text size="xs" fw={500}>: {item.stock || 0.00}</Text></Grid.Col>
                        </Grid>
                      </Box>

                      <Box>
                        <Group gap="xs" mb="xs">
                          <Text size="sm" fw={600}>Physical Stock</Text>
                          <Info size={14} color="#adb5bd" />
                        </Group>
                        <Grid gutter="xs">
                          <Grid.Col span={8}><Text size="xs" c="dimmed">Stock on Hand</Text></Grid.Col>
                          <Grid.Col span={4}><Text size="xs" fw={500}>: {item.stock || 0.00}</Text></Grid.Col>
                          
                          <Grid.Col span={8}><Text size="xs" c="dimmed">Committed Stock</Text></Grid.Col>
                          <Grid.Col span={4}><Text size="xs" fw={500}>: 0.00</Text></Grid.Col>
                          
                          <Grid.Col span={8}><Text size="xs" c="dimmed">Available for Sale</Text></Grid.Col>
                          <Grid.Col span={4}><Text size="xs" fw={500}>: {item.stock || 0.00}</Text></Grid.Col>
                        </Grid>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Grid.Col>
            </Grid>

            {/* Bottom Section - Chart and Metrics */}
            <Box mt={40}>
              <Paper withBorder p="xl" radius="md" bg="white">
                <Stack gap="xl">
                  <Grid>
                    <Grid.Col span={3}>
                      <Box style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                        <Title order={3}>{item.stock || 0}</Title>
                        <Text size="xs" c="dimmed">To be Shipped</Text>
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Box style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                        <Title order={3}>0</Title>
                        <Text size="xs" c="dimmed">To be Received</Text>
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Box style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                        <Title order={3}>0</Title>
                        <Text size="xs" c="dimmed">To be Invoiced</Text>
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Box style={{ textAlign: 'center' }}>
                        <Title order={3}>0</Title>
                        <Text size="xs" c="dimmed">To be Billed</Text>
                      </Box>
                    </Grid.Col>
                  </Grid>

                  <Box p="md" bg="#fff9db" style={{ border: '1px solid #ffe066', borderRadius: '4px' }}>
                    <Text size="xs" fw={600}>Reorder Point</Text>
                    <Text size="xs" mt="xs">You have to enable reorder notification before setting reorder point for items. <Text component="span" c="blue" style={{ cursor: 'pointer' }}>Click here</Text></Text>
                  </Box>

                  <Box>
                    <Group justify="space-between" mb="xl">
                      <Text fw={600}>Sales Order Summary (In INR)</Text>
                      <Select size="xs" data={['This Month', 'This Year', 'All Time']} defaultValue="This Month" />
                    </Group>
                    <Box h={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}K`} />
                          <Tooltip />
                          <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="transactions" p="xl">
          <Text c="dimmed">Transaction history will appear here.</Text>
        </Tabs.Panel>

        <Tabs.Panel value="history" p="xl">
          <Text c="dimmed">Audit history will appear here.</Text>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
