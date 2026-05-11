import { db } from '../db';
import { notifications } from '@mantine/notifications';

/**
 * Exports the entire Dexie database to a JSON file download.
 */
export const backupService = {
  async exportDatabase() {
    try {
      const exportData: any = {};
      const tableNames = db.tables.map(table => table.name);

      for (const name of tableNames) {
        exportData[name] = await db.table(name).toArray();
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `erp-backup-${timestamp}.json`;
      a.click();

      URL.revokeObjectURL(url);
      notifications.show({ title: 'Backup Successful', message: 'Database exported successfully.', color: 'green' });
    } catch (error) {
      console.error('Export failed:', error);
      notifications.show({ title: 'Backup Failed', message: 'Could not export database.', color: 'red' });
    }
  },

  /**
   * Returns a JSON snapshot of all database tables (used internally before import).
   */
  async createSnapshot(): Promise<Record<string, any[]>> {
    const snapshot: Record<string, any[]> = {};
    for (const table of db.tables) {
      snapshot[table.name] = await table.toArray();
    }
    return snapshot;
  },

  /**
   * Restores the database from a snapshot object.
   */
  async restoreSnapshot(snapshot: Record<string, any[]>): Promise<void> {
    for (const table of db.tables) {
      await table.clear();
    }
    for (const [tableName, rows] of Object.entries(snapshot)) {
      if (Array.isArray(rows) && rows.length > 0) {
        await db.table(tableName).bulkAdd(rows);
      }
    }
  },

  /**
   * SAFE import: auto-exports a backup first, then imports.
   * If import fails, restores from the pre-import snapshot.
   *
   * @param file - The JSON backup file to import
   * @param onConfirm - Optional: call this to trigger a confirmation dialog, resolves true/false
   */
  async importDatabase(file: File, onConfirm?: () => Promise<boolean>): Promise<void> {
    // Step 1: If a confirmation handler is provided, wait for user confirmation
    if (onConfirm) {
      const confirmed = await onConfirm();
      if (!confirmed) return;
    }

    // Step 2: Read and parse the file
    let importData: Record<string, any[]>;
    try {
      const text = await file.text();
      importData = JSON.parse(text);
    } catch {
      notifications.show({ title: 'Invalid File', message: 'The file is not a valid JSON backup.', color: 'red' });
      return;
    }

    // Step 3: Create a safety snapshot of current data BEFORE clearing
    notifications.show({
      id: 'backup-in-progress',
      title: 'Creating safety backup...',
      message: 'Saving current data before restoring.',
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    let snapshot: Record<string, any[]> = {};
    try {
      snapshot = await backupService.createSnapshot();
    } catch (e) {
      console.warn('Could not create safety snapshot:', e);
    }

    // Step 4: Clear and import
    try {
      await backupService.restoreSnapshot(importData);
      notifications.hide('backup-in-progress');
      notifications.show({
        title: 'Restore Complete',
        message: 'Data imported successfully. Reloading...',
        color: 'green'
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Import failed, restoring from snapshot:', error);

      // Step 5: ROLLBACK — restore the pre-import snapshot
      try {
        await backupService.restoreSnapshot(snapshot);
        notifications.hide('backup-in-progress');
        notifications.show({
          title: 'Import Failed — Restored',
          message: 'The import failed. Your original data has been automatically restored.',
          color: 'orange',
          autoClose: 8000,
        });
      } catch (rollbackError) {
        console.error('CRITICAL: Rollback also failed!', rollbackError);
        notifications.hide('backup-in-progress');
        notifications.show({
          title: '🚨 Critical Error',
          message: 'Import and rollback both failed. Please contact support. Your data may need manual recovery.',
          color: 'red',
          autoClose: false,
        });
      }
    }
  },

  /**
   * Background Auto-Backup to LocalStorage (Emergency Recovery)
   * Shows a notification if the storage limit is exceeded.
   */
  async performAutoBackup() {
    try {
      const exportData: any = {};
      for (const table of db.tables) {
        exportData[table.name] = await table.toArray();
      }
      const serialized = JSON.stringify({
        timestamp: Date.now(),
        data: exportData
      });
      localStorage.setItem('erp_auto_backup', serialized);
      console.log('Auto-backup performed to local storage.');
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError') {
        console.warn('Auto-backup failed: LocalStorage limit exceeded.');
        notifications.show({
          title: 'Auto-Backup Warning',
          message: 'Your data is too large for automatic browser backup. Please export a manual backup from Data Management.',
          color: 'yellow',
          autoClose: 8000,
        });
      } else {
        console.warn('Auto-backup failed:', e);
      }
    }
  }
};
