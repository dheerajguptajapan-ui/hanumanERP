import React from 'react';
import {
  Box, Stack, Group, Title, Text, Button, Paper, Alert, ThemeIcon,
  FileButton, Badge, SimpleGrid, Modal, Tabs, Divider, ScrollArea,
  Table, ActionIcon, Tooltip, Progress,
} from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Database, Download, Upload, AlertCircle, CheckCircle2, Clock,
  FileText, FileSpreadsheet, Users, Store, Package, RotateCcw,
  HardDrive, ShoppingCart, Truck, CreditCard, Receipt, Warehouse,
  BookOpen, ArrowDownToLine, ArrowUpFromLine, FileDown, RefreshCw,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { backupService, ENTITY_CONFIGS, type EntityKey } from '../utils/backupService';
import { db } from '../db';

interface DataManagementProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

// ─── Icon map ──────────────────────────────────────────────────────────────
const ENTITY_ICONS: Record<string, React.ReactNode> = {
  products:       <Package size={18} />,
  customers:      <Users size={18} />,
  vendors:        <Store size={18} />,
  salesOrders:    <ShoppingCart size={18} />,
  purchaseOrders: <Truck size={18} />,
  invoices:       <FileText size={18} />,
  purchaseBills:  <Receipt size={18} />,
  salesReceipts:  <CreditCard size={18} />,
  expenses:       <CreditCard size={18} />,
  payments:       <CreditCard size={18} />,
  goodsReceipts:  <Warehouse size={18} />,
  adjustments:    <RotateCcw size={18} />,
  vendorCredits:  <BookOpen size={18} />,
  quotations:     <FileText size={18} />,
  deliveryNotes:  <Truck size={18} />,
  categories:     <Package size={18} />,
  brands:         <Package size={18} />,
  manufacturers:  <Package size={18} />,
  taxes:          <ArrowDownToLine size={18} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  master:    'blue',
  sales:     'green',
  purchase:  'orange',
  finance:   'violet',
  inventory: 'cyan',
};

const CATEGORY_LABELS: Record<string, string> = {
  master:    '📦 Master Data',
  sales:     '🛒 Sales',
  purchase:  '🚚 Purchases',
  finance:   '💳 Finance',
  inventory: '🏭 Inventory',
};

// ─── Table row count hook ──────────────────────────────────────────────────
function useTableCounts() {
  return useLiveQuery(async () => {
    const counts: Record<string, number> = {};
    try {
      counts.products       = await db.products.count();
      counts.customers      = await db.partners.where('type').equals('customer').count();
      counts.vendors        = await db.partners.where('type').equals('supplier').count();
      counts.salesOrders    = await db.salesOrders.count();
      counts.purchaseOrders = await db.purchaseOrders.count();
      counts.invoices       = await db.invoices.count();
      counts.purchaseBills  = await db.purchaseBills.count();
      counts.salesReceipts  = await db.salesReceipts.count();
      counts.expenses       = await db.expenses.count();
      counts.payments       = await db.payments.count();
      counts.goodsReceipts  = await db.goodsReceipts.count();
      counts.adjustments    = await db.adjustments.count();
      counts.vendorCredits  = await db.vendorCredits.count();
      counts.quotations     = await db.quotations.count();
      counts.deliveryNotes  = await db.deliveryNotes.count();
      counts.categories     = await db.categories.count();
      counts.brands         = await db.brands.count();
      counts.manufacturers  = await db.manufacturers.count();
      counts.taxes          = await db.taxes.count();
    } catch {}
    return counts;
  }, []);
}

