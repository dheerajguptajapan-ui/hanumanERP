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
  Collapse,
  Modal,
  Center,
  Loader,
  Grid
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
  ChevronDown,
  Eye,
  Check,
  Percent,
  FileText,
  Bell,
  HardDrive,
  Briefcase,
  Terminal,
  Settings2,
  Lock,
  Layers,
  FileSearch,
  Key
} from 'lucide-react';
import { db } from '../db';
import { Branding } from './Branding';
import { Taxes } from './Taxes';
import { GeneralSettings } from './GeneralSettings';
import { UsersAndRoles } from './UsersAndRoles';
import { DataManagement } from './DataManagement';
import { TransactionSeries } from './TransactionSeries';
import { CurrencySettings } from './CurrencySettings';
import { PaymentTermsSettings } from './PaymentTermsSettings';
import { RemindersSettings } from './RemindersSettings';
import { PortalSettings } from './PortalSettings';
import { generateDocumentPDF } from '../utils/pdfGenerator';

export function Settings({ onBack }: { onBack: () => void }) {
  const [subView, setSubView] = React.useState('all');
  const [selectedTemplate, setSelectedTemplate] = React.useState('standard');
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewModalOpen, setPreviewModalOpen] = React.useState(false);

  React.useEffect(() => {
    db.settings.toCollection().first().then(s => {
      if (s) setSelectedTemplate(s.pdfTemplate || 'standard');
    });
  }, []);

  const handleTemplateSelect = async (id: string) => {
    setSelectedTemplate(id);
    const settings = await db.settings.toCollection().first();
    if (settings) {
      await db.settings.update(settings.id!, { pdfTemplate: id });
    }
  };

  const handlePreview = async (tplId: string) => {
    setPreviewLoading(true);
    setPreviewModalOpen(true);
    setPreviewUrl(null);
    try {
      const sampleData = {
        id: 'INV-2024-001',
        date: new Date().toISOString(),
        customerName: 'Sample Customer Ltd.',
        items: [
          { productName: 'High-Performance Server', hsnCode: '8471', quantity: 1, price: 125000, gstRate: 18, total: 147500 },
          { productName: 'Network Switch (24 Port)', hsnCode: '8517', quantity: 2, price: 12000, gstRate: 12, total: 26880 }
        ],
        subtotal: 149000,
        totalGst: 25380,
        total: 174380
      };

      // Ensure we pass the template ID to the generator if it supports it
      const url = await generateDocumentPDF('Invoice', { ...sampleData, pdfTemplate: tplId }, 'blob');
      if (url) {
        setPreviewUrl(url.toString());
      }
    } catch (e) {
      console.error('Preview Generation Failed:', e);
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderContent = () => {
    switch (subView) {
      case 'branding': return <Branding onBack={() => setSubView('all')} onNavigate={setSubView} />;
      case 'taxes': return <Taxes onBack={() => setSubView('all')} />;
      case 'users': return <UsersAndRoles onBack={() => setSubView('all')} onNavigate={setSubView} />;
      case 'general': return <GeneralSettings onBack={() => setSubView('all')} />;
      case 'templates': return <TemplateGalleryView />;
      case 'transaction-series': return <TransactionSeries onBack={() => setSubView('all')} onNavigate={setSubView} />;
      case 'currencies': return <CurrencySettings onBack={() => setSubView('all')} />;
      case 'payment-terms': return <PaymentTermsSettings onBack={() => setSubView('all')} />;
      case 'reminders': return <RemindersSettings onBack={() => setSubView('all')} />;
      case 'portals': return <PortalSettings onBack={() => setSubView('all')} />;
      case 'data': return <DataManagement onBack={() => setSubView('all')} />;
      default: return <AllSettingsDashboard setSubView={setSubView} />;
    }
  };

  const TemplateGalleryView = () => {
    const templateCategories = [
      { name: 'STANDARD', templates: [{ id: 'standard', name: 'Standard' }, { id: 'standard-japanese', name: 'Japanese Style' }, { id: 'standard-japanese-no-seal', name: 'Japanese (No Seal)' }, { id: 'standard-european', name: 'European' }] },
      { name: 'SPREADSHEET', templates: [{ id: 'spreadsheet', name: 'Spreadsheet' }, { id: 'spreadsheet-plus', name: 'Spreadsheet Plus' }, { id: 'spreadsheet-lite', name: 'Lite' }, { id: 'spreadsheet-compact', name: 'Compact' }] },
      { name: 'PROFESSIONAL', templates: [{ id: 'professional', name: 'Professional' }, { id: 'formal', name: 'Formal' }, { id: 'executive', name: 'Executive' }, { id: 'corporate', name: 'Corporate' }] },
      { name: 'MODERN', templates: [{ id: 'modern', name: 'Modern' }, { id: 'minimalist', name: 'Minimalist' }, { id: 'grand', name: 'Grand' }, { id: 'continental', name: 'Continental' }] },
      { name: 'ELEGANT', templates: [{ id: 'elegant', name: 'Elegant' }, { id: 'classic', name: 'Classic' }, { id: 'times', name: 'Times' }, { id: 'royal', name: 'Royal' }] },
      { name: 'SERVICE', templates: [{ id: 'service', name: 'Service' }, { id: 'simple', name: 'Simple' }] }
    ];

    return (
      <Box h="100%" bg="#f8f9fa" style={{ display: 'flex', flexDirection: 'column' }}>
        <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between">
            <Group gap="xs">
              <Anchor c="dimmed" size="sm" onClick={() => setSubView('all')}>All Settings</Anchor>
              <ChevronRight size={14} color="gray" />
              <Text fw={700} size="sm">Template Gallery</Text>
            </Group>
            <Button variant="subtle" color="gray" size="xs" onClick={() => setSubView('all')}>Back</Button>
          </Group>
        </Box>
        
        <Box style={{ flex: 1, overflowY: 'auto' }} p="xl">
          <Stack gap={50} maw={1200} mx="auto">
            <Stack gap={5}>
               <Title order={2}>Professional Invoice Templates</Title>
               <Text c="dimmed">Choose from 22 high-fidelity designs. Live previews are generated automatically below.</Text>
            </Stack>

            {templateCategories.map(cat => (
              <Stack key={cat.name} gap="xl">
                <Title order={5} c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '1px' }}>{cat.name}</Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                  {cat.templates.map(tpl => (
                    <LiveTemplateCard 
                      key={tpl.id} 
                      tpl={tpl} 
                      isActive={selectedTemplate === tpl.id} 
                      onSelect={() => handleTemplateSelect(tpl.id)}
                      onPreview={() => handlePreview(tpl.id)}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Modal 
          opened={previewModalOpen} 
          onClose={() => setPreviewModalOpen(false)} 
          title={<Text fw={700}>Document Preview</Text>}
          size="70%"
          radius="md"
        >
           <Stack h={700}>
              {previewLoading ? (
                 <Center h="100%"><Stack align="center"><Loader size="xl" /><Text>Generating High-Fidelity Preview...</Text></Stack></Center>
              ) : previewUrl ? (
                 <iframe src={previewUrl} title="PDF Preview" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }} />
              ) : (
                 <Center h="100%"><Text>Could not load preview. Please check your branding logo format.</Text></Center>
              )}
              
              <Group justify="flex-end" p="md" bg="gray.0" style={{ borderRadius: '8px' }}>
                 <Button variant="outline" color="gray" onClick={() => setPreviewModalOpen(false)}>Close</Button>
                 <Button color="blue" onClick={() => { setPreviewModalOpen(false); }}>Keep Selected</Button>
              </Group>
           </Stack>
        </Modal>
      </Box>
    );
  };

  return (
    <Box h="100vh" bg="#f8f9fa" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
       {/* Header */}
       <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Group justify="space-between" wrap="nowrap">
             <Group gap="xl">
                <Group gap="xs">
                   <Box p={6} bg="orange.0" style={{ borderRadius: '4px' }}>
                      <SettingsIcon size={20} color="#f76707" />
                   </Box>
                   <Stack gap={0}>
                      <Text fw={700} size="sm">All Settings</Text>
                      <Text size="xs" c="dimmed">jhakkasdheeraj</Text>
                   </Stack>
                </Group>
                
                <TextInput 
                   placeholder="Search settings ( / )" 
                   leftSection={<Search size={14} />} 
                   size="xs" 
                   w={300}
                   variant="filled"
                />
             </Group>
             <Button variant="subtle" color="red" size="xs" rightSection={<X size={14} />} onClick={onBack}>Close Settings</Button>
          </Group>
       </Box>

       {/* Content Area */}
       <Box style={{ flex: 1, overflow: 'hidden' }}>
          {renderContent()}
       </Box>
    </Box>
  );
}

function LiveTemplateCard({ tpl, isActive, onSelect, onPreview }: any) {
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const generateThumbnail = async () => {
      try {
        const sampleData = {
          id: 'INV-2024-001',
          date: new Date().toISOString(),
          customerName: 'Sample Org',
          items: [{ productName: 'Sample Item', quantity: 1, price: 1000, total: 1000 }],
          total: 1000,
          pdfTemplate: tpl.id
        };
        const url = await generateDocumentPDF('Invoice', sampleData, 'blob');
        if (active && url) {
           setThumbnailUrl(url.toString());
        }
      } catch (e) {
        console.error('Thumbnail failed:', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    generateThumbnail();
    return () => { active = false; };
  }, [tpl.id]);

  return (
    <Stack gap="xs">
      <Paper 
        withBorder 
        p={0} 
        radius="md" 
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ 
          cursor: 'pointer',
          overflow: 'hidden',
          border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0',
          transition: 'all 0.2s ease',
          position: 'relative',
          height: 220,
          backgroundColor: 'white'
        }}
        onClick={onSelect}
      >
        <Box h="100%" style={{ position: 'relative' }}>
           {loading ? (
              <Center h="100%"><Loader size="sm" /></Center>
           ) : thumbnailUrl ? (
              <Box style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                 <iframe 
                    src={thumbnailUrl} 
                    title={tpl.name}
                    style={{ 
                       width: '400%', 
                       height: '400%', 
                       border: 'none', 
                       transform: 'scale(0.25)', 
                       transformOrigin: '0 0',
                       pointerEvents: 'none'
                    }} 
                 />
              </Box>
           ) : (
              <Center h="100%"><Layout size={32} color="#dee2e6" /></Center>
           )}

           {isActive && (
              <Box style={{ position: 'absolute', top: 10, right: 10 }}>
                 <Badge size="xs" variant="filled">Active</Badge>
              </Box>
           )}

           {hovered && (
              <Box style={{ 
                 position: 'absolute', 
                 inset: 0, 
                 backgroundColor: 'rgba(255,255,255,0.8)', 
                 display: 'flex', 
                 flexDirection: 'column',
                 alignItems: 'center', 
                 justifyContent: 'center',
                 gap: '8px'
              }}>
                 <Button variant="filled" color="blue" size="xs" leftSection={<Eye size={14} />} onClick={(e) => { e.stopPropagation(); onPreview(); }}>Full Preview</Button>
                 <Button variant="outline" color="blue" size="xs" onClick={onSelect}>{isActive ? 'Selected' : 'Use This'}</Button>
              </Box>
           )}
        </Box>
      </Paper>
      <Text size="xs" fw={600} ta="center">{tpl.name}</Text>
    </Stack>
  );
}

function AllSettingsDashboard({ setSubView }: any) {
  return (
    <ScrollArea h="100%">
       <Stack p={40} gap={60} maw={1400} mx="auto">
          
          {/* Section 1: Organization Settings */}
          <Stack gap="xl">
             <Title order={5} fw={700} c="gray.6">Organization Settings</Title>
             <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing={0} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <DashboardColumn title="Organization" icon={<Building size={16} color="#10b981" />} items={[
                   { label: 'Profile', onClick: () => setSubView('branding') },
                   { label: 'Branding', onClick: () => setSubView('branding') }
                ]} />
                <DashboardColumn title="Users & Roles" icon={<Users size={16} color="#ef4444" />} items={[
                   { label: 'Users', onClick: () => setSubView('users') },
                   { label: 'Roles', onClick: () => setSubView('users') }
                ]} />
                <DashboardColumn title="Setup & Configurations" icon={<Settings2 size={16} color="#f59e0b" />} items={[
                   { label: 'General', onClick: () => setSubView('general') },
                   { label: 'Currencies', onClick: () => setSubView('currencies') },
                   { label: 'Payment Terms', onClick: () => setSubView('payment-terms') },
                   { label: 'Reminders', onClick: () => setSubView('reminders') },
                   { label: 'Customer Portal', onClick: () => setSubView('portals') },
                   { label: 'Vendor Portal', onClick: () => setSubView('portals') }
                ]} />
                <DashboardColumn title="Customization" icon={<Sparkles size={16} color="#3b82f6" />} items={[
                   { label: 'Transaction Number Series', onClick: () => setSubView('transaction-series') },
                   { label: 'PDF Templates', onClick: () => setSubView('templates') },
                   { label: 'Email Notifications' },
                   { label: 'Reporting Tags' },
                   { label: 'Web Tabs' }
                ]} />
                <DashboardColumn title="Automation" icon={<Zap size={16} color="#ef4444" />} items={[
                   { label: 'Workflow Rules' },
                   { label: 'Workflow Actions' },
                   { label: 'Workflow Logs' },
                   { label: 'Schedules' }
                ]} />
             </SimpleGrid>
          </Stack>

          {/* Section 2: Module Settings */}
          <Stack gap="xl">
             <Title order={5} fw={700} c="gray.6">Module Settings</Title>
             <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing={0} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <DashboardColumn title="General" icon={<Layers size={16} color="#10b981" />} items={[
                   { label: 'Customers and Vendors' },
                   { label: 'Items' }
                ]} />
                <DashboardColumn title="Inventory" icon={<HardDrive size={16} color="#ec4899" />} items={[
                   { label: 'Units of Measurement' },
                   { label: 'Inventory Adjustments' },
                   { label: 'Packages' },
                   { label: 'Shipments' }
                ]} />
                <DashboardColumn title="Sales" icon={<Target size={16} color="#3b82f6" />} items={[
                   { label: 'Retainer Invoices' },
                   { label: 'Sales Orders' },
                   { label: 'Invoices' },
                   { label: 'Sales Receipts' },
                   { label: 'Payments Received' },
                   { label: 'Sales Returns' },
                   { label: 'Credit Notes' }
                ]} />
                <DashboardColumn title="Purchases" icon={<Briefcase size={16} color="#10b981" />} items={[
                   { label: 'Expenses' },
                   { label: 'Purchase Orders' },
                   { label: 'Purchase Receives' },
                   { label: 'Bills' },
                   { label: 'Payments Made' },
                   { label: 'Vendor Credits' }
                ]} />
                <DashboardColumn title="Online Payments" icon={<CreditCard size={16} color="#f59e0b" />} items={[
                   { label: 'Payment Gateways' }
                ]} />
             </SimpleGrid>
          </Stack>

          {/* Section 3: Extension and Developer Data */}
          <Stack gap="xl">
             <Title order={5} fw={700} c="gray.6">Extension and Developer Data</Title>
             <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing={0} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <DashboardColumn title="Integrations & Marketplace" icon={<Globe size={16} color="#10b981" />} items={[
                   { label: 'ERP Apps' },
                   { label: 'WhatsApp' },
                   { label: 'SMS Integrations' },
                   { label: 'Shipping' },
                   { label: 'Shopping Cart' },
                   { label: 'eCommerce' }
                ]} />
                <DashboardColumn title="Developer Data" icon={<Terminal size={16} color="#3b82f6" />} items={[
                   { label: 'Incoming Webhooks' },
                   { label: 'Connections' },
                   { label: 'API Usage' },
                   { label: 'Signals' },
                   { label: 'Data Management', onClick: () => setSubView('data') },
                   { label: 'Web Forms' }
                ]} />
             </SimpleGrid>
          </Stack>

       </Stack>
    </ScrollArea>
  );
}

function DashboardColumn({ title, icon, items }: { title: string, icon: React.ReactNode, items: { label: string, onClick?: () => void, badge?: string }[] }) {
  return (
    <Box bg="white" p="xl" style={{ borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
       <Stack gap="lg">
          <Group gap="sm" wrap="nowrap">
             {icon}
             <Text size="sm" fw={700} c="gray.8" style={{ whiteSpace: 'nowrap' }}>{title}</Text>
          </Group>
          <Stack gap="xs">
             {items.map((item, idx) => (
                <Group key={idx} justify="space-between" wrap="nowrap" onClick={item.onClick} style={{ cursor: item.onClick ? 'pointer' : 'default' }}>
                   <Text 
                      size="sm" 
                      c={item.onClick ? 'blue.6' : 'gray.7'} 
                      style={{ 
                        '&:hover': { textDecoration: item.onClick ? 'underline' : 'none' } 
                      }}
                   >
                      {item.label}
                   </Text>
                   {item.badge && <Badge size="xs" color="red" variant="filled" radius="xs">{item.badge}</Badge>}
                </Group>
             ))}
          </Stack>
       </Stack>
    </Box>
  );
}
