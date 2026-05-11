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
  Alert,
  List,
  ThemeIcon,
  rem,
  FileButton,
  Badge,
  SimpleGrid,
  Modal
} from '@mantine/core';
import { 
  Database, 
  Download, 
  Upload, 
  Cloud, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  History
} from 'lucide-react';
import { backupService } from '../utils/backupService';

interface DataManagementProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export function DataManagement({ onBack, onNavigate }: DataManagementProps) {
  const [lastBackup, setLastBackup] = React.useState<string | null>(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    const backup = localStorage.getItem('erp_auto_backup');
    if (backup) {
      const { timestamp } = JSON.parse(backup);
      setLastBackup(new Date(timestamp).toLocaleString());
    }
  }, []);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const handleConfirmedImport = async () => {
    setConfirmOpen(false);
    if (!pendingFile) return;
    // Pass a pre-resolved confirm (user already confirmed via modal)
    await backupService.importDatabase(pendingFile);
    setPendingFile(null);
  };

  return (
    <Box h="100%" bg="white" p="xl">
      <Stack gap={30} maw={800}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size="xl" radius="md" color="blue" variant="light">
              <Database size={24} />
            </ThemeIcon>
            <Box>
              <Title order={3} fw={500}>Data Management & Sync</Title>
              <Text size="sm" c="dimmed">Protect your business data with backups and cloud synchronization.</Text>
            </Box>
          </Group>
          <Button variant="outline" color="gray" onClick={onBack}>Back</Button>
        </Group>

        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Box>
                <Text fw={600}>Automatic Local Backup</Text>
                <Text size="xs" c="dimmed">Your data is automatically saved to your browser every 10 minutes.</Text>
              </Box>
              <Badge color="green" variant="light">ENABLED</Badge>
            </Group>
            
            {lastBackup && (
              <Group gap="xs">
                <Clock size={14} color="gray" />
                <Text size="xs" c="dimmed">Last auto-backup: {lastBackup}</Text>
              </Group>
            )}

            <Alert icon={<AlertCircle size={16} />} title="Important Note" color="orange" variant="light">
              Local backups are stored in your browser cache. If you clear your browser history or "Reset Browser", this data will be removed. Please perform manual exports regularly.
            </Alert>
          </Stack>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Paper withBorder p="xl" radius="md">
            <Stack gap="md" align="center">
              <Download size={32} color="#228be6" />
              <Box style={{ textAlign: 'center' }}>
                <Text fw={600}>Manual Export</Text>
                <Text size="xs" c="dimmed">Download your entire database as a JSON file for safe keeping.</Text>
              </Box>
              <Button fullWidth variant="light" onClick={() => backupService.exportDatabase()}>
                Export Data (.json)
              </Button>
            </Stack>
          </Paper>

          <Paper withBorder p="xl" radius="md">
            <Stack gap="md" align="center">
              <Upload size={32} color="#40c057" />
              <Box style={{ textAlign: 'center' }}>
                <Text fw={600}>Import / Restore</Text>
                <Text size="xs" c="dimmed">Restore your database from a previously saved backup file.</Text>
              </Box>
              <FileButton onChange={handleFileSelect} accept="application/json">
                {(props) => <Button {...props} fullWidth color="green" variant="light">Upload Backup</Button>}
              </FileButton>
            </Stack>
          </Paper>
        </SimpleGrid>

        {/* Confirmation Modal */}
        <Modal
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="⚠️ Confirm Data Restore"
          centered
          size="md"
        >
          <Stack gap="md">
            <Alert icon={<AlertCircle size={16} />} color="red" title="This will replace ALL your current data">
              Restoring from a backup will permanently erase all current records including invoices, products, customers, and settings. A safety backup will be attempted first, but this action cannot be undone.
            </Alert>
            <Text size="sm">File: <strong>{pendingFile?.name}</strong></Text>
            <Group justify="flex-end">
              <Button variant="outline" color="gray" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button color="red" onClick={handleConfirmedImport}>Yes, Restore My Data</Button>
            </Group>
          </Stack>
        </Modal>

        <Divider label="Cloud Synchronization" labelPosition="center" />

        <Paper withBorder p="xl" radius="md" bg="gray.0" style={{ borderStyle: 'dashed' }}>
          <Stack align="center" gap="sm">
            <Cloud size={40} color="gray" />
            <Title order={4} c="gray.7">Connect Google Drive</Title>
            <Text size="sm" c="dimmed" style={{ textAlign: 'center' }} maw={500}>
              Synchronize your business data automatically to your Google Drive. 
              This ensures your data is accessible across multiple devices and is 100% safe in the cloud.
            </Text>
            <Button variant="filled" color="blue" leftSection={<Cloud size={16} />} disabled>
              Coming Soon (API Integration)
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