// ─── Entity Row Component ──────────────────────────────────────────────────
function EntityRow({
  entityKey,
  label,
  color,
  count,
  hasItems,
  onExport,
  onImport,
  onTemplate,
  importLoading,
}: {
  entityKey: EntityKey;
  label: string;
  color: string;
  count?: number;
  hasItems: boolean;
  onExport: () => void;
  onImport: (file: File | null) => void;
  onTemplate: () => void;
  importLoading: string | null;
}) {
  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={32} radius="md" color={color} variant="light">
            {ENTITY_ICONS[entityKey] ?? <FileText size={16} />}
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={600}>{label}</Text>
            {hasItems && (
              <Text size="xs" c="dimmed">Contains line items (serialized as JSON)</Text>
            )}
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={count && count > 0 ? color : 'gray'} size="sm">
          {count ?? 0} records
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={`Download ${label} CSV template`}>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              leftSection={<FileDown size={12} />}
              onClick={onTemplate}
            >
              Template
            </Button>
          </Tooltip>
          <Tooltip label={`Export ${label} as CSV`}>
            <Button
              size="compact-xs"
              variant="light"
              color="blue"
              leftSection={<Download size={12} />}
              onClick={onExport}
              disabled={!count}
            >
              Export CSV
            </Button>
          </Tooltip>
          <FileButton onChange={onImport} accept=".csv,text/csv">
            {(props) => (
              <Tooltip label={`Import ${label} from CSV`}>
                <Button
                  {...props}
                  size="compact-xs"
                  variant="light"
                  color="green"
                  leftSection={<Upload size={12} />}
                  loading={importLoading === entityKey}
                >
                  Import CSV
                </Button>
              </Tooltip>
            )}
          </FileButton>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export function DataManagement({ onBack }: DataManagementProps) {
  const [lastBackup, setLastBackup]     = React.useState<string | null>(null);
  const [pendingFile, setPendingFile]   = React.useState<File | null>(null);
  const [confirmOpen, setConfirmOpen]   = React.useState(false);
  const [importLoading, setImportLoading] = React.useState<string | null>(null);

  const counts = useTableCounts();

  React.useEffect(() => {
    const ts = localStorage.getItem('erp_auto_backup_ts');
    if (ts) setLastBackup(new Date(Number(ts)).toLocaleString());
  }, []);

  // ── JSON Restore ───────────────────────────────────────────────────────
  const handleRestoreSelect = (file: File | null) => {
    if (!file) return;
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const handleConfirmedRestore = async () => {
    setConfirmOpen(false);
    if (!pendingFile) return;
    await backupService.importDatabase(pendingFile);
    setPendingFile(null);
  };

  // ── CSV per-entity ─────────────────────────────────────────────────────
  const handleExport = async (key: EntityKey) => {
    await backupService.exportEntityAsCSV(key);
  };

  const handleImport = async (key: EntityKey, file: File | null) => {
    if (!file) return;
    setImportLoading(key);
    try {
      const count = await backupService.importEntityFromCSV(key, file);
      const config = ENTITY_CONFIGS.find((c) => c.key === key);
      notifications.show({
        title: '✅ Import Successful',
        message: `${count} ${config?.label ?? key} records imported successfully.`,
        color: 'green',
        icon: <CheckCircle2 size={16} />,
      });
    } catch (err: any) {
      notifications.show({
        title: '❌ Import Failed',
        message: err.message || 'Could not parse or import the CSV file.',
        color: 'red',
      });
    } finally {
      setImportLoading(null);
    }
  };

  const handleTemplate = (key: EntityKey) => {
    backupService.downloadTemplate(key);
  };

  // ── Group entities by category ─────────────────────────────────────────
  const categories = ['master', 'sales', 'purchase', 'finance', 'inventory'] as const;

  return (
    <Box bg="gray.0" mih="100vh" p="xl">
      <Stack gap="xl" maw={1100} mx="auto">

        {/* ── Header ── */}
        <Paper withBorder p="lg" radius="md" bg="white">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
              <ThemeIcon size={52} radius="md" color="blue" variant="light">
                <Database size={28} />
              </ThemeIcon>
              <Box>
                <Title order={3} fw={700}>Data Management</Title>
                <Text size="sm" c="dimmed">
                  Export any data as CSV, import CSV files back, or backup/restore the full database.
                </Text>
              </Box>
            </Group>
            <Button variant="outline" color="gray" onClick={onBack}>← Back</Button>
          </Group>
        </Paper>

        <Tabs defaultValue="entities" variant="pills">
          <Paper withBorder px="md" py="xs" radius="md" bg="white" mb="md">
            <Tabs.List>
              <Tabs.Tab value="entities" leftSection={<FileSpreadsheet size={14} />}>
                Export / Import by Entity
              </Tabs.Tab>
              <Tabs.Tab value="backup" leftSection={<HardDrive size={14} />}>
                Full Database Backup
              </Tabs.Tab>
            </Tabs.List>
          </Paper>

          {/* ════════════════════════════════════════════════════════
              TAB 1 — Export / Import by Entity
          ════════════════════════════════════════════════════════ */}
          <Tabs.Panel value="entities">
            <Stack gap="md">
              <Alert icon={<AlertCircle size={14} />} color="blue" variant="light" radius="md">
                <Text size="sm">
                  <strong>Export:</strong> Downloads the selected data as a <code>.csv</code> file (opens in Excel/Sheets).{' '}
                  <strong>Import:</strong> Upload a CSV in the same format to add records.{' '}
                  <strong>Template:</strong> Download a blank template with column names and a sample row.
                </Text>
              </Alert>

              {/* Format note for transactional docs */}
              <Alert icon={<AlertCircle size={14} />} color="grape" variant="light" radius="md">
                <Text size="xs">
                  <strong>Note on Line Items:</strong> Documents like Invoices, Sales Orders, Purchase Orders etc. contain
                  a nested <code>items</code> column. This is stored as a JSON array inside the CSV cell.
                  When importing, keep this format exactly as exported — do not edit the items column manually.
                </Text>
              </Alert>

              {categories.map((cat) => {
                const entities = ENTITY_CONFIGS.filter((e) => e.category === cat);
                if (entities.length === 0) return null;
                return (
                  <Paper key={cat} withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
                    <Box px="lg" py="sm" bg={`${CATEGORY_COLORS[cat]}.0`} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <Group gap="xs">
                        <Text fw={700} size="sm" c={`${CATEGORY_COLORS[cat]}.7`}>
                          {CATEGORY_LABELS[cat]}
                        </Text>
                        <Badge size="xs" color={CATEGORY_COLORS[cat]} variant="light">
                          {entities.length} entities
                        </Badge>
                      </Group>
                    </Box>
                    <Table highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: '40%' }}>Entity</Table.Th>
                          <Table.Th style={{ width: '15%' }}>Records</Table.Th>
                          <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {entities.map((entity) => (
                          <EntityRow
                            key={entity.key}
                            entityKey={entity.key}
                            label={entity.label}
                            color={CATEGORY_COLORS[entity.category]}
                            count={counts?.[entity.key]}
                            hasItems={entity.hasItems}
                            onExport={() => handleExport(entity.key)}
                            onImport={(file) => handleImport(entity.key, file)}
                            onTemplate={() => handleTemplate(entity.key)}
                            importLoading={importLoading}
                          />
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                );
              })}

              {/* CSV Rules */}
              <Paper withBorder p="lg" radius="md" bg="white">
                <Group gap="xs" mb="sm">
                  <FileText size={16} color="#868e96" />
                  <Text fw={600} size="sm">CSV Import Rules</Text>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                  {[
                    'First row must contain exact column header names (use Template to get them).',
                    'Numbers must not include ₹ symbol or thousand-separator commas.',
                    'Dates should be in YYYY-MM-DD format (e.g. 2024-01-15).',
                    'Text containing commas must be wrapped in double quotes.',
                    'The "items" column in transactional docs must remain as a JSON array.',
                    'Leave optional fields blank — do not delete the column.',
                    'The "id" column is ignored on import — new IDs are assigned automatically.',
                    'File encoding must be UTF-8 (default in most spreadsheet apps).',
                  ].map((rule, i) => (
                    <Group key={i} gap="xs" align="flex-start" wrap="nowrap">
                      <Text size="xs" c="dimmed" fw={700} style={{ flexShrink: 0 }}>•</Text>
                      <Text size="xs" c="dimmed">{rule}</Text>
                    </Group>
                  ))}
                </SimpleGrid>
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* ════════════════════════════════════════════════════════
              TAB 2 — Full Database Backup & Restore
          ════════════════════════════════════════════════════════ */}
          <Tabs.Panel value="backup">
            <Stack gap="lg">

              {/* Auto-backup status */}
              <Paper withBorder p="lg" radius="md" bg="white">
                <Group justify="space-between" mb="xs">
                  <Box>
                    <Text fw={600}>Automatic Browser Backup</Text>
                    <Text size="xs" c="dimmed">
                      The database is periodically saved to local browser storage as an emergency backup.
                    </Text>
                  </Box>
                  <Badge color="green" variant="light" size="lg">ENABLED</Badge>
                </Group>
                {lastBackup && (
                  <Group gap="xs" mt="xs">
                    <Clock size={13} color="#868e96" />
                    <Text size="xs" c="dimmed">Last auto-backup: {lastBackup}</Text>
                  </Group>
                )}
                <Alert icon={<AlertCircle size={14} />} title="Important" color="orange" variant="light" mt="md">
                  Browser backups are lost when you clear browsing data. Always use the manual export below for permanent archiving.
                </Alert>
              </Paper>

              {/* Export / Restore cards */}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Paper withBorder p="xl" radius="md" bg="white">
                  <Stack gap="lg">
                    <Group gap="md">
                      <ThemeIcon size={52} radius="xl" color="blue" variant="light">
                        <ArrowDownToLine size={28} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="lg">Export Full Backup</Text>
                        <Text size="xs" c="dimmed">All tables → single <code>.json</code> file</Text>
                      </Box>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Downloads your entire database including products, customers, invoices, settings, and all other records.
                      Use this to transfer data to another device or as a periodic archive.
                    </Text>
                    <Button
                      fullWidth
                      size="md"
                      leftSection={<Download size={16} />}
                      onClick={() => backupService.exportDatabase()}
                    >
                      Download Full Backup (.json)
                    </Button>
                  </Stack>
                </Paper>

                <Paper withBorder p="xl" radius="md" bg="white">
                  <Stack gap="lg">
                    <Group gap="md">
                      <ThemeIcon size={52} radius="xl" color="red" variant="light">
                        <ArrowUpFromLine size={28} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="lg">Restore from Backup</Text>
                        <Text size="xs" c="dimmed">Upload a <code>.json</code> backup file</Text>
                      </Box>
                    </Group>
                    <Text size="sm" c="dimmed">
                      <strong style={{ color: '#c92a2a' }}>Warning:</strong> This will erase ALL current data and replace it with the backup.
                      A safety snapshot is created automatically before the restore begins.
                    </Text>
                    <FileButton onChange={handleRestoreSelect} accept="application/json,.json">
                      {(props) => (
                        <Button
                          {...props}
                          fullWidth
                          size="md"
                          color="red"
                          variant="light"
                          leftSection={<Upload size={16} />}
                        >
                          Upload Backup & Restore
                        </Button>
                      )}
                    </FileButton>
                  </Stack>
                </Paper>
              </SimpleGrid>

              {/* Quick export all CSVs */}
              <Paper withBorder p="lg" radius="md" bg="white">
                <Group gap="md" mb="lg">
                  <ThemeIcon size={44} radius="md" color="teal" variant="light">
                    <FileSpreadsheet size={22} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700}>Export All Entities as CSV</Text>
                    <Text size="xs" c="dimmed">
                      Export every entity category below individually as separate CSV files.
                    </Text>
                  </Box>
                </Group>
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                  {ENTITY_CONFIGS.map((entity) => (
                    <Button
                      key={entity.key}
                      variant="light"
                      color={CATEGORY_COLORS[entity.category]}
                      size="sm"
                      leftSection={ENTITY_ICONS[entity.key] ?? <FileText size={14} />}
                      onClick={() => handleExport(entity.key)}
                      disabled={!counts?.[entity.key]}
                      styles={{ inner: { fontSize: 12 } }}
                    >
                      {entity.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* ── Confirm Restore Modal ── */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="⚠️ Confirm Full Data Restore"
        centered
        size="md"
        radius="md"
      >
        <Stack gap="md">
          <Alert icon={<AlertCircle size={16} />} color="red" title="This will replace ALL current data">
            Restoring from a backup permanently erases all current records — invoices, products, customers, settings, everything.
            A safety backup is created automatically first, but proceed carefully.
          </Alert>
          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Group gap="xs">
              <FileText size={16} color="#495057" />
              <Text size="sm"><strong>File:</strong> {pendingFile?.name}</Text>
            </Group>
          </Paper>
          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button color="red" onClick={handleConfirmedRestore} leftSection={<RefreshCw size={16} />}>
              Yes, Restore My Data
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
