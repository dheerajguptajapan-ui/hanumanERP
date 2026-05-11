import React from 'react';
import { 
  Box, 
  Stack, 
  Group, 
  Title, 
  Text, 
  TextInput, 
  Select, 
  Button, 
  Paper, 
  Divider, 
  FileInput,
  SimpleGrid,
  rem,
  Badge,
  ActionIcon,
  Switch,
  ScrollArea,
  Anchor
} from '@mantine/core';
import { 
  Upload, 
  Info, 
  Pencil, 
  Globe, 
  Lock,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { db } from '../db';

interface OrganizationProfileProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export function OrganizationProfile({ onBack, onNavigate }: OrganizationProfileProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    shopName: '',
    industry: 'Education',
    location: 'Japan',
    street1: '',
    street2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    fax: '',
    website: '',
    baseCurrency: 'JPY',
    fiscalYear: 'April - March',
    fiscalYearStart: '1',
    language: 'English',
    timeZone: '(GMT 9:00) Japan Standard Time (Asia/Tokyo)',
    dateFormat: 'yyyy/MM/dd',
    companyID: '',
    logo: null as string | null,
    seal: null as string | null,
    gstin: '',
    pan: ''
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  React.useEffect(() => {
    db.settings.toCollection().first().then(settings => {
      if (settings) {
        setFormData({
          shopName: settings.shopName || '',
          industry: settings.industry || 'Education',
          location: settings.location || 'Japan',
          street1: settings.shopAddress?.split('\n')[0] || '',
          street2: settings.shopAddress?.split('\n')[1] || '',
          city: settings.shopAddress?.split('\n')[2]?.split(',')[0]?.trim() || '',
          state: settings.shopState || '',
          pincode: settings.shopAddress?.split('\n')[2]?.split('-')[1]?.trim() || '',
          phone: settings.shopPhone || '',
          email: settings.shopEmail || '',
          fax: '',
          website: settings.website || '',
          baseCurrency: settings.currency || 'JPY',
          fiscalYear: settings.fiscalYear || 'April - March',
          fiscalYearStart: settings.fiscalYearStart || '1',
          language: settings.language || 'English',
          timeZone: settings.timeZone || '(GMT 9:00) Japan Standard Time (Asia/Tokyo)',
          dateFormat: settings.dateFormat || 'yyyy/MM/dd',
          companyID: settings.companyID || '',
          logo: settings.pdfLogoBase64 || null,
          seal: settings.companySealBase64 || null,
          gstin: settings.shopGSTIN || '',
          pan: settings.shopPAN || ''
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const existingSettings = await db.settings.toCollection().first();
      const address = `${formData.street1}\n${formData.street2}\n${formData.city}, ${formData.state} - ${formData.pincode}`;
      
      const updatedData = {
        id: existingSettings?.id || 1,
        shopName: formData.shopName,
        shopAddress: address,
        shopPhone: formData.phone,
        shopEmail: formData.email,
        shopState: formData.state,
        currency: formData.baseCurrency,
        industry: formData.industry,
        location: formData.location,
        website: formData.website,
        fiscalYear: formData.fiscalYear,
        fiscalYearStart: formData.fiscalYearStart,
        language: formData.language,
        timeZone: formData.timeZone,
        dateFormat: formData.dateFormat,
        companyID: formData.companyID,
        pdfLogoBase64: formData.logo,
        companySealBase64: formData.seal,
        // Preserve other settings fields
        pdfTemplate: existingSettings?.pdfTemplate || 'standard',
        pdfColor: existingSettings?.pdfColor || '#3b82f6',
        showBranding: existingSettings?.showBranding !== undefined ? existingSettings.showBranding : true,
        appearance: existingSettings?.appearance || 'dark',
        accentColor: existingSettings?.accentColor || '#3b82f6',
        taxRate: existingSettings?.taxRate || 0,
        shopGSTIN: formData.gstin,
        shopPAN: formData.pan
      };

      await db.settings.put(updatedData as any);
      onBack();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box h="100%" bg="white" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Layout */}
      <Group align="flex-start" gap={0} h="100%" wrap="nowrap">
        {/* Settings Sidebar */}
        <Box w={280} h="100%" bg="#f8f9fa" style={{ borderRight: '1px solid #e2e8f0' }} p="md">
          <Stack gap="xs">
            <Text size="xs" fw={700} c="dimmed" mb="sm">ORGANIZATION SETTINGS</Text>
            
            <Box>
               <Group justify="space-between" mb={5} style={{ cursor: 'pointer' }}>
                  <Text size="sm" fw={600}>Organization</Text>
                  <ChevronRight size={14} />
               </Group>
               <Stack gap={2} pl="md">
                  <Box p={8} bg="blue.0" style={{ borderRadius: '4px', cursor: 'pointer' }}>
                     <Text size="sm" fw={600} c="blue">Profile</Text>
                  </Box>
                  <Text size="sm" p={8} c="gray.7" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('branding')}>Branding</Text>
                  <Text size="sm" p={8} c="gray.7" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('generic')}>Locations</Text>
                  <Text size="sm" p={8} c="gray.7" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('generic')}>AI Preferences</Text>
                  <Text size="sm" p={8} c="gray.7" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('generic')}>Manage Subscription</Text>
               </Stack>
            </Box>

            <Group justify="space-between" mt="md" c="gray.7" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('users')}>
               <Text size="sm" fw={600}>Users & Roles</Text>
               <ChevronRight size={14} />
            </Group>
            
            <Group justify="space-between" c="gray.7" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('taxes')}>
               <Text size="sm" fw={600}>Taxes & Compliance</Text>
               <ChevronRight size={14} />
            </Group>

            <Group justify="space-between" c="gray.7" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('general-settings')}>
               <Text size="sm" fw={600}>Setup & Configurations</Text>
               <ChevronRight size={14} />
            </Group>
          </Stack>
        </Box>

        {/* Main Content Area */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }} h="100%">
          <ScrollArea style={{ flex: 1 }} p="xl">
            <Stack gap={30} maw={800}>
              <Group justify="space-between">
                <Group gap="sm">
                   <Title order={3} fw={500}>Organization Profile</Title>
                   <Badge color="gray.2" c="gray.7" variant="filled">ID: 90002919413</Badge>
                </Group>
              </Group>

              {/* Logo Section */}
              <Stack gap="md">
                 <Text fw={600} size="sm">Organization Logo</Text>
                 <Group align="flex-start" gap="xl">
                    <Box w={200}>
                       <Paper withBorder p={0} h={100} style={{ borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                          {formData.logo ? (
                             <img src={formData.logo} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                             <Stack gap={5} align="center">
                                <Upload size={20} color="gray" />
                                <Text size="xs" c="dimmed">Upload Logo</Text>
                             </Stack>
                          )}
                          <FileInput 
                             accept="image/*"
                             onChange={async (file) => {
                                if (file) {
                                   const base64 = await fileToBase64(file);
                                   setFormData({...formData, logo: base64});
                                }
                             }}
                             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          />
                       </Paper>
                       {formData.logo && (
                          <Button variant="subtle" size="xs" color="red" fullWidth mt={4} onClick={() => setFormData({...formData, logo: null})}>Remove</Button>
                       )}
                    </Box>
                    <Stack gap={4} style={{ flex: 1 }}>
                       <Text size="xs" c="gray.7">This logo will be displayed in transaction PDFs and email notifications.</Text>
                       <Text size="xs" c="dimmed">Preferred Image Dimensions: 240 x 240 pixels @ 72 DPI</Text>
                       <Text size="xs" c="dimmed">Supported Files: jpg, jpeg, png, gif, bmp</Text>
                       <Text size="xs" c="dimmed">Maximum File Size: 1MB</Text>
                    </Stack>
                 </Group>
              </Stack>

              {/* Seal Section */}
              <Stack gap="md">
                 <Text fw={600} size="sm">Company Seal</Text>
                 <Group align="flex-start" gap="xl">
                    <Box w={200}>
                       <Paper withBorder p={0} h={100} style={{ borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                          {formData.seal ? (
                             <img src={formData.seal} alt="Seal Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                             <Stack gap={5} align="center">
                                <Upload size={20} color="gray" />
                                <Text size="xs" c="dimmed">Upload Seal</Text>
                             </Stack>
                          )}
                          <FileInput 
                             accept="image/*"
                             onChange={async (file) => {
                                if (file) {
                                   const base64 = await fileToBase64(file);
                                   setFormData({...formData, seal: base64});
                                }
                             }}
                             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          />
                       </Paper>
                       {formData.seal && (
                          <Button variant="subtle" size="xs" color="red" fullWidth mt={4} onClick={() => setFormData({...formData, seal: null})}>Remove</Button>
                       )}
                    </Box>
                    <Stack gap={4} style={{ flex: 1 }}>
                       <Text size="xs" c="gray.7">Your company seal will be displayed on your transaction PDFs and emails.</Text>
                       <Text size="xs" c="dimmed">Preferred Image Dimensions: 240 x 240 pixels @ 72 DPI</Text>
                       <Text size="xs" c="dimmed">Supported Files: jpg, jpeg, png, gif, bmp</Text>
                       <Text size="xs" c="dimmed">Maximum File Size: 1MB</Text>
                    </Stack>
                 </Group>
              </Stack>

              <Divider />

              {/* Basic Info */}
              <Stack gap="lg">
                 <Group grow align="flex-start">
                    <TextInput 
                      label="Organization Name" 
                      required 
                      value={formData.shopName}
                      onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                    />
                    <Select 
                      label="Industry" 
                      data={['Education', 'Retail', 'Hardware', 'Services']}
                      value={formData.industry}
                      onChange={(val) => setFormData({...formData, industry: val || ''})}
                      rightSection={<Info size={14} color="gray" />}
                    />
                 </Group>

                 <Select 
                    label="Organization Location" 
                    required
                    data={['Japan', 'India', 'USA', 'UK']}
                    value={formData.location}
                    onChange={(val) => setFormData({...formData, location: val || ''})}
                 />

                 <Stack gap="xs">
                    <Group justify="space-between">
                       <Text size="sm" fw={500}>Organization Address <Info size={12} /></Text>
                       <ActionIcon variant="subtle" size="sm"><Pencil size={14} /></ActionIcon>
                    </Group>
                    <TextInput placeholder="Street 1" value={formData.street1} onChange={(e) => setFormData({...formData, street1: e.target.value})} />
                    <TextInput placeholder="Street 2" value={formData.street2} onChange={(e) => setFormData({...formData, street2: e.target.value})} />
                    <Group grow>
                       <TextInput placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                       <TextInput placeholder="ZIP/Postal Code" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                    </Group>
                    <Group grow>
                       <TextInput 
                         placeholder="State/Province" 
                         value={formData.state} 
                         onChange={(e) => setFormData({...formData, state: e.target.value})} 
                       />
                       <TextInput placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </Group>
                    <TextInput placeholder="Fax Number" value={formData.fax} onChange={(e) => setFormData({...formData, fax: e.target.value})} />
                    <Anchor size="xs" fw={500}>Organization Address Format &gt;</Anchor>
                 </Stack>

                 <TextInput 
                    label="Organization Email" 
                    placeholder="Organization Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                 />

                 <Group grow>
                    <TextInput 
                      label="GSTIN" 
                      placeholder="e.g. 27AAPFU0939F1ZV"
                      value={formData.gstin}
                      onChange={(e) => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                    />
                    <TextInput 
                      label="PAN" 
                      placeholder="e.g. ABCDE1234F"
                      value={formData.pan}
                      onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})}
                    />
                 </Group>

                 <TextInput 
                    label="Website URL" 
                    placeholder="Website URL"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                 />

                 <Paper withBorder p="md" bg="gray.0" radius="md">
                    <Group justify="space-between">
                       <Text size="sm">Would you like to add a different address for payment stubs?</Text>
                       <Group gap="xs">
                          <Text size="sm">No</Text>
                          <Switch size="xs" />
                       </Group>
                    </Group>
                 </Paper>
              </Stack>


              {/* Regional Settings */}
              <Stack gap="lg">
                 <Select 
                    label="Base Currency" 
                    required 
                    data={['JPY', 'INR', 'USD', 'EUR']}
                    value={formData.baseCurrency}
                    onChange={(val) => setFormData({...formData, baseCurrency: val || ''})}
                    rightSection={<Info size={14} color="gray" />}
                    description="You can't change the base currency as there are transactions recorded in your organization."
                 />

                 <Group grow>
                    <Select label="Fiscal Year" data={['April - March', 'January - December']} value={formData.fiscalYear} onChange={(val) => setFormData({...formData, fiscalYear: val || ''})} />
                    <Select label="Start Date" data={['1', '2', '3']} value={formData.fiscalYearStart} onChange={(val) => setFormData({...formData, fiscalYearStart: val || ''})} />
                 </Group>

                 <Select label="Organization Language" data={['English', 'Japanese']} value={formData.language} onChange={(val) => setFormData({...formData, language: val || ''})} />
                 
                 <Select label="Time Zone" data={['(GMT 9:00) Japan Standard Time (Asia/Tokyo)']} value={formData.timeZone} onChange={(val) => setFormData({...formData, timeZone: val || ''})} />

                 <Group grow>
                    <Select label="Date Format" data={['yyyy/MM/dd', 'dd/MM/yyyy']} value={formData.dateFormat} onChange={(val) => setFormData({...formData, dateFormat: val || ''})} />
                    <Select label="Separator" data={['/', '-', '.']} />
                 </Group>

                 <Group align="flex-end">
                    <Select label="Company ID" data={['Company ID :']} style={{ flex: 1 }} />
                    <TextInput placeholder="Company ID" style={{ flex: 2 }} value={formData.companyID} onChange={(e) => setFormData({...formData, companyID: e.target.value})} />
                 </Group>
              </Stack>

              <Divider />

              {/* Additional Fields */}
              <Stack gap="md">
                 <Title order={5} fw={600}>Additional Fields</Title>
                 <Paper withBorder>
                    <Group p="xs" bg="gray.0" grow>
                       <Text size="xs" fw={700}>LABEL NAME</Text>
                       <Text size="xs" fw={700}>VALUE</Text>
                    </Group>
                    <Group p="sm" grow>
                       <Text size="sm" c="dimmed">Label</Text>
                       <Text size="sm" c="dimmed">Value</Text>
                    </Group>
                 </Paper>
                 <Button variant="subtle" size="xs" leftSection={<Box size={14} />} p={0}>+ New Field</Button>
              </Stack>
            </Stack>
          </ScrollArea>

          {/* Footer Actions */}
          <Box p="md" bg="white" style={{ borderTop: '1px solid #e2e8f0' }}>
            <Group gap="sm">
              <Button color="blue" onClick={handleSave} loading={loading}>Save</Button>
              <Button variant="outline" color="gray" onClick={onBack}>Cancel</Button>
            </Group>
          </Box>
        </Box>
      </Group>
    </Box>
  );
}
