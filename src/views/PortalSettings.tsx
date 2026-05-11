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
  ActionIcon,
  Divider,
  ScrollArea,
  Switch,
  Badge,
  Textarea,
  Tabs,
  rem
} from '@mantine/core';
import { 
  ChevronLeft, 
  User, 
  Briefcase,
  Globe,
  Lock,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';
import { db } from '../db';
import { notifications } from '@mantine/notifications';

export function PortalSettings({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState({
    customerPortal: true,
    vendorPortal: false,
    bannerMessage: 'Welcome to our Secure Business Portal',
    portalUrl: 'https://portal.hanuman-erp.com/jhakkasdheeraj'
  });

  useEffect(() => {
    db.settings.toCollection().first().then(s => {
      if (s?.portalSettings) {
        setSettings({ ...settings, ...s.portalSettings });
      }
    });
  }, []);

  const handleSave = async () => {
    const existing = await db.settings.toCollection().first();
    if (existing) {
      await db.settings.update(existing.id!, { portalSettings: settings });
    }
    notifications.show({
      title: 'Success',
      message: 'Portal settings updated',
      color: 'green'
    });
  };

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
       <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
             <Group gap="md">
                <ActionIcon variant="subtle" color="gray" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                <Title order={4}>Client & Vendor Portals</Title>
             </Group>
             <Button onClick={handleSave}>Save Settings</Button>
          </Group>
       </Box>

       <ScrollArea style={{ flex: 1 }} p="xl" bg="#f8f9fa">
          <Stack maw={900} mx="auto" gap="xl">
             
             <Tabs defaultValue="customer" variant="pills" radius="xl">
                <Tabs.List mb="xl">
                   <Tabs.Tab value="customer" leftSection={<User size={14} />}>Customer Portal</Tabs.Tab>
                   <Tabs.Tab value="vendor" leftSection={<Briefcase size={14} />}>Vendor Portal</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="customer">
                   <Stack gap="xl">
                      <Paper withBorder p="xl" radius="md">
                         <Stack gap="lg">
                            <Group justify="space-between">
                               <Stack gap={0}>
                                  <Text fw={700}>Enable Customer Portal</Text>
                                  <Text size="sm" c="dimmed">Allow customers to view their invoices, track shipments, and make payments online.</Text>
                               </Stack>
                               <Switch 
                                 checked={settings.customerPortal} 
                                 onChange={(e) => setSettings({...settings, customerPortal: e.currentTarget.checked})} 
                               />
                            </Group>

                            <Divider />

                            <Stack gap="md">
                               <Text size="sm" fw={600}>Portal Branding & Access</Text>
                               <TextInput 
                                 label="Portal URL Alias" 
                                 description="This will be the sub-path for your dedicated customer portal."
                                 value={settings.portalUrl}
                                 readOnly
                                 rightSection={<Badge size="xs" color="gray">Locked</Badge>}
                               />
                               <Textarea 
                                 label="Welcome Banner Message" 
                                 placeholder="Personalize the portal welcome screen..."
                                 value={settings.bannerMessage}
                                 onChange={(e) => setSettings({...settings, bannerMessage: e.currentTarget.value})}
                               />
                            </Stack>

                            <Paper bg="blue.0" p="md" radius="sm" withBorder style={{ borderColor: '#3b82f6' }}>
                               <Group justify="space-between">
                                  <Group gap="sm">
                                     <Globe size={20} color="#3b82f6" />
                                     <Text size="sm" fw={600}>Your portal is active at:</Text>
                                  </Group>
                                  <Text size="xs" c="blue" style={{ textDecoration: 'underline', cursor: 'pointer' }}>{settings.portalUrl}</Text>
                               </Group>
                            </Paper>
                         </Stack>
                      </Paper>

                      <Paper withBorder p="xl" radius="md">
                         <Stack gap="md">
                            <Text fw={700}>Security & Permissions</Text>
                            <Group justify="space-between">
                               <Text size="sm">Allow customers to edit their billing address</Text>
                               <Switch defaultChecked size="sm" />
                            </Group>
                            <Group justify="space-between">
                               <Text size="sm">Allow customers to view Statement of Accounts</Text>
                               <Switch defaultChecked size="sm" />
                            </Group>
                            <Group justify="space-between">
                               <Text size="sm">Require Password for PDF Downloads</Text>
                               <Switch size="sm" />
                            </Group>
                         </Stack>
                      </Paper>
                   </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="vendor">
                   <Paper withBorder p="xl" radius="md">
                      <Stack gap="lg" align="center" py={40}>
                         <Lock size={48} color="#94a3b8" />
                         <Stack gap={4} align="center">
                            <Title order={4}>Vendor Portal is currently disabled</Title>
                            <Text size="sm" c="dimmed" ta="center">Enable the vendor portal to allow your suppliers to upload bills, track purchase orders, and manage inventory receipts.</Text>
                         </Stack>
                         <Button variant="outline" color="blue" onClick={() => setSettings({...settings, vendorPortal: true})}>Enable Vendor Portal</Button>
                      </Stack>
                   </Paper>
                </Tabs.Panel>
             </Tabs>

          </Stack>
       </ScrollArea>
    </Box>
  );
}
