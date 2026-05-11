import React, { useState } from 'react';
import { 
  Title, 
  Paper, 
  Table, 
  Group, 
  Button, 
  TextInput, 
  Stack, 
  Text, 
  Badge,
  ActionIcon,
  Tooltip,
  Menu,
  Modal,
  Select,
  NumberInput,
  ScrollArea,
  Divider,
  Grid,
  Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Search, Plus, FileText, MoreVertical, Send, CheckCircle, ArrowRight, Trash, ShoppingCart, User, Printer, Eye, Download, Edit } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type OrderItem } from '../db';
import { notifications } from '@mantine/notifications';
import { generateDocumentPDF } from '../utils/pdfGenerator';

export function Quotations() {
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  
  // Create state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  
  const quotations = useLiveQuery(() => db.quotations.orderBy('date').reverse().toArray());
  const partners = useLiveQuery(() => db.partners.filter(p => p.type === 'customer' || p.type === 'both').toArray());
  const products = useLiveQuery(() => db.products.toArray());

  const removeItem = (idx: number) => {
    const newItems = [...editedItems];
    newItems.splice(idx, 1);
    setEditedItems(newItems);
  };

  const addItemToQuote = (product: any) => {
    const gstRate = product.gstRate || 18;
    const newItem = {
      productId: product.id,
      productName: product.name,
      hsnCode: product.hsnCode,
      quantity: 1,
      price: product.price,
      gstRate: gstRate,
      gstAmount: (product.price * gstRate) / 100,
      total: product.price * (1 + gstRate/100)
    };
    setEditedItems([...editedItems, newItem]);
  };

  const handleUpdateQuote = async () => {
    if (!selectedQuote) return;
    
    const subtotal = editedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalGst = editedItems.reduce((acc, item) => acc + item.gstAmount, 0);
    const total = subtotal + totalGst;

    await db.quotations.update(selectedQuote.id, {
      items: editedItems,
      subtotal,
      totalGst,
      total
    });

    notifications.show({ title: 'Success', message: 'Quotation updated', color: 'green' });
    setIsEditing(false);
    closeDetail();
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productId === product.id);
    const itemGstRate = product.gstRate || 18;
    const priceExclGst = product.price / (1 + itemGstRate / 100);
    const gstPerUnit = product.price - priceExclGst;

    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id ? { 
          ...item, 
          quantity: item.quantity + 1, 
          total: (item.quantity + 1) * item.price,
          gstAmount: (item.quantity + 1) * gstPerUnit
        } : item
      ));
    } else {
      setCart([...cart, { 
        productId: product.id,
        productName: product.name,
        hsnCode: product.hsnCode,
        quantity: 1, 
        price: product.price,
        gstRate: itemGstRate,
        gstAmount: gstPerUnit,
        total: product.price 
      }]);
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, i) => acc + (i.price / (1 + i.gstRate/100)) * i.quantity, 0);
    const totalGst = cart.reduce((acc, i) => acc + i.gstAmount, 0);
    const total = cart.reduce((acc, i) => acc + i.total, 0);
    return { subtotal, totalGst, total };
  };

  const handleSaveQuotation = async () => {
    if (!selectedCustomerId || cart.length === 0) return;
    const customer = await db.partners.get(Number(selectedCustomerId));
    const totals = calculateTotals();

    await db.quotations.add({
      customerId: customer!.id!,
      customerName: customer!.name,
      date: new Date(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      items: cart,
      ...totals,
      status: 'draft'
    });

    notifications.show({ title: 'Quotation Created', message: 'Sent to drafts', color: 'green' });
    setCart([]);
    setSelectedCustomerId(null);
    close();
  };

  const convertToSO = async (quote: any) => {
    try {
      await db.transaction('rw', db.salesOrders, db.quotations, async () => {
        await db.salesOrders.add({
          orderNumber: `SO-${Date.now()}`,
          reference: quote.quotationNumber,
          customerId: quote.customerId,
          partnerName: quote.customerName,
          date: new Date(),
          items: quote.items,
          subtotal: quote.subtotal,
          totalGst: quote.totalGst,
          cgst: quote.cgst,
          sgst: quote.sgst,
          igst: quote.igst,
          totalAmount: quote.total,
          total: quote.total,
          status: 'draft'
        });
        await db.quotations.update(quote.id, { status: 'converted' });
      });
      notifications.show({ title: 'Success', message: 'Quotation converted to Sales Order', color: 'green' });
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Conversion failed', color: 'red' });
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Quotations / Proposals</Title>
        <Button leftSection={<Plus size={18} />} onClick={open}>Create Quote</Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <TextInput
          placeholder="Search quotations..."
          leftSection={<Search size={16} />}
          mb="md"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Quote #</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {quotations?.map((q) => (
              <Table.Tr key={q.id}>
                <Table.Td fw={500}>QT-{q.id?.toString().padStart(4, '0')}</Table.Td>
                <Table.Td>{q.customerName}</Table.Td>
                <Table.Td>{new Date(q.date).toLocaleDateString()}</Table.Td>
                <Table.Td fw={700}>₹{q.total.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Badge 
                    color={q.status === 'converted' ? 'green' : q.status === 'draft' ? 'gray' : 'blue'} 
                    variant="light"
                  >
                    {q.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={5} justify="flex-end">
                    <Tooltip label="View Details">
                      <ActionIcon variant="light" color="blue" onClick={() => { setSelectedQuote(q); openDetail(); }}>
                        <Eye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Print Quotation">
                      <ActionIcon variant="light" color="gray" onClick={() => generateDocumentPDF('Quotation', q)}>
                        <Printer size={16} />
                      </ActionIcon>
                    </Tooltip>
                    {q.status !== 'converted' && (
                      <Tooltip label="Convert to Sales Order">
                        <ActionIcon variant="light" color="green" onClick={() => convertToSO(q)}>
                          <ArrowRight size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Menu shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray"><MoreVertical size={16} /></ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<Printer size={14} />} onClick={() => generateDocumentPDF('Quotation', q)}>Print Quote</Menu.Item>
                        <Menu.Item leftSection={<Eye size={14} />} onClick={() => { setSelectedQuote(q); openDetail(); }}>View Items</Menu.Item>
                        <Menu.Item leftSection={<Trash size={14} />} color="red">Delete</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="Create New Quotation" size="90%" radius="md">
        <Grid>
          <Grid.Col span={8}>
            <Stack>
              <TextInput 
                placeholder="Search products to add..." 
                leftSection={<Search size={16} />}
                value={productSearch}
                onChange={(e) => setProductSearch(e.currentTarget.value)}
              />
              <ScrollArea h={400}>
                <Table>
                  <Table.Tbody>
                    {products?.map(p => (
                      <Table.Tr key={p.id}>
                        <Table.Td>
                          <Text fw={500}>{p.name}</Text>
                          <Text size="xs" c="dimmed">{p.sku}</Text>
                        </Table.Td>
                        <Table.Td fw={600}>₹{p.price}</Table.Td>
                        <Table.Td>
                          <ActionIcon variant="light" onClick={() => addToCart(p)}><Plus size={16} /></ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper withBorder p="md" bg="gray.0">
              <Stack>
                <Select 
                  label="Select Customer" 
                  placeholder="Choose customer"
                  data={partners?.map(p => ({ value: p.id!.toString(), label: p.name })) || []}
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  required
                />
                <Divider label="Items" labelPosition="center" />
                <ScrollArea h={200}>
                  {cart.map(i => (
                    <Group key={i.productId} justify="space-between" mb="xs">
                      <Box style={{maxWidth: 150}}><Text size="sm" truncate>{i.productName}</Text></Box>
                      <Text size="sm" fw={700}>x{i.quantity}</Text>
                    </Group>
                  ))}
                </ScrollArea>
                <Divider />
                <Group justify="space-between">
                  <Text fw={700}>Total Amount</Text>
                  <Text fw={800} color="blue">₹{calculateTotals().total.toLocaleString()}</Text>
                </Group>
                <Button fullWidth onClick={handleSaveQuotation}>Save Quotation</Button>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Modal>
      {/* Detail Modal */}
      <Modal opened={detailOpened} onClose={closeDetail} title={selectedQuote ? `Quotation Detail: QT-${selectedQuote.id}` : 'Quotation Detail'} size="lg" radius="md">
        {selectedQuote && (
          <Stack>
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="sm" fw={700} c="dimmed">FOR CUSTOMER</Text>
                <Text fw={700} size="lg">{selectedQuote.customerName}</Text>
              </Stack>
              <Stack gap={0} align="flex-end">
                <Text size="sm" fw={700} c="dimmed">DATE</Text>
                <Text fw={700}>{new Date(selectedQuote.date).toLocaleDateString()}</Text>
              </Stack>
            </Group>

            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product</Table.Th>
                  <Table.Th align="right">Qty</Table.Th>
                  <Table.Th align="right">Total</Table.Th>
                  {isEditing && <Table.Th />}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(isEditing ? editedItems : selectedQuote.items).map((item: any, idx: number) => (
                  <Table.Tr key={idx}>
                    <Table.Td>{item.productName}</Table.Td>
                    <Table.Td align="right">
                      {isEditing ? (
                        <NumberInput 
                          size="xs" 
                          w={70} 
                          value={item.quantity} 
                          onChange={(val) => {
                            const newItems = [...editedItems];
                            newItems[idx].quantity = Number(val);
                            newItems[idx].total = newItems[idx].quantity * newItems[idx].price * (1 + newItems[idx].gstRate/100);
                            newItems[idx].gstAmount = (newItems[idx].quantity * newItems[idx].price) * (newItems[idx].gstRate/100);
                            setEditedItems(newItems);
                          }}
                        />
                      ) : item.quantity}
                    </Table.Td>
                    <Table.Td align="right">₹{item.total.toLocaleString()}</Table.Td>
                    {isEditing && (
                      <Table.Td align="right">
                        <ActionIcon color="red" variant="subtle" onClick={() => removeItem(idx)}>
                          <Trash size={14} />
                        </ActionIcon>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {isEditing && (
              <Select 
                placeholder="Add product to quote..."
                searchable
                data={products?.map(p => ({ value: p.id!.toString(), label: p.name })) || []}
                onChange={(val) => {
                  const prod = products?.find(p => p.id === Number(val));
                  if (prod) addItemToQuote(prod);
                }}
                leftSection={<Plus size={16} />}
              />
            )}

            <Paper withBorder p="sm" bg="gray.0">
              <Group justify="space-between">
                <Text fw={700}>Grand Total</Text>
                <Text fw={700} size="lg" color="blue">
                  ₹{(isEditing ? 
                    editedItems.reduce((acc, i) => acc + i.total, 0) : 
                    selectedQuote.total).toLocaleString()}
                </Text>
              </Group>
            </Paper>

            <Group justify="space-between" mt="md">
              <Button 
                variant="subtle" 
                color="blue" 
                leftSection={<Edit size={16} />} 
                onClick={() => {
                  setIsEditing(true);
                  setEditedItems([...selectedQuote.items]);
                }}
                disabled={isEditing}
              >
                Edit Quote Items
              </Button>
              <Group>
                <Button variant="light" onClick={() => { setIsEditing(false); closeDetail(); }}>Close</Button>
                {isEditing ? (
                  <Button color="green" onClick={handleUpdateQuote}>Save Changes</Button>
                ) : (
                  <Button leftSection={<Printer size={16} />} onClick={() => generateDocumentPDF('Quotation', selectedQuote)}>Print Quotation</Button>
                )}
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

