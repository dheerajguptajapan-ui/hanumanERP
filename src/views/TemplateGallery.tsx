import React from 'react';
import { 
  Box, 
  Stack, 
  Group, 
  Title, 
  Text, 
  Button, 
  Paper, 
  SimpleGrid,
  ActionIcon,
  ScrollArea,
  TextInput,
  Anchor,
  Image,
  Badge
} from '@mantine/core';
import { 
  Search, 
  ChevronLeft,
  Settings as SettingsIcon,
  X,
  Eye,
  Check
} from 'lucide-react';
import { db } from '../db';

interface TemplateGalleryProps {
  onBack: () => void;
}

const TEMPLATE_CATEGORIES = [
  {
    name: 'STANDARD',
    templates: [
      { id: 'standard', name: 'Standard' },
      { id: 'standard-japanese', name: 'Standard - Japanese Style' },
      { id: 'standard-japanese-no-seal', name: 'Standard - Japanese Style (Without Seal Boxes)' },
      { id: 'standard-european', name: 'Standard - European Style' },
    ]
  },
  {
    name: 'SPREADSHEET',
    templates: [
      { id: 'spreadsheet', name: 'Spreadsheet' },
      { id: 'spreadsheet-plus', name: 'Spreadsheet - Plus' },
      { id: 'spreadsheet-lite', name: 'Spreadsheet - Lite' },
      { id: 'spreadsheet-compact', name: 'Spreadsheet - Compact' },
    ]
  },
  {
    name: 'PROFESSIONAL',
    templates: [
      { id: 'professional', name: 'Professional' },
      { id: 'formal', name: 'Formal' },
      { id: 'executive', name: 'Executive' },
      { id: 'corporate', name: 'Corporate' },
    ]
  },
  {
    name: 'MODERN',
    templates: [
      { id: 'modern', name: 'Modern' },
      { id: 'minimalist', name: 'Minimalist' },
      { id: 'grand', name: 'Grand' },
      { id: 'continental', name: 'Continental' },
    ]
  },
  {
    name: 'ELEGANT',
    templates: [
      { id: 'elegant', name: 'Elegant' },
      { id: 'classic', name: 'Classic' },
      { id: 'times', name: 'Times' },
      { id: 'royal', name: 'Royal' },
    ]
  },
  {
    name: 'SERVICE',
    templates: [
      { id: 'service', name: 'Service' },
      { id: 'simple', name: 'Simple' },
    ]
  }
];

export function TemplateGallery({ onBack }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('standard');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    db.settings.toCollection().first().then(settings => {
      if (settings?.pdfTemplate) {
        setSelectedTemplate(settings.pdfTemplate);
      }
    });
  }, []);

  const handleSelect = async (id: string) => {
    setSelectedTemplate(id);
    const existing = await db.settings.toCollection().first();
    if (existing) {
      await db.settings.update(existing.id!, { pdfTemplate: id });
    }
  };

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
               <Box p={6} bg="blue.0" style={{ borderRadius: '4px' }}>
                  <SettingsIcon size={20} color="#228be6" />
               </Box>
               <Stack gap={0}>
                  <Group gap={4}>
                     <ActionIcon variant="subtle" color="gray" size="sm" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                     <Text fw={700} size="sm">All Settings</Text>
                     <ChevronLeft size={12} style={{ transform: 'rotate(180deg)' }} />
                     <Text fw={700} size="sm">Templates</Text>
                     <ChevronLeft size={12} style={{ transform: 'rotate(180deg)' }} />
                     <Text fw={700} size="sm" c="blue">Template Gallery</Text>
                  </Group>
               </Stack>
            </Group>

            <Box style={{ flex: 1, maxWidth: 500 }} mx="xl">
               <TextInput 
                  placeholder="Search templates..." 
                  leftSection={<Search size={14} />} 
                  size="sm"
                  styles={{ input: { backgroundColor: '#f1f3f5', border: 'none' } }}
               />
            </Box>

            <Button 
               variant="subtle" 
               color="gray" 
               size="xs" 
               onClick={onBack}
            >
               Back
            </Button>
         </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }} p={40}>
        <Stack gap={60} maw={1200} mx="auto">
          {TEMPLATE_CATEGORIES.map(category => (
            <Stack key={category.name} gap="xl">
              <Title order={5} c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '1px' }}>
                {category.name}
              </Title>
              
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                {category.templates.map(template => (
                  <Stack key={template.id} gap="xs">
                    <Paper 
                      withBorder 
                      radius="md" 
                      style={{ 
                        aspectRatio: '1.4 / 1',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        border: selectedTemplate === template.id ? '2px solid #228be6' : '1px solid #e2e8f0',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.shadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => handleSelect(template.id)}
                    >
                      {/* Abstract Template Preview Illustration */}
                      <Box h="100%" w="100%" bg="#fcfcfc" p="md">
                        <Stack gap={8}>
                          <Group justify="space-between">
                            <Box w={20} h={20} bg={category.name === 'STANDARD' ? 'blue.1' : 'gray.1'} style={{ borderRadius: '50%' }} />
                            <Box w={40} h={8} bg="gray.1" radius="xs" />
                          </Group>
                          <Box h={2} bg="gray.1" />
                          <Stack gap={4}>
                            <Box h={6} w="100%" bg="gray.05" radius="xs" />
                            <Box h={6} w="80%" bg="gray.05" radius="xs" />
                          </Stack>
                          <Box flex={1} bg="white" style={{ border: '1px solid #f1f3f5', borderRadius: '4px' }} p={4}>
                             <Stack gap={4}>
                               <Box h={4} w="100%" bg="gray.05" />
                               <Box h={4} w="100%" bg="gray.05" />
                               <Box h={4} w="60%" bg="gray.05" />
                             </Stack>
                          </Box>
                        </Stack>
                      </Box>

                      {selectedTemplate === template.id && (
                        <Box style={{ position: 'absolute', top: 10, right: 10 }}>
                          <Box bg="blue" p={4} style={{ borderRadius: '50%', display: 'flex' }}>
                             <Check size={12} color="white" />
                          </Box>
                        </Box>
                      )}

                      <Box 
                        style={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0, 
                          background: 'rgba(255,255,255,0.9)',
                          padding: '8px',
                          display: 'flex',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                        className="template-overlay"
                      >
                         <Button variant="light" size="compact-xs" leftSection={<Eye size={12} />}>Preview</Button>
                      </Box>
                    </Paper>
                    <Text size="xs" fw={700}>{template.name}</Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>
      </ScrollArea>
    </Box>
  );
}
