import React, { useState } from 'react';
import { Modal, Button, Group, Text, Stack, Stepper, Box, Transition, Title } from '@mantine/core';
import { PlayCircle, CheckCircle, Package, ShoppingCart, BarChart3, Settings2, ArrowRight } from 'lucide-react';

interface ProductTourProps {
  opened: boolean;
  onClose: () => void;
}

export function ProductTour({ opened, onClose }: ProductTourProps) {
  const [active, setActive] = useState(0);

  const steps = [
    {
      title: 'Welcome to Hanuman ERP System',
      description: 'Let\'s take a quick look at how you can manage your inventory and sales efficiently.',
      icon: PlayCircle,
      color: 'indigo',
    },
    {
      title: 'Inventory Management',
      description: 'Track your products, stock levels, and adjustments in real-time. Set minimum stock alerts to never run out.',
      icon: Package,
      color: 'blue',
    },
    {
      title: 'Sales & Invoicing',
      description: 'Create professional GST-compliant invoices, sales orders, and quotations with a few clicks.',
      icon: ShoppingCart,
      color: 'green',
    },
    {
      title: 'Advanced Reporting',
      description: 'Get deep insights into your business performance with interactive charts and automated reports.',
      icon: BarChart3,
      color: 'orange',
    },
    {
      title: 'Configuration',
      description: 'Customize the app to your needs. Set up your organization profile, branding, and tax settings.',
      icon: Settings2,
      color: 'gray',
    }
  ];

  const nextStep = () => setActive((current) => (current < steps.length - 1 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const currentStep = steps[active];

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      size="lg" 
      padding="xl"
      radius="md"
      withCloseButton={false}
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="xl">
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} size="sm">
          {steps.map((_, index) => (
            <Stepper.Step key={index} />
          ))}
        </Stepper>

        <Transition
          mounted={true}
          transition="fade"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <div style={styles}>
              <Stack align="center" gap="md" py="xl">
                {active === 0 ? (
                  <Box w={110} h={110} bg="indigo.0" className="hanuman-logo-animated divine-glow" style={{ borderRadius: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/src/logo.png" style={{ width: '85%', height: '85%', objectFit: 'contain' }} alt="Hanuman Logo" />
                  </Box>
                ) : (
                  <Box 
                    p="xl" 
                    bg={`${currentStep.color}.0`} 
                    style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center' }}
                  >
                    <currentStep.icon size={64} color={`var(--mantine-color-${currentStep.color}-6)`} />
                  </Box>
                )}
                <Title order={2}>{currentStep.title}</Title>
                <Text ta="center" c="dimmed" maw={400}>
                  {currentStep.description}
                </Text>
              </Stack>
            </div>
          )}
        </Transition>

        <Group justify="space-between" mt="xl">
          <Button variant="subtle" color="gray" onClick={onClose}>Skip Tour</Button>
          <Group>
            {active > 0 && (
              <Button variant="outline" color="gray" onClick={prevStep}>Back</Button>
            )}
            {active < steps.length - 1 ? (
              <Button rightSection={<ArrowRight size={16} />} onClick={nextStep}>Next Step</Button>
            ) : (
              <Button color="green" leftSection={<CheckCircle size={16} />} onClick={onClose}>Get Started</Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
