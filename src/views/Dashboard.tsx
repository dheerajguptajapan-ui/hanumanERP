import React from 'react';
import { 
  SimpleGrid, 
  Paper, 
  Text, 
  Group, 
  ThemeIcon, 
  Title,
  Stack,
  Table,
  Badge,
  Tabs,
  Box,
  rem,
  SegmentedControl,
  Button,
  Grid,
  Divider,
  ActionIcon,
  Avatar,
  Image,
  UnstyledButton,
  Tooltip as MantineTooltip,
  Anchor,
  Center,
} from '@mantine/core';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  CreditCard,
  ChevronDown,
  Info,
  Calendar,
  Zap,
  Clock,
  ArrowRight,
  Monitor,
  Smartphone,
  QrCode,
  Tag,
  Truck,
  FileText,
  Factory,
  HelpCircle,
  CheckCircle,
  History,
  Plus,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
  onViewChange?: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const stats = useLiveQuery(async () => {
    try {
      const products = await db.products.toArray();
      const invoices = await db.invoices.toArray();
      const quotations = await db.quotations.toArray();
      const purchaseOrders = await db.purchaseOrders.toArray();
      const bills = await db.purchaseBills.toArray();
      const settings = await db.settings.toArray();
      const currentUser = await db.users.toCollection().first();

      const lowStock = products.filter(p => p.stock <= (p.minStock || 5)).length;
      const totalSales = invoices.reduce((acc, s) => acc + s.total, 0);
      const totalPurchases = bills.reduce((acc, b) => acc + b.total, 0);

      const receivables = invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + (i.total - (i.amountPaid || 0)), 0);
      const payables = bills.filter(b => b.status !== 'paid').reduce((acc, b) => acc + (b.total - (b.amountPaid || 0)), 0);

      const totalGst = invoices.reduce((acc, i) => acc + (i.totalGst || 0), 0);

      // ── Top Selling: aggregate sold quantity from invoice line items ──
      const soldQty: Record<number, { name: string; qty: number; revenue: number }> = {};
      invoices.forEach(inv => {
        (inv.items || []).forEach((item: any) => {
          const pid = item.productId;
          if (!soldQty[pid]) soldQty[pid] = { name: item.productName, qty: 0, revenue: 0 };
          soldQty[pid].qty += item.quantity || 0;
          soldQty[pid].revenue += item.total || 0;
        });
      });
      const topSelling = Object.entries(soldQty)
        .sort(([, a], [, b]) => b.qty - a.qty)
        .slice(0, 3)
        .map(([id, data]) => ({ productId: Number(id), ...data }));

      // ── Sales chart: last 30 days aggregated by date ──
      const today = new Date();
      const chartData: { name: string; sales: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        const dayTotal = invoices
          .filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getFullYear() === d.getFullYear() &&
                   invDate.getMonth() === d.getMonth() &&
                   invDate.getDate() === d.getDate();
          })
          .reduce((sum, inv) => sum + inv.total, 0);
        chartData.push({ name: label, sales: dayTotal });
      }

      // Real Activity Feed
      const recentInvoices = invoices.slice(-3);
      const recentQuotes = quotations.slice(-3);
      const activities = [
        ...recentInvoices.map((inv: any) => ({
          id: `inv-${inv.id}`,
          text: `Invoice ${inv.invoiceNumber} created for ${inv.customerName}`,
          user: currentUser?.name || 'User',
          time: new Date(inv.date).toLocaleDateString()
        })),
        ...recentQuotes.map((q: any) => ({
          id: `q-${q.id}`,
          text: `Quotation for ${q.customerName} added`,
          user: currentUser?.name || 'User',
          time: new Date(q.date).toLocaleDateString()
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      return {
        shopName: settings[0]?.shopName || 'Hanuman ERP System',
        userName: currentUser?.name || 'User',
        userEmail: currentUser?.email || '',
        userInitials: (currentUser?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        productCount: products.length,
        totalSales,
        totalPurchases,
        receivables,
        payables,
        totalGst,
        lowStock,
        toBePacked: 0,
        toBeShipped: 0,
        toBeDelivered: 0,
        toBeInvoiced: invoices.filter(i => i.status === 'draft').length,
        toBeReceived: purchaseOrders.filter(po => po.status === 'issued').length,
        topSelling,
        topStocked: [...products].sort((a, b) => b.stock - a.stock).slice(0, 3),
        chartData,
        recentActivities: activities,
      };
    } catch (e) {
      console.error('Dashboard calc error:', e);
      return null;
    }
  }, []);

  // Use live chart data from stats (last 30 days), fallback to empty array
  const data = stats?.chartData ?? [];

  return (
    <Box>
      {/* Greeting Header */}
      <Box p="xl" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <Group justify="space-between">
          <Group gap="md">
            <Avatar size="xl" radius="xl" color="blue">{stats?.userInitials ?? 'U'}</Avatar>
            <Stack gap={0}>
              <Title order={3} fw={600}>Hello, {stats?.userName ?? 'User'}</Title>
              <Text size="sm" c="dimmed">{stats?.userEmail ?? ''}</Text>
            </Stack>
          </Group>
          <Group gap="xl">
            <Box style={{ textAlign: 'right' }}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Direct Sales</Text>
              <Title order={4} c="blue">₹ {stats?.totalSales?.toLocaleString() || '0'}</Title>
            </Box>
          </Group>
        </Group>
      </Box>

      <Tabs defaultValue="dashboard" styles={{
        tab: { padding: '15px 20px', fontWeight: 500 },
        root: { borderBottom: '1px solid #e2e8f0' }
      }}>
        <Tabs.List px="md">
          <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
          <Tabs.Tab value="getting-started">
            <Group gap={5}>
              Getting Started 
              {(!stats?.shopName || stats?.shopName === 'Enterprise ERP' || stats?.productCount === 0) && <Badge size="xs" color="red" circle variant="filled"> </Badge>}
            </Group>
          </Tabs.Tab>
          <Tabs.Tab value="recent-updates">Recent Updates</Tabs.Tab>
        </Tabs.List>

        <Box p="md" bg="#f8f9fa">
          <Tabs.Panel value="getting-started" pb="xl">
            <Paper withBorder p="xl" radius="md" bg="white" maw={1000} mx="auto">
              <Stack gap="xl">
                 <Group justify="space-between" align="flex-start">
                    <Group gap="md">
                       <Box w={80} h={80} bg="indigo.0" className="hanuman-logo-animated divine-glow" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src="/src/logo.png" style={{ width: '85%', height: '85%', objectFit: 'contain' }} alt="Logo" />
                       </Box>
                       <Box>
                           <Title order={3}>Welcome to Hanuman ERP System <Box component="span" c="blue" style={{ cursor: 'pointer', fontSize: rem(14) }}>Overview</Box></Title>
                          <Text size="sm" c="dimmed">The easy-to-use inventory software that you can set up in no time!</Text>
                       </Box>
                    </Group>
                    <Button variant="default" size="xs" leftSection={<Plus size={14} />}>Quick Create</Button>
                 </Group>
                <Paper withBorder p="md" bg="#f8f9fa" radius="md">
                   <Group justify="space-between" mb="md">
                      <Group gap="xs">
                         <Text fw={700}>Let's get you up and running</Text>
                         <Button variant="outline" size="compact-xs">Mark as Completed</Button>
                      </Group>
                      <Group gap="xs" style={{ flex: 1, maxWidth: 300 }}>
                         <Box style={{ flex: 1, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                            <Box style={{ width: '50%', height: '100%', backgroundColor: '#40c057' }} />
                         </Box>
                         <Text size="xs" fw={700} c="dimmed">50% Completed</Text>
                      </Group>
                   </Group>
                   <Grid gutter="xl">
                      <Grid.Col span={4}>
                         <Stack gap={5}>
                            <Group gap="xs" c="blue">
                               <CheckCircle size={16} fill="white" />
                               <Text size="sm" fw={600}>Configure your Inventory</Text>
                            </Group>
                            <Group gap="xs" c="dimmed">
                               <CheckCircle size={16} fill="#40c057" color="white" />
                               <Text size="sm">Configure the Purchases module</Text>
                            </Group>
                            <Group gap="xs" c="dimmed">
                               <CheckCircle size={16} fill="#40c057" color="white" />
                               <Text size="sm">Configure the Sales module</Text>
                            </Group>
                         </Stack>
                      </Grid.Col>
                      <Grid.Col span={8}>
                         <Stack gap="xs">
                            <Text fw={700}>Configure your Inventory</Text>
                            <Text size="xs" c="dimmed">Add the goods or services that your business deals with in Hanuman ERP. You can also create an Item with Variants or combine multiple items into one by creating a composite item.</Text>
                            <Text size="sm" fw={600} mt="md">Item created</Text>
                            <Anchor size="sm" c="blue">Create a composite item</Anchor>
                         </Stack>
                      </Grid.Col>
                   </Grid>
                </Paper>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="dashboard">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 8.5 }}>
                <Stack gap="md">
                  <Paper withBorder radius="md" p="0" className="dashboard-card">
                    <Group justify="space-between" p="md">
                      <Text fw={600}>Top Selling Items</Text>
                      <Group gap="xs" style={{ cursor: 'pointer' }}>
                        <Text size="xs" c="dimmed">This Month</Text>
                        <ChevronDown size={14} />
                      </Group>
                    </Group>
                    <Divider />
                    <Box p="xl">
                      {stats?.topSelling?.length ? (
                        <Group align="flex-start" gap="xl">
                           <Box w={100} h={100} bg="gray.1" style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={40} color="#adb5bd" />
                           </Box>
                            <Stack gap={0}>
                               <Text size="sm" fw={500}>{stats?.topSelling?.[0]?.name || 'No Items'}</Text>
                               <Text size="sm" fw={700}>{stats?.topSelling?.[0]?.qty || 0} units sold</Text>
                               <Text size="xs" c="green" fw={700}>₹ {stats?.topSelling?.[0]?.revenue?.toLocaleString()}</Text>
                            </Stack>
                           <Box style={{ flex: 1, textAlign: 'center' }}>
                              <Stack align="center" gap="xs" mt="md">
                                 <Image src="https://img.icons8.com/color/96/empty-box.png" w={60} />
                                 <Text size="xs" c="dimmed" maw={300}>Your top selling items will show up here after you've made a few sales.</Text>
                              </Stack>
                           </Box>
                        </Group>
                      ) : (
                        <Center h={150}>
                           <Text size="sm" c="dimmed">No sales data found during this period.</Text>
                        </Center>
                      )}
                    </Box>
                  </Paper>

                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Paper withBorder radius="md" p="0" className="dashboard-card">
                      <Group justify="space-between" p="md">
                        <Text fw={600}>Top Stocked Items</Text>
                        <Group gap="xs" style={{ cursor: 'pointer' }}>
                          <Text size="xs" c="dimmed">As of: This Month</Text>
                          <ChevronDown size={14} />
                        </Group>
                      </Group>
                      <Divider />
                      <Box p="md">
                        <Group mb="md">
                          <Button variant="filled" size="compact-xs" radius="xl">By Quantity</Button>
                          <Button variant="default" size="compact-xs" radius="xl" c="dimmed">By Value</Button>
                        </Group>
                        <Stack gap="sm">
                           {stats?.topStocked?.map((item: any) => (
                             <Group justify="space-between" key={item.id}>
                                <Group gap="sm">
                                   <Box w={32} h={32} bg="gray.1" style={{ borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Package size={16} color="#adb5bd" />
                                   </Box>
                                   <Text size="xs" fw={500}>{item.name}</Text>
                                </Group>
                                <Text size="xs" fw={700}>{item.stock}</Text>
                             </Group>
                           ))}
                        </Stack>
                      </Box>
                    </Paper>
 
                    <Paper withBorder radius="md" p="0" className="dashboard-card">
                      <Group justify="space-between" p="md">
                        <Text fw={600}>Sales By Channel</Text>
                        <Group gap="xs" style={{ cursor: 'pointer' }}>
                          <Text size="xs" c="dimmed">This Month</Text>
                          <ChevronDown size={14} />
                        </Group>
                      </Group>
                      <Divider />
                      <Box p="md">
                        <Stack gap="xs">
                           <Text size="xs" c="dimmed">Total Sales</Text>
                           <Title order={3}>₹ {stats?.totalSales?.toLocaleString() || '0'}</Title>
                           <Box h={8} bg="blue" style={{ borderRadius: 4 }} />
                           <Group justify="space-between" mt="md">
                              <Group gap="xs">
                                 <Box w={8} h={8} bg="red" style={{ borderRadius: 2 }} />
                                 <Text size="xs">Direct Sales</Text>
                              </Group>
                              <Text size="xs" fw={700}>₹ {stats?.totalSales?.toLocaleString() || '0'}</Text>
                           </Group>
                        </Stack>
                      </Box>
                    </Paper>
                  </SimpleGrid>

                  <Paper withBorder radius="md" p="0" className="dashboard-card">
                    <Group justify="space-between" p="md">
                      <Text fw={600}>Sales Order Summary</Text>
                      <Group gap="xs" style={{ cursor: 'pointer' }}>
                        <Text size="xs" c="dimmed">This Month</Text>
                        <ChevronDown size={14} />
                      </Group>
                    </Group>
                    <Divider />
                    <Box p="md">
                      <Group mb="md">
                        <Button variant="filled" size="compact-xs" radius="xl">By Quantity</Button>
                        <Button variant="default" size="compact-xs" radius="xl" c="dimmed">By Value</Button>
                      </Group>
                      <Box h={250} mt="xl" style={{ position: 'relative' }}>
                        <Text size="xs" c="dimmed" style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
                          No sales orders created during this period.
                        </Text>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#adb5bd' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#adb5bd' }} domain={[0, 5000]} ticks={[0, 1000, 2000, 3000, 4000, 5000]} />
                            <Area type="monotone" dataKey="sales" stroke="#dee2e6" fill="#f8f9fa" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3.5 }}>
                <Paper withBorder radius="md" p="0" h="100%">
                  <Tabs defaultValue="pending" styles={{ tab: { flex: 1, padding: '15px' } }}>
                    <Tabs.List>
                      <Tabs.Tab value="pending">Pending Actions</Tabs.Tab>
                      <Tabs.Tab value="recent">Recent Activities</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="pending" p="md">
                      <Stack gap="xl">
                        <Box>
                          <Group gap="xs" mb="md">
                            <ShoppingCart size={18} color="#f59e0b" />
                            <Text fw={700} size="xs" tt="uppercase">Sales</Text>
                          </Group>
                          <Stack gap={0}>
                            {[
                              { label: 'To Be Packed', value: 0 },
                              { label: 'To Be Shipped', value: 0 },
                              { label: 'To Be Delivered', value: 0 },
                              { label: 'To Be Invoiced', value: stats?.toBeInvoiced || 0 },
                            ].map((item) => (
                              <Group key={item.label} justify="space-between" py="xs" style={{ borderBottom: '1px solid #f1f3f5' }}>
                                <Group gap="xs">
                                   <ChevronRight size={14} color="gray" />
                                   <Text size="xs">{item.label}</Text>
                                </Group>
                                <Text size="xs" fw={700}>{item.value}</Text>
                              </Group>
                            ))}
                          </Stack>
                        </Box>
                        <Box>
                          <Group gap="xs" mb="md">
                            <Truck size={18} color="#f59e0b" />
                            <Text fw={700} size="xs" tt="uppercase">Purchases</Text>
                          </Group>
                          <Stack gap={0}>
                             <Group justify="space-between" py="xs" style={{ borderBottom: '1px solid #f1f3f5' }}>
                                <Group gap="xs">
                                   <ChevronRight size={14} color="gray" />
                                   <Text size="xs">To Be Received</Text>
                                </Group>
                                <Text size="xs" fw={700}>{stats?.toBeReceived || 0}</Text>
                             </Group>
                             <Group justify="space-between" py="xs" style={{ borderBottom: '1px solid #f1f3f5' }}>
                                <Group gap="xs">
                                   <ChevronRight size={14} color="gray" />
                                   <Text size="xs">Receive In Progress</Text>
                                </Group>
                                <Text size="xs" fw={700}>0</Text>
                             </Group>
                          </Stack>
                        </Box>
                      </Stack>
                    </Tabs.Panel>
                    <Tabs.Panel value="recent" p="md">
                       <Stack gap="md">
                          {stats?.recentActivities?.length ? stats.recentActivities.map((activity: any) => (
                            <Group key={activity.id} align="flex-start" wrap="nowrap">
                               <Box mt={4}><MessageSquare size={14} color="gray" /></Box>
                               <Stack gap={0}>
                                  <Text size="xs" fw={600}>{activity.text}</Text>
                                  <Text size="xs" c="dimmed">Added By {activity.user}</Text>
                                  <Text size="xs" c="dimmed">{activity.time}</Text>
                                </Stack>
                            </Group>
                          )) : (
                            <Center py="xl">
                              <Text size="xs" c="dimmed">No recent activities found</Text>
                            </Center>
                          )}
                       </Stack>
                    </Tabs.Panel>
                  </Tabs>
                </Paper>
              </Grid.Col>
            </Grid>

            <Paper withBorder radius="md" p="xl" mt="md" bg="white" style={{ borderLeft: '4px solid #228be6' }}>
              <Grid align="center">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack gap="xs">
                    <Title order={3}>GST Compliance Ready</Title>
                    <Text size="sm" c="dimmed">
                      Your system is currently tracking <b>₹ {stats?.totalGst?.toLocaleString() || '0'}</b> in GST collection.
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Group justify="flex-end">
                     <Button variant="light" size="md" leftSection={<FileText size={16} />} onClick={() => onViewChange?.('reports')}>
                       Reports
                     </Button>
                  </Group>
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="recent-updates" p="xl">
            <Paper withBorder p="xl" radius="md" bg="white">
              <Stack align="center" gap="xs">
                <History size={40} color="gray" />
                <Text fw={500}>No recent updates</Text>
                <Text size="sm" c="dimmed">Your activities will appear here.</Text>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Box>
      </Tabs>
    </Box>
  );
}
