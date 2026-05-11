import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Group, 
  Text, 
  Stack, 
  TextInput, 
  Select, 
  Textarea, 
  Box, 
  Checkbox,
  Title,
  Anchor,
  Divider,
  ActionIcon
} from '@mantine/core';
import { ChevronDown, X, Settings } from 'lucide-react';

interface NewShipmentProps {
  opened: boolean;
  onClose: () => void;
}

export function NewShipment({ opened, onClose }: NewShipmentProps) {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      size="100%" 
      fullScreen
      transitionProps={{ transition: 'slide-up' }}
      title={<Title order={4} fw={400} c="gray.7">New Shipment</Title>}
      padding={0}
      styles={{
        header: { borderBottom: '1px solid #e2e8f0', padding: '15px 20px' },
        body: { height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box style={{ flex: 1, overflowY: 'auto', backgroundColor: 'white' }} p="xl">
        <Box maw={1200} mx="auto">
           <Group justify="flex-end" mb="xl">
              <Anchor size="sm" c="blue">Switch to carrier shipment</Anchor>
           </Group>

           <Stack gap="lg">
              <Group align="center">
                 <Text size="sm" w={200}>Customer Name</Text>
                 <Select 
                    data={['gupta industeria', 'Atul Hardware', 'Global Solutions']} 
                    defaultValue="gupta industeria"
                    style={{ flex: 1, maxWidth: 500 }} 
                    rightSection={<ChevronDown size={14} />}
                    styles={{ input: { borderColor: '#e2e8f0' } }}
                 />
              </Group>

              <Group align="center">
                 <Text size="sm" w={200} c="red">Sales Order#*</Text>
                 <Select 
                    placeholder="Select Sales Order"
                    data={['SO-001', 'SO-002']} 
                    style={{ flex: 1, maxWidth: 500 }} 
                    rightSection={<ChevronDown size={14} />}
                    styles={{ input: { borderColor: '#e2e8f0' } }}
                 />
              </Group>

              <Divider my="sm" variant="dotted" />

              <Group align="center">
                 <Text size="sm" w={200} c="gray.4">Package#*</Text>
                 <Select 
                    disabled
                    placeholder=""
                    data={[]} 
                    style={{ flex: 1, maxWidth: 300 }} 
                    rightSection={<ChevronDown size={14} />}
                 />
              </Group>

              <Group align="center">
                 <Text size="sm" w={200} c="gray.4">Shipment Order#*</Text>
                 <TextInput 
                    disabled
                    style={{ flex: 1, maxWidth: 300 }} 
                    rightSection={<Settings size={14} color="#e2e8f0" />}
                 />
              </Group>

              <Group align="center">
                 <Text size="sm" w={200} c="gray.4">Ship Date*</Text>
                 <TextInput 
                    disabled
                    placeholder="yyyy/MM/dd"
                    style={{ flex: 1, maxWidth: 300 }} 
                 />
              </Group>

              <Group align="center">
                 <Text size="sm" w={200} c="gray.4">Carrier*</Text>
                 <Select 
                    disabled
                    placeholder="Select or type to add"
                    data={[]} 
                    style={{ flex: 1, maxWidth: 300 }} 
                    rightSection={<ChevronDown size={14} />}
                 />
                 <Text size="sm" w={100} c="gray.4" ml="xl">Tracking#</Text>
                 <TextInput 
                    disabled
                    style={{ flex: 1, maxWidth: 300 }} 
                 />
              </Group>

              <Group align="center">
                 <Text size="sm" w={200} c="gray.4">Tracking URL</Text>
                 <TextInput 
                    disabled
                    style={{ flex: 1, maxWidth: 500 }} 
                 />
              </Group>

              <Group align="center">
                 <Text size="sm" w={200} c="gray.4">Shipping Charges (if any)</Text>
                 <TextInput 
                    disabled
                    style={{ flex: 1, maxWidth: 300 }} 
                 />
              </Group>

              <Group align="flex-start">
                 <Text size="sm" w={200} c="gray.4">Notes</Text>
                 <Textarea 
                    disabled
                    style={{ flex: 1, maxWidth: 800 }} 
                    minRows={4}
                 />
              </Group>

              <Stack gap="xs" mt="md" ml={200}>
                 <Checkbox label="Shipment already delivered" color="blue" size="xs" disabled />
                 <Checkbox label="Send Status Notification" color="blue" size="xs" disabled />
              </Stack>
           </Stack>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box p="md" bg="white" style={{ borderTop: '1px solid #e2e8f0' }}>
        <Group justify="flex-start" gap="sm">
          <Button color="blue" radius="xs" size="sm" px={30} onClick={onClose}>Save</Button>
          <Button variant="default" color="gray" radius="xs" size="sm" px={30} onClick={onClose}>Cancel</Button>
        </Group>
      </Box>
    </Modal>
  );
}
