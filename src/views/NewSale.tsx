import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Paper, 
  Grid, 
  Stack, 
  TextInput, 
  NumberInput, 
  Button, 
  Group, 
  Text, 
  Table, 
  ActionIcon,
  Divider,
  Select,
  ScrollArea,
  Badge,
  SegmentedControl,
  Box,
  Modal
} from '@mantine/core';
import { Search, Plus, Trash, ShoppingCart, User, CreditCard, Save, MapPin, Eye } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '../db';
import { notifications } from '@mantine/notifications';
import { ItemDetail } from './ItemDetail';

export function NewSale({ editingId, isCloning, onClose }: { editingId?: number, isCloning?: boolean, onClose?: () => void }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [docType, setDocType] = useState<'salesOrder' | 'invoice'>('invoice');
  const [viewItemId, setViewItemId] = useState<number | null>(null);

  useEffect(() => {
    const loadFromSalesOrder = async () => {
      if (editingId) {
        const so = await db.salesOrders.get(editingId);
        if (so) {
          setSelectedCustomerId(so.customerId.toString());
          setCart((so.items || []).map(item => {
            const itemGstRate = item.gstRate || 0;
            const priceExclGst = (item.price || 0) / (1 + itemGstRate / 100);
            const gstAmount = (item.price || 0) - priceExclGst;
            return {
              id: item.productId,
              name: item.productName,
              price: item.price || 0,
              quantity: item.quantity || 0,
              total: item.total || 0,
              gstRate: itemGstRate,
              hsnCode: item.hsnCode || '',
              priceExclGst,
              gstAmount: gstAmount * (item.quantity || 0)
            };
          }));
          setDocType('invoice');
        }
      }
    };
    loadFromSalesOrder();
  }, [editingId]);

  const customers = useLiveQuery(() => 
    db.partners.filter(p => p.type === 'customer' || p.type === 'both').toArray()
  );
  
  const selectedCustomer = useLiveQuery(
    () => selectedCustomerId ? db.partners.get(Number(selectedCustomerId)) : undefined,
    [selectedCustomerId]
  );
  
  const shopSettings = useLiveQuery(() => db.settings.toCollection().first());

  const products = useLiveQuery(
    () => db.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).toArray(),
    [searchTerm]
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    const isInterState = selectedCustomer && shopSettings && selectedCustomer.billingState !== shopSettings.shopState;
    const itemGstRate = product.gstRate || 18;
    const priceExclGst = product.price / (1 + itemGstRate / 100);
    const gstPerUnit = product.price - priceExclGst;

    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { 
          ...item, 
          quantity: item.quantity + 1, 
          total: (item.quantity + 1) * item.price,
          gstAmount: (item.quantity + 1) * gstPerUnit
        } : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        quantity: 1, 
        priceExclGst,
        gstAmount: gstPerUnit,
        total: product.price 
      }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map(item => {
      if (item.id === id) {
        const gstPerUnit = item.price - item.priceExclGst;
        return { 
          ...item, 
          quantity: qty, 
          total: qty * item.price,
          gstAmount: qty * gstPerUnit
        };
      }
      return item;
    }));
  };

  const subtotalExclGst = cart.reduce((acc, item) => acc + (item.priceExclGst * item.quantity), 0);
  const totalGstAmount = cart.reduce((acc, item) => acc + item.gstAmount, 0);
  const total = subtotalExclGst + totalGstAmount;

  const isInterState = selectedCustomer && shopSettings && selectedCustomer.billingState !== shopSettings.shopState;
  const cgst = isInterState ? 0 : totalGstAmount / 2;
  const sgst = isInterState ? 0 : totalGstAmount / 2;
  const igst = isInterState ? totalGstAmount : 0;

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      notifications.show({ title: 'Error', message: 'Cart is empty', color: 'red' });
      return;
    }

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      await db.transaction('rw', db.invoices, db.salesOrders, db.products, async () => {
        const commonData = {
          customerId: Number(selectedCustomerId),
          customerName: selectedCustomer?.name || 'Walk-in Customer',
          date: new Date(),
          items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            hsnCode: item.hsnCode,
            quantity: item.quantity,
            price: item.price,
            gstRate: item.gstRate || 18,
            gstAmount: item.gstAmount,
            total: item.total
          })),
          subtotal: subtotalExclGst,
          totalGst: totalGstAmount,
          cgst: isInterState ? 0 : totalGstAmount / 2,
          sgst: isInterState ? 0 : totalGstAmount / 2,
          igst: isInterState ? totalGstAmount : 0,
          total,
        };

        if (docType === 'invoice') {
          await db.invoices.add({
            ...commonData,
            dueDate,
            paymentTerms: '30',
            amountPaid: paymentMethod === 'credit' ? 0 : total,
            status: paymentMethod === 'credit' ? 'unpaid' : 'paid'
          } as any);

          // Deduct from stock only for DIRECT invoices in Accounting Mode
          // (Sales Orders do NOT deduct stock — Option A policy)
          const settings = await db.settings.toCollection().first();
          const isAccountingMode = !settings?.stockTrackingMode || settings.stockTrackingMode === 'accounting';

          if (isAccountingMode) {
            const lowStockItems: string[] = [];
            for (const item of cart) {
              const p = await db.products.get(item.id);
              if (p) {
                if (p.stock < item.quantity) {
                  lowStockItems.push(item.name);
                }
                await db.products.update(item.id, { stock: p.stock - item.quantity });
              }
            }
            if (lowStockItems.length > 0) {
              notifications.show({
                title: '⚠️ Stock Warning',
                message: `Insufficient stock for: ${lowStockItems.join(', ')}. Sale saved — items are on backorder.`,
                color: 'orange',
                autoClose: 6000,
              });
            } else {
              notifications.show({
                title: 'Success',
                message: 'Tax Invoice generated & stock updated',
                color: 'green'
              });
            }
          } else {
            notifications.show({
              title: 'Success',
              message: 'Tax Invoice generated',
              color: 'green'
            });
          }
        } else {
          // SALES ORDER — NO stock deduction (Option A: only invoice deducts stock)
          await db.salesOrders.add({
            ...commonData,
            orderNumber: `SO-${Date.now()}`, // Will be replaced by number series
            status: 'pending'
          } as any);
          notifications.show({
            title: 'Success',
            message: 'Sales Order created. Stock will be updated when invoice is generated.',
            color: 'green'
          });
        }
      });

      setCart([]);
      setSelectedCustomerId(null);
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: 'Failed to process sale', color: 'red' });
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>New Sales Order</Title>
        <Badge size="xl" variant="dot" color="green">Register Open</Badge>
      </Group>

      <Grid gutter="md">
        {/* Left Side: Product Selection */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack>
            <Paper withBorder p="md" radius="md">
              <TextInput
                placeholder="Search by Name or SKU/Barcode..."
                leftSection={<Search size={16} />}
                mb="md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
              
              <ScrollArea h={400} offsetScrollbars>
                <Table verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Product</Table.Th>
                      <Table.Th>Stock</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {products?.map((product) => (
                      <Table.Tr key={product.id}>
                        <Table.Td style={{ cursor: 'pointer' }} onClick={() => setViewItemId(product.id!)}>
                          <Text size="sm" fw={500}>{product.name}</Text>
                          <Text size="xs" c="dimmed">{product.sku}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" variant="light" color={product.stock > 0 ? 'blue' : 'red'}>
                            {product.stock} in stock
                          </Badge>
                        </Table.Td>
                        <Table.Td fw={700}>₹{product.price}</Table.Td>
                        <Table.Td>
                          <ActionIcon 
                            variant="light" 
                            color="blue" 
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                          >
                            <Plus size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Right Side: Cart and Checkout */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" radius="md" shadow="sm">
            <Stack>
              <Group justify="space-between">
                <Group gap="xs">
                  <ShoppingCart size={20} />
                  <Text fw={700}>Current Order</Text>
                </Group>
                <Badge variant="filled" color="blue">{cart.length} items</Badge>
              </Group>

              <Box>
                <Text size="sm" fw={500} mb="xs">Billing Mode</Text>
                <SegmentedControl
                  fullWidth
                  value={docType}
                  onChange={(val: any) => setDocType(val)}
                  data={[
                    { label: 'Direct Tax Invoice', value: 'invoice' },
                    { label: 'Sales Order', value: 'salesOrder' },
                  ]}
                  color={docType === 'invoice' ? 'blue' : 'orange'}
                />
              </Box>

              <Select 
                label="Select Customer" 
                placeholder="Search by name or phone" 
                data={customers?.map(c => ({ value: c.id?.toString() || '', label: `${c.name} (${c.phone})` })) || []}
                searchable
                leftSection={<User size={16} />}
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
              />

              {selectedCustomer && (
                <Paper withBorder p="xs" bg="gray.0">
                  <Group gap="xs">
                    <MapPin size={14} color="gray" />
                    <Text size="xs">{selectedCustomer.billingLine1}, {selectedCustomer.state}</Text>
                  </Group>
                  {selectedCustomer.gstin && (
                    <Text size="xs" fw={700} color="blue" mt={2}>GSTIN: {selectedCustomer.gstin}</Text>
                  )}
                </Paper>
              )}

              <Divider label="Order Items" labelPosition="center" />

              <ScrollArea h={200} offsetScrollbars>
                <Stack gap="xs">
                  {cart.map((item) => (
                    <Paper key={item.id} withBorder p="xs" bg="gray.0">
                      <Group justify="space-between">
                        <Box style={{ flex: 1, cursor: 'pointer' }} onClick={() => setViewItemId(item.id)}>
                          <Text size="sm" fw={600} truncate>{item.name}</Text>
                          <Text size="xs" c="dimmed">HSN: {item.hsnCode} | GST: {item.gstRate}%</Text>
                        </Box>
                        <Group gap={5}>
                          <NumberInput
                            size="xs"
                            w={60}
                            value={item.quantity}
                            onChange={(val) => updateQuantity(item.id, Number(val))}
                            min={1}
                          />
                          <ActionIcon color="red" variant="subtle" onClick={() => removeFromCart(item.id)}>
                            <Trash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                  {cart.length === 0 && (
                    <Text ta="center" py="xl" c="dimmed" size="sm">Cart is empty</Text>
                  )}
                </Stack>
              </ScrollArea>

              <Paper withBorder p="md" bg="blue.0">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm">Subtotal (Excl. Tax)</Text>
                    <Text size="sm" fw={600}>₹{subtotalExclGst.toLocaleString()}</Text>
                  </Group>
                  {cgst > 0 && (
                    <Group justify="space-between">
                      <Text size="sm">CGST</Text>
                      <Text size="sm" fw={600}>₹{cgst.toLocaleString()}</Text>
                    </Group>
                  )}
                  {sgst > 0 && (
                    <Group justify="space-between">
                      <Text size="sm">SGST</Text>
                      <Text size="sm" fw={600}>₹{sgst.toLocaleString()}</Text>
                    </Group>
                  )}
                  {igst > 0 && (
                    <Group justify="space-between">
                      <Text size="sm">IGST</Text>
                      <Text size="sm" fw={600}>₹{igst.toLocaleString()}</Text>
                    </Group>
                  )}
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={800} size="lg">Total (Incl. Tax)</Text>
                    <Text fw={800} size="lg" color="blue">₹{total.toLocaleString()}</Text>
                  </Group>
                </Stack>
              </Paper>

              <Select
                label="Payment Method"
                placeholder="Select method"
                leftSection={<CreditCard size={16} />}
                data={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'card', label: 'Credit/Debit Card' },
                  { value: 'upi', label: 'UPI / PhonePe' },
                  { value: 'credit', label: 'Store Credit' },
                ]}
                value={paymentMethod}
                onChange={(val) => setPaymentMethod(val || 'cash')}
              />

              <Button 
                fullWidth 
                size="lg" 
                leftSection={<Save size={20} />} 
                onClick={handleProcessSale}
                disabled={cart.length === 0}
              >
                Finish & Generate Bill
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
      
      <Modal 
        opened={!!viewItemId} 
        onClose={() => setViewItemId(null)} 
        size="80%" 
        padding={0} 
        withCloseButton={false}
      >
        {viewItemId && (
          <ItemDetail 
            itemId={viewItemId} 
            onClose={() => setViewItemId(null)} 
            onEdit={(id) => {
              setViewItemId(null);
            }}
          />
        )}
      </Modal>
    </Stack>
  );
}

