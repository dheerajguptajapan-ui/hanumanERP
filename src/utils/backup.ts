import { db } from '../db';

/**
 * Robustly exports the entire database to a JSON file
 */
export async function exportDatabase() {
  const tables = [
    'products', 'partners', 'quotations', 'salesOrders', 
    'deliveryNotes', 'invoices', 'purchaseOrders', 'purchaseBills', 
    'payments', 'settings', 'categories', 'brands', 'manufacturers', 'adjustments'
  ];

  const backupData: any = {
    version: 2,
    timestamp: new Date().toISOString(),
    data: {}
  };

  for (const table of tables) {
    if ((db as any)[table]) {
      backupData.data[table] = await (db as any)[table].toArray();
    }
  }

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hardware_erp_comprehensive_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Robustly restores the database from a JSON backup file
 */
export async function importDatabase(jsonData: any) {
  try {
    if (!jsonData.data) throw new Error('Invalid backup file');

    const tables = Object.keys(jsonData.data);
    
    // Validate tables exist in our current DB
    const validTables = tables.filter(t => (db as any)[t]);

    await db.transaction('rw', validTables.map(t => (db as any)[t]), async () => {
      for (const table of validTables) {
        await (db as any)[table].clear();
        if (jsonData.data[table] && jsonData.data[table].length > 0) {
          await (db as any)[table].bulkAdd(jsonData.data[table]);
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}

/**
 * Requests the browser to keep storage persistent
 */
export async function persistStorage() {
  if (navigator.storage?.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Storage persisted: ${isPersisted}`);
    return isPersisted;
  }
  return false;
}

/**
 * Gets storage estimate
 */
export async function getStorageStats() {
  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percent: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
    };
  }
  return null;
}
