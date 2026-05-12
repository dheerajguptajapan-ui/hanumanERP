import React, { useState } from 'react';
import { backupService } from '../utils/backupService';
import { 
  AppShell, 
  Burger, 
  Group, 
  NavLink, 
  Title, 
  Text,
  rem,
  ThemeIcon,
  Box,
  TextInput,
  ActionIcon,
  Avatar,
  Stack,
  Button,
  UnstyledButton,
  Divider,
  Paper,
  Menu,
  Anchor,
  Grid,
  SimpleGrid,
  Center,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings as SettingsIcon,
  Plus,
  PlusCircle,
  Truck,
  Users,
  Factory,
  Search,
  Bell,
  HelpCircle,
  PlayCircle,
  ChevronRight,
  Monitor,
  Menu as MenuIcon,
  MessageSquare,
  ArrowRight,
  History as HistoryIcon,
} from 'lucide-react';
import { ProductTour } from './ProductTour';
import { usePermissions } from '../hooks/usePermissions';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Layout({ children, activeView, onViewChange }: LayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [tourOpened, setTourOpened] = useState(false);

  // Background Auto-Backup (Every 10 minutes)
  React.useEffect(() => {
    const timer = setInterval(() => {
      backupService.performAutoBackup();
    }, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const { can, isAdmin } = usePermissions();
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  const navItems = [
    { label: 'Home', icon: LayoutDashboard, value: 'dashboard' },
    { 
      label: 'Items', 
      icon: Package, 
      value: 'inventory_parent',
      children: [
        { label: 'Items', value: 'inventory', module: 'Items', sub: 'Item' }
      ]
    },
    { 
      label: 'Inventory', 
      icon: Factory, 
      value: 'inventory_adjustments_parent',
      children: [
        { label: 'Inventory Adjustments', value: 'inventory-adjustments', module: 'Items', sub: 'Inventory Adjustments' },
        { label: 'Packages', value: 'packages', module: 'Sales', sub: 'Package' },
        { label: 'Shipments', value: 'shipments', module: 'Sales', sub: 'Shipment Order' },
        { label: 'Move Orders', value: 'move-orders', module: 'Items', sub: 'Move Order' },
        { label: 'Putaways', value: 'putaways', module: 'Items', sub: 'Putaway' },
      ]
    },
    { 
      label: 'Sales', 
      icon: ShoppingCart, 
      value: 'sales_parent',
      children: [
        { label: 'Customers', value: 'customers', module: 'Contacts', sub: 'Customers' },
        { label: 'Sales Orders', value: 'sales_orders', module: 'Sales', sub: 'Sales Orders' },
        { label: 'Invoices', value: 'invoices', module: 'Sales', sub: 'Invoices' },
        { label: 'Sales Receipts', value: 'sales-receipts', module: 'Sales', sub: 'Sales Receipt' },
        { label: 'Payments Received', value: 'payments-received', module: 'Sales', sub: 'Customer Payments' },
        { label: 'Sales Returns', value: 'sales-returns', module: 'Sales', sub: 'Sales Return' },
        { label: 'Credit Notes', value: 'credit-notes', module: 'Sales', sub: 'Credit Notes' },
      ]
    },
    { 
      label: 'Purchases', 
      icon: Truck, 
      value: 'purchases_parent',
      children: [
        { label: 'Vendors', value: 'vendors', module: 'Contacts', sub: 'Vendors' },
        { label: 'Expenses', value: 'expenses', module: 'Purchases', sub: 'Expenses' },
        { label: 'Purchase Orders', value: 'purchase-orders', module: 'Purchases', sub: 'Purchase Orders' },
        { label: 'Purchase Receives', value: 'purchase-receives', module: 'Purchases', sub: 'Purchase Receive' },
        { label: 'Bills', value: 'bills', module: 'Purchases', sub: 'Bills' },
        { label: 'Payments Made', value: 'payments-made', module: 'Purchases', sub: 'Vendor Payments' },
        { label: 'Vendor Credits', value: 'vendor-credits', module: 'Purchases', sub: 'Vendor Credits' },
      ]
    },
    { label: 'Reports', icon: BarChart3, value: 'reports' },
  ];

  const filteredNavItems = navItems.map(item => {
    if (item.children) {
      const visibleChildren = item.children.filter(child => {
        if (!child.module || !child.sub) return true;
        return can(child.module, child.sub, 'view');
      });
      return { ...item, children: visibleChildren };
    }
    return item;
  }).filter(item => {
    if (item.value === 'dashboard') return true;
    if (item.value === 'reports') return true;
    return item.children && item.children.length > 0;
  });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="0"
    >
      <AppShell.Header className="app-header">
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap" style={{ flex: 1 }}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <ActionIcon variant="subtle" color="gray" hiddenFrom="sm">
              <MenuIcon size={20} />
            </ActionIcon>
            <Group gap="xs" wrap="nowrap" style={{ flex: 1, maxWidth: 400 }}>
              <TextInput
                placeholder={`Search in ${activeView === 'customers' ? 'Customers' : activeView === 'inventory' ? 'Items' : activeView === 'sales_orders' ? 'Sales Orders' : 'Inventory'} (/)`}
                leftSection={<Search size={16} />}
                rightSection={<ChevronRight size={14} />}
                size="sm"
                style={{ flex: 1 }}
                styles={{
                  input: { backgroundColor: '#f1f3f5', border: 'none' }
                }}
              />
            </Group>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Text size="xs" fw={500} c="blue" visibleFrom="md" style={{ cursor: 'pointer' }}>
              Your premium trial pla...
            </Text>
            <Text size="xs" fw={700} c="blue" visibleFrom="md" style={{ cursor: 'pointer' }}>
              Subscribe
            </Text>
            
            <Group gap="xs" visibleFrom="sm" mx="xs">
              <Text size="sm" fw={500}>jhakkasnihongo</Text>
              <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
            </Group>

            <Menu shadow="xl" width={800} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} radius="md">
              <Menu.Target>
                <ActionIcon variant="filled" color="indigo" size="lg" radius="sm">
                  <Plus size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown p="xl">
                <Grid gutter={40}>
                  <Grid.Col span={3}>
                    <Stack gap="md">
                       <Group gap="xs">
                          <Users size={16} color="gray" />
                          <Text fw={700} size="xs" c="dimmed" tt="uppercase">General</Text>
                       </Group>
                       <Stack gap={5}>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-customer')}>Add User</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-item')}>Item</Anchor>
                       </Stack>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={3}>
                    <Stack gap="md">
                       <Group gap="xs">
                          <Package size={16} color="gray" />
                          <Text fw={700} size="xs" c="dimmed" tt="uppercase">Inventory</Text>
                       </Group>
                       <Stack gap={5}>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('inventory-adjustments')}>Inventory Adjustments</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('packages')}>Packages</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('shipments')}>Shipment</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('move-orders')}>Move Orders</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('putaways')}>Putaways</Anchor>
                       </Stack>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={3}>
                    <Stack gap="md">
                       <Group gap="xs">
                          <ShoppingCart size={16} color="gray" />
                          <Text fw={700} size="xs" c="dimmed" tt="uppercase">Sales</Text>
                       </Group>
                       <Stack gap={5}>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-customer')}>Customer</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-invoice')}>Invoices</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-sales-receipt')}>Sales Receipts</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-sales-order')}>Sales Order</Anchor>
                          <Anchor size="sm" c="orange.7" fw={500} onClick={() => onViewChange('payments-received')}>Customer Payment</Anchor>
                          <Anchor size="sm" c="gray.7">Credit Notes</Anchor>
                       </Stack>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={3}>
                    <Stack gap="md">
                       <Group gap="xs">
                          <Truck size={16} color="gray" />
                          <Text fw={700} size="xs" c="dimmed" tt="uppercase">Purchases</Text>
                       </Group>
                       <Stack gap={5}>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-vendor')}>Vendor</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('expenses')}>Expenses</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-bill')}>Bill</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-purchase-order')}>Purchase Order</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('purchase-receives')}>Purchase Receive</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('payments-made')}>Vendor Payment</Anchor>
                          <Anchor size="sm" c="gray.7" onClick={() => onViewChange('new-vendor-credit')}>Vendor Credit</Anchor>
                       </Stack>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Menu.Dropdown>
            </Menu>
            
            <Group gap="xs">
              <ActionIcon variant="subtle" color="gray">
                <Users size={18} />
              </ActionIcon>
              
              <Menu shadow="md" width={300} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <Bell size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown p="md">
                  <Group justify="space-between" mb="md">
                    <Text fw={700}>Notifications</Text>
                    <Anchor size="xs">Mark all as read</Anchor>
                  </Group>
                  <Divider mb="md" />
                  <Center py="xl">
                    <Stack align="center" gap="xs">
                       <Bell size={40} color="#e2e8f0" />
                       <Text c="dimmed" size="sm">No new notifications</Text>
                    </Stack>
                  </Center>
                </Menu.Dropdown>
              </Menu>

              <ActionIcon variant="subtle" color="gray" onClick={() => onViewChange('settings')}>
                <SettingsIcon size={18} />
              </ActionIcon>

              <Menu shadow="md" width={320} position="bottom-end">
                 <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                       <HelpCircle size={18} />
                    </ActionIcon>
                 </Menu.Target>
                 <Menu.Dropdown p="lg">
                    <SimpleGrid cols={3} spacing="lg">
                       <Stack align="center" gap={5}>
                          <Box p="sm" bg="gray.1" style={{ borderRadius: '8px' }}><FileText size={20} color="gray" /></Box>
                          <Text size="xs" ta="center">Help Documents</Text>
                       </Stack>
                       <Stack align="center" gap={5}>
                          <Box p="sm" bg="gray.1" style={{ borderRadius: '8px' }}><MessageSquare size={20} color="gray" /></Box>
                          <Text size="xs" ta="center">FAQs</Text>
                       </Stack>
                       <Stack align="center" gap={5}>
                          <Box p="sm" bg="gray.1" style={{ borderRadius: '8px' }}><Users size={20} color="gray" /></Box>
                          <Text size="xs" ta="center">Forum</Text>
                       </Stack>
                       <Stack align="center" gap={5}>
                          <Box p="sm" bg="gray.1" style={{ borderRadius: '8px' }}><PlayCircle size={20} color="gray" /></Box>
                          <Text size="xs" ta="center">Video Tutorials</Text>
                       </Stack>
                       <Stack align="center" gap={5}>
                          <Box p="sm" bg="gray.1" style={{ borderRadius: '8px' }}><ArrowRight size={20} color="gray" /></Box>
                          <Text size="xs" ta="center">Explore Features</Text>
                       </Stack>
                       <Stack align="center" gap={5}>
                          <Box p="sm" bg="gray.1" style={{ borderRadius: '8px' }}><HistoryIcon size={20} color="gray" /></Box>
                          <Text size="xs" ta="center">Migration Guide</Text>
                       </Stack>
                    </SimpleGrid>
                 </Menu.Dropdown>
              </Menu>
            </Group>

            <Menu shadow="xl" width={300} position="bottom-end">
              <Menu.Target>
                <Avatar src={null} alt="User" color="orange" size="sm" style={{ cursor: 'pointer' }}>D</Avatar>
              </Menu.Target>
              <Menu.Dropdown p="md">
                <Group mb="md" wrap="nowrap">
                  <Avatar color="orange" size="lg">D</Avatar>
                  <Stack gap={0}>
                    <Text fw={700}>System Admin</Text>
                    <Text size="xs" c="dimmed">admin@enterprise-erp.com</Text>
                  </Stack>
                </Group>
                <Text size="xs" c="dimmed" mb="xs">User ID: 90002830138 • Org ID: 90002919413</Text>
                <Divider my="sm" />
                <Menu.Item leftSection={<Users size={14} />}>My Account</Menu.Item>
                <Menu.Item leftSection={<SettingsIcon size={14} />} onClick={() => onViewChange('settings')}>Settings</Menu.Item>
                <Divider my="sm" />
                <Menu.Item color="red" leftSection={<ArrowRight size={14} />}>Sign Out</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="app-sidebar">
        <ScrollArea style={{ flex: 1 }}>
          <Stack align="center" py="xl" gap="md">
            <Box 
              w={96} 
              h={96} 
              bg="white" 
              className="hanuman-logo-animated divine-glow" 
              style={{ 
                borderRadius: '20px', 
                overflow: 'hidden', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
            >
              <img src="/logo.png" style={{ width: '85%', height: '85%', objectFit: 'contain' }} alt="Logo" />
            </Box>
            <Title order={3} c="white" ta="center" style={{ lineHeight: 1.2, letterSpacing: '0.5px' }}>
              Hanuman Enterprise Solution<br />
              <Text span size="xs" fw={400} opacity={0.7}>ERP SOFTWARE</Text>
            </Title>
          </Stack>

          <Box p="xs">
            <Stack gap={4}>
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.value}
                  label={item.label}
                  leftSection={<item.icon size={18} strokeWidth={1.5} />}
                  active={activeView === item.value || (item.children?.some(c => c.value === activeView))}
                  defaultOpened={activeView === item.value || (item.children?.some(c => c.value === activeView))}
                  childrenOffset={28}
                  onClick={() => !item.children && onViewChange(item.value)}
                  variant="filled"
                  styles={{
                    label: { fontWeight: 500, fontSize: rem(13) },
                    root: { borderRadius: rem(6), marginBottom: rem(2) }
                  }}
                >
                  {item.children?.map((child) => (
                    <NavLink
                      key={child.value}
                      label={child.label}
                      active={activeView === child.value}
                      onClick={() => onViewChange(child.value)}
                      variant="subtle"
                      styles={{
                        label: { fontWeight: activeView === child.value ? 600 : 400, fontSize: rem(13) },
                        root: { borderRadius: rem(6), marginBottom: rem(2) }
                      }}
                      rightSection={
                        (child.label === 'Items' || child.label === 'Customers' || child.label === 'Sales Orders' || child.label === 'Sales Receipts' || child.label === 'Vendors' || child.label === 'Expenses' || child.label === 'Purchase Orders' || child.label === 'Vendor Credits' || child.label === 'Inventory Adjustments' || child.label === 'Packages' || child.label === 'Shipments' || child.label === 'Move Orders' || child.label === 'Putaways') && can(child.module!, child.sub!, 'create') ? (
                          <ActionIcon 
                            size="sm" 
                            variant="subtle" 
                            color="gray" 
                            onClick={(e) => {
                              e.stopPropagation();
                              const viewMap: any = { 
                                'Items': 'new-item', 
                                'Customers': 'new-customer', 
                                'Sales Orders': 'new-sales-order',
                                'Sales Receipts': 'new-sales-receipt',
                                'Vendors': 'new-vendor',
                                'Expenses': 'new-expense',
                                'Purchase Orders': 'new-purchase-order',
                                'Vendor Credits': 'new-vendor-credit',
                                'Inventory Adjustments': 'new-adjustment',
                                'Packages': 'packages',
                                'Shipments': 'shipments',
                                'Move Orders': 'move-orders',
                                'Putaways': 'putaways'
                              };
                              onViewChange(viewMap[child.label]);
                            }}
                          >
                            <Plus size={14} />
                          </ActionIcon>
                        ) : null
                      }
                    />
                  ))}
                </NavLink>
              ))}
            </Stack>
          </Box>

          <Box p="md" mt="auto">
            <Paper 
              p="md" 
              radius="md" 
              style={{ 
                background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Stack gap="xs">
                <Group gap="xs">
                  <PlayCircle size={16} color="#6366f1" fill="#6366f1" />
                  <Text size="xs" fw={700} tt="uppercase" lts="1px">Take a live product tour</Text>
                </Group>
                <Text size="xs" c="gray.4">
                  Get an in-depth overview of our professional inventory management features.
                </Text>
                <Text 
                  size="xs" 
                  fw={700} 
                  c="indigo.3" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTourOpened(true)}
                >
                  Start Tour Now &gt;
                </Text>
              </Stack>
              <Box style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.2 }}>
                <Monitor size={64} />
              </Box>
            </Paper>
          </Box>
        </ScrollArea>
        <ProductTour opened={tourOpened} onClose={() => setTourOpened(false)} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box p="0">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
