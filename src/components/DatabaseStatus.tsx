import React, { useEffect, useState } from 'react';
import { Paper, Title, Text, Group, Stack, Progress, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { Database, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';
import { getStorageStats } from '../utils/backup';

export function DatabaseStatus() {
  const [stats, setStats] = useState<{usage: number, quota: number, percent: number} | null>(null);
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);

  const refreshStats = async () => {
    const s = await getStorageStats();
    setStats(s);
    if (navigator.storage && navigator.storage.persisted) {
      setIsPersisted(await navigator.storage.persisted());
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper withBorder p="xl" radius="md" bg="gray.0">
      <Group justify="space-between" mb="lg">
        <Group>
          <Database size={24} color="#228be6" />
          <Title order={4}>Database Health</Title>
        </Group>
        <ActionIcon variant="subtle" onClick={refreshStats}>
          <RefreshCw size={18} />
        </ActionIcon>
      </Group>

      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <HardDrive size={16} color="#64748b" />
            <Text size="sm" fw={500}>Local Storage Usage</Text>
          </Group>
          <Text size="sm" fw={600}>{stats ? formatSize(stats.usage) : 'Calculating...'}</Text>
        </Group>
        
        <Progress 
          value={stats?.percent || 0} 
          size="sm" 
          color={(stats?.percent || 0) > 80 ? 'red' : 'blue'} 
          animated 
        />
        
        <Group justify="space-between">
          <Text size="xs" c="dimmed">Total browser quota: {stats ? formatSize(stats.quota) : '...'}</Text>
          <Text size="xs" c="dimmed">{stats ? stats.percent.toFixed(2) : 0}% used</Text>
        </Group>

        <Divider variant="dashed" />

        <Group justify="space-between">
          <Group gap="xs">
            <ShieldCheck size={16} color={isPersisted ? 'green' : 'orange'} />
            <Text size="sm" fw={500}>Data Persistence</Text>
            <Tooltip label="When active, the browser will not delete your data even if disk space is low.">
              <Badge variant="light" color={isPersisted ? 'green' : 'orange'} size="sm">
                {isPersisted ? 'GUARANTEED' : 'BEST EFFORT'}
              </Badge>
            </Tooltip>
          </Group>
          <Text size="xs" c="dimmed" maw={250} ta="right">
            {isPersisted 
              ? 'Browser has granted permanent storage.' 
              : 'Storage may be cleared by browser if disk is full.'}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

const Divider = ({ variant }: { variant: string }) => <div style={{ borderTop: `1px ${variant} #e2e8f0`, margin: '8px 0' }} />;
