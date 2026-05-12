import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stepper,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Title,
  Text,
  Box,
  Divider,
  ThemeIcon,
  Paper,
  SimpleGrid,
  Badge,
  rem,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  Building2,
  MapPin,
  User,
  CheckCircle2,
  Package,
  ChevronRight,
} from 'lucide-react';
import { db } from '../db';
import { persistStorage } from '../utils/backup';
import { seedNumberSeries } from '../utils/numberSeries';

interface SetupWizardProps {
  opened: boolean;
  onComplete: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const INDUSTRIES = [
  'Hardware & Building Materials',
  'Electronics & Appliances',
  'Grocery & FMCG',
  'Pharmaceuticals',
  'Clothing & Textiles',
  'Furniture & Home Decor',
  'Automotive Parts',
  'Stationery & Office Supplies',
  'Food & Beverages',
  'Other Retail',
  'Manufacturing',
  'Services',
  'Other',
];

export function SetupWizard({ opened, onComplete }: SetupWizardProps) {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      shopName: '',
      industry: '',
      shopAddress: '',
      shopCity: '',
      shopState: '',
      shopPincode: '',
      shopPhone: '',
      shopEmail: '',
      shopGSTIN: '',
      shopPAN: '',
      bankName: '',
      bankAccount: '',
      bankIFSC: '',
      adminName: '',
      adminEmail: '',
    },
    validate: {
      shopName: (v) => (!v.trim() ? 'Business name is required' : null),
      shopPhone: (v) => (!v.trim() ? 'Phone is required' : null),
      shopState: (v) => (!v ? 'State is required' : null),
      adminName: (v) => (!v.trim() ? 'Your name is required' : null),
      adminEmail: (v) => (!v.trim() ? 'Email is required' : !/\S+@\S+\.\S+/.test(v) ? 'Invalid email' : null),
    },
  });

  const steps = [
    { label: 'Business Info', description: 'Company details', icon: <Building2 size={18} /> },
    { label: 'Location', description: 'Address & tax', icon: <MapPin size={18} /> },
    { label: 'Bank & Admin', description: 'Payments & user', icon: <User size={18} /> },
    { label: 'All Done!', description: 'Ready to go', icon: <CheckCircle2 size={18} /> },
  ];

  const nextStep = () => {
    if (active === 0) {
      const errs = form.validateField('shopName');
      if (errs.hasError) return;
    }
    if (active === 1) {
      const errs = form.validateField('shopState');
      if (errs.hasError) return;
    }
    if (active === 2) {
      const nameErr = form.validateField('adminName');
      const emailErr = form.validateField('adminEmail');
      if (nameErr.hasError || emailErr.hasError) return;
    }
    setActive((c) => Math.min(c + 1, steps.length - 1));
  };

  const prevStep = () => setActive((c) => Math.max(c - 1, 0));

  const handleFinish = async () => {
    const v = form.values;
    setLoading(true);
    try {
      // Save settings
      await db.settings.add({
        shopName: v.shopName,
        shopAddress: `${v.shopAddress}${v.shopCity ? ', ' + v.shopCity : ''}`,
        shopPhone: v.shopPhone,
        shopEmail: v.shopEmail,
        shopGSTIN: v.shopGSTIN,
        shopPAN: v.shopPAN,
        shopState: v.shopState,
        taxRate: 18,
        currency: 'INR',
        pdfTemplate: 'classic',
        pdfColor: '#1971C2',
        industry: v.industry,
        bankName: v.bankName,
        bankAccount: v.bankAccount,
        bankIFSC: v.bankIFSC,
        appearance: 'light',
        showHSN: true,
        showUnit: true,
        discountType: 'line-item',
        taxInclusive: 'exclusive',
        stockTrackingMode: 'physical',
        fiscalYear: 'April-March',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
      });

      // Save admin role + user
      const adminRoleId = await db.roles.add({
        name: 'Admin',
        description: 'Unrestricted access to all modules.',
        permissions: {},
      });

      await db.users.add({
        name: v.adminName,
        email: v.adminEmail,
        roleId: adminRoleId as number,
        status: 'active',
      });

      // Seed number series
      await seedNumberSeries();

      // Persist storage
      await persistStorage();

      onComplete();
    } catch (err) {
      console.error('Setup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      size="xl"
      radius="lg"
      padding={0}
      overlayProps={{ blur: 6, backgroundOpacity: 0.7 }}
      centered
    >
      {/* Header */}
      <Box
        p="xl"
        style={{
          background: 'linear-gradient(135deg, #1971C2 0%, #3b82f6 100%)',
          borderRadius: 'var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0',
        }}
      >
        <Group gap="md">
          <ThemeIcon size={48} radius="md" color="white" variant="white" style={{ color: '#1971C2' }}>
            <Package size={28} />
          </ThemeIcon>
          <Box>
            <Title order={3} c="white">Welcome! Let's set up your business</Title>
            <Text size="sm" c="rgba(255,255,255,0.8)">
              Takes less than 2 minutes — you can change everything later in Settings.
            </Text>
          </Box>
        </Group>
      </Box>

      <Box p="xl">
        {/* Stepper */}
        <Stepper
          active={active}
          size="sm"
          mb="xl"
          styles={{
            step: { flex: 1 },
            stepLabel: { fontSize: rem(12) },
            stepDescription: { fontSize: rem(10) },
          }}
        >
          {steps.map((s, i) => (
            <Stepper.Step key={i} label={s.label} description={s.description} icon={s.icon} />
          ))}
        </Stepper>

        {/* Step 0 — Business Info */}
        {active === 0 && (
          <Stack gap="md">
            <TextInput
              label="Business / Shop Name"
              placeholder="e.g. Sharma Hardware Store"
              required
              size="md"
              {...form.getInputProps('shopName')}
            />
            <SimpleGrid cols={2}>
              <TextInput
                label="Phone Number"
                placeholder="9876543210"
                required
                {...form.getInputProps('shopPhone')}
              />
              <TextInput
                label="Email Address"
                placeholder="shop@example.com"
                {...form.getInputProps('shopEmail')}
              />
            </SimpleGrid>
            <Select
              label="Industry / Business Type"
              placeholder="Select your industry"
              data={INDUSTRIES}
              searchable
              {...form.getInputProps('industry')}
            />
          </Stack>
        )}

        {/* Step 1 — Location & Tax */}
        {active === 1 && (
          <Stack gap="md">
            <Textarea
              label="Shop Address"
              placeholder="Street address, building number..."
              rows={2}
              {...form.getInputProps('shopAddress')}
            />
            <SimpleGrid cols={2}>
              <TextInput
                label="City"
                placeholder="New Delhi"
                {...form.getInputProps('shopCity')}
              />
              <Select
                label="State"
                placeholder="Select state"
                data={INDIAN_STATES}
                searchable
                required
                {...form.getInputProps('shopState')}
              />
            </SimpleGrid>
            <SimpleGrid cols={2}>
              <TextInput
                label="Pincode"
                placeholder="110001"
                {...form.getInputProps('shopPincode')}
              />
              <TextInput
                label="GSTIN"
                placeholder="22AAAAA0000A1Z5"
                {...form.getInputProps('shopGSTIN')}
              />
            </SimpleGrid>
            <TextInput
              label="PAN Number"
              placeholder="AAAAA0000A"
              {...form.getInputProps('shopPAN')}
            />
          </Stack>
        )}

        {/* Step 2 — Bank & Admin */}
        {active === 2 && (
          <Stack gap="md">
            <Text fw={600} size="sm" c="dimmed" tt="uppercase">Bank Details (optional)</Text>
            <SimpleGrid cols={3}>
              <TextInput
                label="Bank Name"
                placeholder="SBI"
                {...form.getInputProps('bankName')}
              />
              <TextInput
                label="Account Number"
                placeholder="0123456789"
                {...form.getInputProps('bankAccount')}
              />
              <TextInput
                label="IFSC Code"
                placeholder="SBIN0001234"
                {...form.getInputProps('bankIFSC')}
              />
            </SimpleGrid>

            <Divider label="Your Login Details" labelPosition="center" my="xs" />

            <SimpleGrid cols={2}>
              <TextInput
                label="Your Name"
                placeholder="Full name"
                required
                {...form.getInputProps('adminName')}
              />
              <TextInput
                label="Your Email"
                placeholder="admin@example.com"
                required
                {...form.getInputProps('adminEmail')}
              />
            </SimpleGrid>

            <Paper p="md" radius="md" bg="blue.0" withBorder>
              <Group gap="xs">
                <ThemeIcon size="sm" color="blue" variant="light" radius="xl">
                  <CheckCircle2 size={12} />
                </ThemeIcon>
                <Text size="xs" c="blue.7">
                  All data is stored locally on your device. Nothing is sent to any server.
                </Text>
              </Group>
            </Paper>
          </Stack>
        )}

        {/* Step 3 — Done */}
        {active === 3 && (
          <Stack align="center" gap="lg" py="md">
            <ThemeIcon size={80} radius="xl" color="green" variant="light">
              <CheckCircle2 size={48} />
            </ThemeIcon>
            <Stack align="center" gap={4}>
              <Title order={3}>You're all set!</Title>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                <strong>{form.values.shopName}</strong> is ready to go. You can update any of these settings anytime from the{' '}
                <strong>Settings → Organization Profile</strong> page.
              </Text>
            </Stack>
            <SimpleGrid cols={3} w="100%" maw={450}>
              {['Add Products', 'Add Customers', 'Create Invoice'].map((label, i) => (
                <Paper key={i} withBorder p="sm" radius="md" ta="center" style={{ cursor: 'default' }}>
                  <ChevronRight size={16} color="#228be6" style={{ margin: '0 auto 4px' }} />
                  <Text size="xs" fw={600}>{label}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Navigation */}
        <Group justify="space-between" mt="xl">
          {active > 0 && active < 3 ? (
            <Button variant="default" onClick={prevStep}>Back</Button>
          ) : (
            <div />
          )}

          {active < 2 && (
            <Button onClick={nextStep} rightSection={<ChevronRight size={16} />}>
              Continue
            </Button>
          )}

          {active === 2 && (
            <Button onClick={nextStep} rightSection={<ChevronRight size={16} />}>
              Review
            </Button>
          )}

          {active === 3 && (
            <Button
              color="green"
              size="md"
              loading={loading}
              leftSection={<CheckCircle2 size={18} />}
              onClick={handleFinish}
            >
              Launch My ERP
            </Button>
          )}
        </Group>
      </Box>
    </Modal>
  );
}
