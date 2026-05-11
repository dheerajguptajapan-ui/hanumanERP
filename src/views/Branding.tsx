import React from 'react';
import { 
  Box, 
  Stack, 
  Group, 
  Title, 
  Text, 
  Button, 
  Paper, 
  Divider, 
  SimpleGrid,
  Badge,
  ActionIcon,
  Switch,
  ScrollArea,
  Radio,
  ColorSwatch,
  CheckIcon,
  rem,
  TextInput,
  Anchor,
  Collapse
} from '@mantine/core';
import { 
  Upload, 
  ChevronRight,
  Sun,
  Moon,
  Search,
  X,
  ChevronLeft,
  Settings as SettingsIcon,
  User,
  Shield,
  Clock,
  Layout,
  Mail,
  CreditCard,
  Building,
  MapPin,
  Sparkles,
  Users,
  Target,
  Zap,
  Globe,
  ChevronDown
} from 'lucide-react';
import { db } from '../db';

interface BrandingProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

const ACCENT_COLORS = [
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Green', color: '#10b981' },
  { label: 'Red', color: '#ef4444' },
  { label: 'Orange', color: '#f59e0b' },
  { label: 'Purple', color: '#7c3aed' }
];

export function Branding({ onBack, onNavigate }: BrandingProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    appearance: 'dark',
    accentColor: '#3b82f6',
    showBranding: true,
    logoUrl: null as string | null,
    organizationName: 'HARDWARE ERP'
  });

  React.useEffect(() => {
    db.settings.toCollection().first().then(settings => {
      if (settings) {
        setFormData({
          appearance: settings.appearance || 'dark',
          accentColor: settings.accentColor || '#3b82f6',
          showBranding: settings.showBranding !== undefined ? settings.showBranding : true,
          logoUrl: settings.logoUrl || null,
          organizationName: settings.organizationName || settings.shopName || 'HARDWARE ERP'
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const existingSettings = await db.settings.toCollection().first();
      const updatedData = {
        ...(existingSettings || {
          shopName: 'HARDWARE ERP',
          shopAddress: '',
          shopPhone: '',
          shopEmail: '',
          currency: 'INR',
          pdfTemplate: 'standard',
          pdfColor: '#3b82f6',
          taxRate: 0
        }),
        id: existingSettings?.id || 1,
        appearance: formData.appearance as 'light' | 'dark',
        accentColor: formData.accentColor,
        showBranding: formData.showBranding,
        logoUrl: formData.logoUrl,
        organizationName: formData.organizationName,
        shopName: formData.organizationName
      };
      
      await db.settings.put(updatedData as any);
      onBack();
    } catch (error) {
      console.error('Error saving branding settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, logoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Settings Top Header */}
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
        <Box w={260} h="100%" bg="#f8f9fa" style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
           <ScrollArea style={{ flex: 1 }} p="md">
              <Stack gap="xl">
                 {/* Organization Section */}
                 <Stack gap="xs">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Organization Settings</Text>
                    <Stack gap={2}>
                       <Box>
                          <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }}>
                             <Group gap="sm">
                                <ChevronDown size={14} color="gray" />
                                <Text size="sm" fw={600} c="gray.8">Organization</Text>
                             </Group>
                          </Group>
                          <Stack gap={2} pl={28}>
                             <SidebarItem label="Profile" onClick={() => onNavigate?.('org-profile')} />
                             <SidebarItem label="Branding" active />
                          </Stack>
                       </Box>
                    </Stack>
                 </Stack>

                 {/* Users & Roles */}
                 <Stack gap="xs">
                    <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('users')}>
                       <Group gap="sm">
                          <ChevronRight size={14} color="gray" />
                          <Text size="sm" fw={600} c="gray.8">Users & Roles</Text>
                       </Group>
                    </Group>
                 </Stack>

                 {/* Taxes & Compliance */}
                 <Stack gap="xs">
                    <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('taxes')}>
                       <Group gap="sm">
                          <ChevronRight size={14} color="gray" />
                          <Text size="sm" fw={600} c="gray.8">Taxes & Compliance</Text>
                       </Group>
                    </Group>
                 </Stack>

                 {/* Setup & Configurations */}
                 <Stack gap="xs">
                    <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('general-settings')}>
                       <Group gap="sm">
                          <ChevronRight size={14} color="gray" />
                          <Text size="sm" fw={600} c="gray.8">Setup & Configurations</Text>
                       </Group>
                    </Group>
                 </Stack>

                 {/* Customization */}
                 <Stack gap="xs">
                    <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }}>
                       <Group gap="sm">
                          <ChevronRight size={14} color="gray" />
                          <Text size="sm" fw={600} c="gray.8">Customization</Text>
                       </Group>
                    </Group>
                 </Stack>

                 {/* Automation */}
                 <Stack gap="xs">
                    <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }}>
                       <Group gap="sm">
                          <ChevronRight size={14} color="gray" />
                          <Text size="sm" fw={600} c="gray.8">Automation</Text>
                       </Group>
                    </Group>
                 </Stack>

                 {/* Module Settings */}
                 <Stack gap="xs">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="xl">Module Settings</Text>
                    <Stack gap={2}>
                       <Box>
                          <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }}>
                             <Group gap="sm">
                                <ChevronRight size={14} color="gray" />
                                <Text size="sm" fw={600} c="gray.8">General</Text>
                             </Group>
                          </Group>
                       </Box>
                       <Box>
                          <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }}>
                             <Group gap="sm">
                                <ChevronRight size={14} color="gray" />
                                <Text size="sm" fw={600} c="gray.8">Inventory</Text>
                             </Group>
                          </Group>
                       </Box>
                       <Box>
                          <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }}>
                             <Group gap="sm">
                                <ChevronRight size={14} color="gray" />
                                <Text size="sm" fw={600} c="gray.8">Online Payments</Text>
                             </Group>
                          </Group>
                       </Box>
                    </Stack>
                 </Stack>
              </Stack>
           </ScrollArea>
        </Box>

        {/* Branding Content Area */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }} h="100%">
          <ScrollArea style={{ flex: 1 }} p={40}>
            <Stack gap={40} maw={800}>
              <Title order={3} fw={500}>Branding</Title>

              {/* Logo Section */}
              <Stack gap="xl" align="center" py="xl">
                 <Stack gap={5} align="center">
                    <Title order={3} fw={700}>Organization Profile</Title>
                    <Text size="sm" c="dimmed">Set up your brand identity for professional documents</Text>
                 </Stack>

                 <Stack gap="md" align="center">
                    <Paper 
                      withBorder 
                      p={0} 
                      w={280} 
                      h={160} 
                      style={{ 
                        borderStyle: 'dashed', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        backgroundColor: '#fcfcfc', 
                        overflow: 'hidden',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        borderColor: '#e2e8f0'
                      }}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                       <input 
                         type="file" 
                         id="logo-upload" 
                         hidden 
                         accept="image/*" 
                         onChange={handleLogoUpload}
                       />
                       {formData.logoUrl ? (
                          <img src={formData.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} alt="Org Logo" />
                       ) : (
                          <Stack gap={5} align="center">
                             <Box p="md" bg="blue.0" style={{ borderRadius: '50%' }}>
                                <Upload size={24} color="#228be6" />
                             </Box>
                             <Anchor size="sm" fw={600}>Upload Organization Logo</Anchor>
                          </Stack>
                       )}
                    </Paper>
                    <Stack gap={4} align="center">
                       <Text size="xs" c="gray.7" fw={600}>Visible on invoices, bills, and notifications.</Text>
                       <Group gap="xs">
                          <Badge size="xs" variant="outline" color="gray">240x240 px</Badge>
                          <Badge size="xs" variant="outline" color="gray">Max 1MB</Badge>
                       </Group>
                       {formData.logoUrl && (
                          <Button variant="subtle" color="red" size="xs" mt="xs" onClick={() => setFormData({...formData, logoUrl: null})}>Remove Logo</Button>
                       )}
                    </Stack>
                 </Stack>

                 <TextInput 
                   label="Organization Name" 
                   placeholder="Enter your organization name" 
                   fw={500} 
                   w="100%" 
                   maw={400} 
                   size="md"
                   styles={{ input: { textAlign: 'center', fontWeight: 600 } }}
                   value={formData.organizationName}
                   onChange={(e) => setFormData({...formData, organizationName: e.currentTarget.value})}
                 />
              </Stack>

              <Divider />

              {/* Appearance Section */}
              <Stack gap="md">
                 <Text fw={600} size="sm">Appearance</Text>
                 <Group gap="xl">
                    <Paper 
                      withBorder 
                      p="xs" 
                      radius="md" 
                      w={160}
                      style={{ 
                        cursor: 'pointer', 
                        border: formData.appearance === 'dark' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        position: 'relative'
                      }}
                      onClick={() => setFormData({...formData, appearance: 'dark'})}
                    >
                       <Stack align="center" gap={8}>
                          <Box h={80} w="100%" bg="#1a1b1e" style={{ borderRadius: '6px', display: 'flex', overflow: 'hidden' }}>
                             <Box w={35} h="100%" bg="#2c2e33" />
                             <Box flex={1} style={{ display: 'flex', flexDirection: 'column' }}>
                                <Box h={15} bg="#228be6" opacity={0.8} />
                             </Box>
                          </Box>
                          <Stack align="center" gap={2}>
                             <Moon size={16} color="gray" />
                             <Text size="xs" fw={700} c="gray.7">DARK PANE</Text>
                          </Stack>
                       </Stack>
                    </Paper>

                    <Paper 
                      withBorder 
                      p="xs" 
                      radius="md" 
                      w={160}
                      style={{ 
                        cursor: 'pointer', 
                        border: formData.appearance === 'light' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      }}
                      onClick={() => setFormData({...formData, appearance: 'light'})}
                    >
                       <Stack align="center" gap={8}>
                          <Box h={80} w="100%" bg="#f8f9fa" style={{ borderRadius: '6px', display: 'flex', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                             <Box w={35} h="100%" bg="white" style={{ borderRight: '1px solid #e2e8f0' }} />
                             <Box flex={1} style={{ display: 'flex', flexDirection: 'column' }}>
                                <Box h={15} bg="#228be6" opacity={0.8} />
                             </Box>
                          </Box>
                          <Stack align="center" gap={2}>
                             <Sun size={16} color="gray" />
                             <Text size="xs" fw={700} c="gray.7">LIGHT PANE</Text>
                          </Stack>
                       </Stack>
                    </Paper>
                 </Group>
              </Stack>

              {/* Accent Color Section */}
              <Stack gap="md">
                 <Text fw={600} size="sm">Accent Color</Text>
                 <Group gap="sm">
                    {ACCENT_COLORS.map(item => (
                       <Paper 
                          key={item.label}
                          withBorder 
                          px="sm" 
                          py={6} 
                          radius="sm"
                          style={{ 
                             cursor: 'pointer', 
                             borderColor: formData.accentColor === item.color ? '#3b82f6' : '#e2e8f0',
                             backgroundColor: formData.accentColor === item.color ? '#3b82f6' : 'white'
                          }}
                          onClick={() => setFormData({...formData, accentColor: item.color})}
                       >
                          <Group gap="xs">
                             {formData.accentColor === item.color && <CheckIcon style={{ width: rem(10), height: rem(10), color: 'white' }} />}
                             <Box w={16} h={16} bg={item.color} style={{ borderRadius: '4px' }} />
                             <Text size="xs" fw={600} c={formData.accentColor === item.color ? 'white' : 'gray.7'}>{item.label}</Text>
                          </Group>
                       </Paper>
                    ))}
                    <Paper withBorder px="sm" py={6} radius="sm" style={{ cursor: 'pointer', border: 'none', background: 'linear-gradient(45deg, #7c3aed 0%, #d946ef 100%)' }}>
                        <Group gap="xs">
                           <Box w={16} h={16} bg="white" opacity={0.3} style={{ borderRadius: '4px' }} />
                           <Text size="xs" fw={600} c="white">Gradient</Text>
                        </Group>
                    </Paper>
                 </Group>
                 <Text size="xs" c="dimmed">Note: These preferences will be applied across Hanuman ERP apps, including the customer and vendor portals.</Text>
              </Stack>

              <Divider />

              {/* Branding Toggle */}
              <Group justify="space-between">
                 <Stack gap={0}>
                    <Text size="sm" fw={600}>I'd like to keep Hanuman branding for this organization</Text>
                    <Text size="xs" c="dimmed">Retain non-obtrusive Hanuman Branding, which will be visible to your customers in places like transactional emails and PDFs.</Text>
                 </Stack>
                 <Switch 
                   checked={formData.showBranding} 
                   onChange={(e) => setFormData({...formData, showBranding: e.currentTarget.checked})}
                 />
              </Group>

              <Divider />

              {/* PDF Templates Quick Link */}
              <Stack gap="md">
                 <Group justify="space-between">
                    <Stack gap={0}>
                       <Text fw={600} size="sm">Document Templates</Text>
                       <Text size="xs" c="dimmed">Choose from 22 professional designs for your invoices and quotes.</Text>
                    </Stack>
                    <Button 
                      variant="light" 
                      size="xs" 
                      rightSection={<ChevronRight size={14} />}
                      onClick={() => onNavigate?.('templates')}
                    >
                       Browse Gallery
                    </Button>
                 </Group>
              </Stack>
            </Stack>
          </ScrollArea>
          
          {/* Action Footer */}
          <Box p="md" bg="white" style={{ borderTop: '1px solid #e2e8f0' }}>
             <Group gap="sm">
                <Button color="blue" onClick={handleSave} loading={loading} px="xl">Save</Button>
                <Button variant="outline" color="gray" onClick={onBack} px="xl">Cancel</Button>
             </Group>
          </Box>
        </Box>
      </Group>
    </Box>
  );
}

function SidebarItem({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <Box 
      p={8} 
      bg={active ? 'blue.0' : 'transparent'} 
      style={{ borderRadius: '4px', cursor: 'pointer' }}
      onClick={onClick}
    >
       <Text size="sm" fw={active ? 600 : 400} c={active ? 'blue' : 'gray.7'}>{label}</Text>
    </Box>
  );
}

import { Package } from 'lucide-react';
