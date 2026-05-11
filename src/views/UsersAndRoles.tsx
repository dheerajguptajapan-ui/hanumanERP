import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stack, 
  Group, 
  Title, 
  Text, 
  Button, 
  Paper, 
  Table, 
  Avatar, 
  Badge, 
  ActionIcon, 
  TextInput, 
  Select, 
  Textarea, 
  Checkbox,
  ScrollArea,
  Divider,
  Collapse,
  Anchor,
  SimpleGrid
} from '@mantine/core';
import { 
  MoreVertical, 
  Plus, 
  Search, 
  ChevronLeft, 
  Settings as SettingsIcon,
  X,
  ChevronDown,
  ChevronRight,
  Building,
  Users as UsersIcon,
  Shield,
  Package as PackageIcon,
  Zap,
  Layout,
  HelpCircle,
  FileText
} from 'lucide-react';
import { db, type Role, type User } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface UsersAndRolesProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  activeTab?: 'users' | 'roles';
}

export function UsersAndRoles({ onBack, onNavigate, activeTab: initialTab = 'users' }: UsersAndRolesProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>(initialTab);
  const [view, setView] = useState<'list' | 'invite' | 'new-role'>('list');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const users = useLiveQuery(() => db.users.toArray()) || [];
  const roles = useLiveQuery(() => db.roles.toArray()) || [];

  const renderContent = () => {
    if (activeTab === 'users') {
      if (view === 'invite') return <InviteUserForm roles={roles} onCancel={() => setView('list')} />;
      return <UsersList users={users} roles={roles} onInvite={() => setView('invite')} />;
    } else {
      if (view === 'new-role') return <NewRoleForm onCancel={() => setView('list')} />;
      return <RolesList roles={roles} onNewRole={() => setView('new-role')} />;
    }
  };

  return (
    <Box h="100vh" bg="white" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Settings Top Header */}
      <Box p="md" bg="white" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
               <Box p={6} bg="orange.0" style={{ borderRadius: '4px' }}>
                  <SettingsIcon size={20} color="#f76707" />
               </Box>
               <Stack gap={0}>
                  <Group gap={4}>
                     <ActionIcon variant="subtle" color="gray" size="sm" onClick={onBack}><ChevronLeft size={16} /></ActionIcon>
                     <Text fw={700} size="sm">All Settings</Text>
                  </Group>
                  <Text size="xs" c="dimmed">jhakkasdheeraj</Text>
               </Stack>
            </Group>

            <Box style={{ flex: 1, maxWidth: 500 }} mx="xl">
               <TextInput 
                  placeholder="Search settings (/)" 
                  leftSection={<Search size={14} />} 
                  size="sm"
                  styles={{ input: { backgroundColor: '#f1f3f5', border: 'none' } }}
               />
            </Box>

            <Button 
               variant="subtle" 
               color="red" 
               size="xs" 
               rightSection={<X size={14} />}
               onClick={onBack}
            >
               Close Settings
            </Button>
         </Group>
      </Box>

      <Group align="flex-start" gap={0} style={{ flex: 1, overflow: 'hidden' }} wrap="nowrap">
        {/* Settings Sidebar */}
        <Box w={260} h="100%" bg="#f8f9fa" style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
           <ScrollArea style={{ flex: 1 }} p="md">
              <Stack gap="xl">
                 <Stack gap="xs">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Organization Settings</Text>
                    <Stack gap={2}>
                       <SidebarGroup 
                          label="Organization" 
                          icon={<Building size={14} />} 
                          items={['Profile', 'Branding', 'Locations', 'AI Preferences', 'Manage Subscription']} 
                          onItemClick={(item: string) => {
                             if (item === 'Profile') onNavigate?.('org-profile');
                             if (item === 'Branding') onNavigate?.('branding');
                             if (item === 'Locations') onNavigate?.('generic');
                             if (item === 'AI Preferences') onNavigate?.('generic');
                             if (item === 'Manage Subscription') onNavigate?.('generic');
                          }}
                       />
                       <SidebarGroup 
                          label="Users & Roles" 
                          icon={<UsersIcon size={14} />} 
                          items={['Users', 'Roles', 'User Preferences']} 
                          activeItem={activeTab === 'users' ? 'Users' : 'Roles'}
                          onItemClick={(item: string) => {
                             if (item === 'Users') { setActiveTab('users'); setView('list'); }
                             if (item === 'Roles') { setActiveTab('roles'); setView('list'); }
                          }}
                          initiallyOpened
                       />
                       <SidebarGroup 
                          label="Taxes & Compliance" 
                          icon={<Shield size={14} />} 
                          items={['Taxes', 'Compliance']} 
                          onItemClick={(item: string) => {
                             if (item === 'Taxes') onNavigate?.('taxes');
                          }}
                       />
                       <SidebarGroup 
                          label="Setup & Configurations" 
                          icon={<SettingsIcon size={14} />} 
                          items={['General', 'Currencies', 'Payment Terms']} 
                          onItemClick={(item: string) => {
                             if (item === 'General') onNavigate?.('general-settings');
                          }}
                       />
                    </Stack>
                 </Stack>
              </Stack>
           </ScrollArea>
        </Box>

        {/* Content Area */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }} h="100%">
           {renderContent()}
        </Box>
      </Group>
    </Box>
  );
}

function UsersList({ users, roles, onInvite }: { users: User[], roles: Role[], onInvite: () => void }) {
  return (
    <>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between">
            <Group gap="xs">
               <Title order={4} fw={500}>All Users</Title>
               <ChevronDown size={18} />
            </Group>
            <Group gap="sm">
               <Button color="red" leftSection={<Plus size={16} />} onClick={onInvite}>Invite User</Button>
            </Group>
         </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
         <Table verticalSpacing="md" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
               <Table.Tr>
                  <Table.Th><Text size="xs" fw={700} tt="uppercase">User Details</Text></Table.Th>
                  <Table.Th><Text size="xs" fw={700} tt="uppercase">Role</Text></Table.Th>
                  <Table.Th><Text size="xs" fw={700} tt="uppercase">Status</Text></Table.Th>
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
               {users.map(user => {
                  const role = roles.find(r => r.id === user.roleId);
                  return (
                     <Table.Tr key={user.id}>
                        <Table.Td>
                           <Group gap="sm">
                              <Avatar color="blue" radius="xl">{user.name[0]}</Avatar>
                              <Stack gap={0}>
                                 <Text size="sm" fw={600} c="blue">{user.name}</Text>
                                 <Text size="xs" c="dimmed">{user.email}</Text>
                              </Stack>
                           </Group>
                        </Table.Td>
                        <Table.Td>
                           <Text size="sm">{role?.name || 'No Role'}</Text>
                        </Table.Td>
                        <Table.Td>
                           <Badge color={user.status === 'active' ? 'green' : 'gray'} variant="light" radius="xs" size="sm">{user.status}</Badge>
                        </Table.Td>
                     </Table.Tr>
                  );
               })}
               {users.length === 0 && (
                  <Table.Tr>
                     <Table.Td colSpan={3} ta="center" py="xl">
                        <Text c="dimmed">No users found. Invite your first user!</Text>
                     </Table.Td>
                  </Table.Tr>
               )}
            </Table.Tbody>
         </Table>
      </ScrollArea>
    </>
  );
}

function InviteUserForm({ roles, onCancel }: { roles: Role[], onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: ''
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.roleId) return;
    await db.users.add({
      name: formData.name,
      email: formData.email,
      roleId: parseInt(formData.roleId),
      status: 'active'
    });
    onCancel();
  };

  return (
    <>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Title order={4} fw={500}>Invite User</Title>
      </Box>
      <ScrollArea style={{ flex: 1 }} p="xl">
         <Stack gap="xl" maw={600}>
            <TextInput label={<Text size="sm" c="red">Name*</Text>} required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <TextInput label={<Text size="sm" c="red">Email Address*</Text>} required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Select 
               label={<Text size="sm" c="red">Role*</Text>} 
               required 
               data={roles.map(r => ({ value: r.id!.toString(), label: r.name }))} 
               value={formData.roleId}
               onChange={(val) => setFormData({...formData, roleId: val || ''})}
            />
         </Stack>
      </ScrollArea>
      <Box p="md" bg="#f8f9fa" style={{ borderTop: '1px solid #e2e8f0' }}>
         <Group gap="sm">
            <Button color="red" px="xl" size="xs" onClick={handleSave}>Save</Button>
            <Button variant="default" color="gray" px="xl" size="xs" onClick={onCancel}>Cancel</Button>
         </Group>
      </Box>
    </>
  );
}

function RolesList({ roles, onNewRole }: { roles: Role[], onNewRole: () => void }) {
  return (
    <>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Group justify="space-between">
            <Title order={4} fw={500}>Roles</Title>
            <Button color="red" leftSection={<Plus size={16} />} size="xs" onClick={onNewRole}>New Role</Button>
         </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
         <Table verticalSpacing="md" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
               <Table.Tr>
                  <Table.Th><Text size="xs" fw={700} tt="uppercase">Role Name</Text></Table.Th>
                  <Table.Th><Text size="xs" fw={700} tt="uppercase">Description</Text></Table.Th>
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
               {roles.map(role => (
                  <Table.Tr key={role.id}>
                     <Table.Td>
                        <Text size="sm" fw={600} c="blue">{role.name}</Text>
                     </Table.Td>
                     <Table.Td>
                        <Text size="sm" c="dimmed">{role.description}</Text>
                     </Table.Td>
                  </Table.Tr>
               ))}
               {roles.length === 0 && (
                  <Table.Tr>
                     <Table.Td colSpan={2} ta="center" py="xl">
                        <Text c="dimmed">No roles found. Create your first role!</Text>
                     </Table.Td>
                  </Table.Tr>
               )}
            </Table.Tbody>
         </Table>
      </ScrollArea>
    </>
  );
}

function NewRoleForm({ onCancel }: { onCancel: () => void }) {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<any>({});

  const togglePermission = (module: string, sub: string, action: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [sub]: {
          ...prev[module]?.[sub],
          [action]: !prev[module]?.[sub]?.[action]
        }
      }
    }));
  };

  const toggleAll = (module: string, sub: string) => {
     const isAll = permissions[module]?.[sub]?.full;
     setPermissions((prev: any) => ({
        ...prev,
        [module]: {
           ...prev[module],
           [sub]: {
              full: !isAll,
              view: !isAll,
              create: !isAll,
              edit: !isAll,
              delete: !isAll,
              approve: !isAll
           }
        }
     }));
  };

  const handleSave = async () => {
     if (!roleName) return;
     await db.roles.add({
        name: roleName,
        description,
        permissions
     });
     onCancel();
  };

  const tablePermissions = [
    { module: 'Contacts', subModules: ['Customers', 'Vendors'], cols: ['Full', 'View', 'Create', 'Edit', 'Delete'] },
    { module: 'Items', subModules: ['Item', 'Composite Items', 'Transfer Orders', 'Inventory Adjustments', 'Price List', 'Move Order', 'Putaway'], cols: ['Full', 'View', 'Create', 'Edit', 'Delete', 'Approve'] },
    { module: 'Sales', subModules: ['Invoices', 'Customer Payments', 'Sales Orders', 'Package', 'Shipment Order', 'Credit Notes', 'Sales Return', 'Sales Return Receive', 'Sales Receipt'], cols: ['Full', 'View', 'Create', 'Edit', 'Delete', 'Approve'] },
    { module: 'Purchases', subModules: ['Bills', 'Vendor Payments', 'Purchase Orders', 'Purchase Receive', 'Vendor Credits', 'Expenses'], cols: ['Full', 'View', 'Create', 'Edit', 'Delete', 'Approve'] },
    { module: 'Accountant', subModules: ['Chart of Accounts'], cols: ['Full', 'View', 'Create', 'Edit', 'Delete'] }
  ];

  return (
    <>
      <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
         <Title order={4} fw={500}>New Role</Title>
      </Box>
      <ScrollArea style={{ flex: 1 }}>
         <Stack gap={40} p="xl">
            <Stack gap="md" maw={600}>
               <TextInput label={<Text size="sm" c="red">Role Name*</Text>} required value={roleName} onChange={(e) => setRoleName(e.target.value)} />
               <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Max. 500 characters" minRows={3} />
            </Stack>

            {tablePermissions.map((group) => (
               <Box key={group.module}>
                  <Paper withBorder radius="xs">
                     <Box p="xs" bg="gray.0" style={{ borderBottom: '1px solid #dee2e6' }}>
                        <Text fw={700} size="sm">{group.module}</Text>
                     </Box>
                     <Table verticalSpacing="xs">
                        <Table.Thead bg="white">
                           <Table.Tr>
                              <Table.Th w="30%"><Text size="xs" fw={700} c="dimmed">PARTICULARS</Text></Table.Th>
                              <Table.Th><Text size="xs" fw={700} c="dimmed">FULL</Text></Table.Th>
                              <Table.Th><Text size="xs" fw={700} c="dimmed">VIEW</Text></Table.Th>
                              <Table.Th><Text size="xs" fw={700} c="dimmed">CREATE</Text></Table.Th>
                              <Table.Th><Text size="xs" fw={700} c="dimmed">EDIT</Text></Table.Th>
                              <Table.Th><Text size="xs" fw={700} c="dimmed">DELETE</Text></Table.Th>
                              {group.cols.includes('Approve') && <Table.Th><Text size="xs" fw={700} c="dimmed">APPROVE</Text></Table.Th>}
                              <Table.Th><Text size="xs" fw={700} c="dimmed">OTHERS</Text></Table.Th>
                           </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                           {group.subModules.map((sub) => (
                              <Table.Tr key={sub}>
                                 <Table.Td><Text size="xs" fw={600} c="gray.8">{sub}</Text></Table.Td>
                                 <Table.Td><Checkbox size="xs" checked={permissions[group.module]?.[sub]?.full} onChange={() => toggleAll(group.module, sub)} /></Table.Td>
                                 <Table.Td><Checkbox size="xs" checked={permissions[group.module]?.[sub]?.view} onChange={() => togglePermission(group.module, sub, 'view')} /></Table.Td>
                                 <Table.Td><Checkbox size="xs" checked={permissions[group.module]?.[sub]?.create} onChange={() => togglePermission(group.module, sub, 'create')} /></Table.Td>
                                 <Table.Td><Checkbox size="xs" checked={permissions[group.module]?.[sub]?.edit} onChange={() => togglePermission(group.module, sub, 'edit')} /></Table.Td>
                                 <Table.Td><Checkbox size="xs" checked={permissions[group.module]?.[sub]?.delete} onChange={() => togglePermission(group.module, sub, 'delete')} /></Table.Td>
                                 {group.cols.includes('Approve') && (
                                    <Table.Td>
                                       {(sub === 'Transfer Orders' || sub === 'Invoices' || sub === 'Sales Orders' || sub === 'Credit Notes' || sub === 'Bills' || sub === 'Vendor Payments' || sub === 'Purchase Orders' || sub === 'Purchase Receive' || sub === 'Vendor Credits') ? 
                                          <Checkbox size="xs" checked={permissions[group.module]?.[sub]?.approve} onChange={() => togglePermission(group.module, sub, 'approve')} /> : null
                                       }
                                    </Table.Td>
                                 )}
                                 <Table.Td><Anchor size="xs">More Permissions</Anchor></Table.Td>
                              </Table.Tr>
                           ))}
                        </Table.Tbody>
                     </Table>
                  </Paper>
               </Box>
            ))}
         </Stack>
      </ScrollArea>
      <Box p="md" bg="#f8f9fa" style={{ borderTop: '1px solid #e2e8f0' }}>
         <Group gap="sm">
            <Button color="red" px="xl" size="xs" onClick={handleSave}>Save</Button>
            <Button variant="default" color="gray" px="xl" size="xs" onClick={onCancel}>Cancel</Button>
         </Group>
      </Box>
    </>
  );
}

function SidebarGroup({ label, icon, items, activeItem, onItemClick, initiallyOpened = false }: any) {
  const [opened, setOpened] = useState(initiallyOpened);
  return (
    <Box>
       <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }} onClick={() => setOpened(!opened)}>
          <Group gap="sm">
             {opened ? <ChevronDown size={14} color="gray" /> : <ChevronRight size={14} color="gray" />}
             <Text size="sm" fw={600}>{label}</Text>
          </Group>
       </Group>
       <Collapse in={opened}>
          <Stack gap={2} pl={28}>
             {items.map((item: any) => (
                <Box key={item} p={8} bg={activeItem === item ? 'blue.0' : 'transparent'} style={{ borderRadius: '4px', cursor: 'pointer' }} onClick={() => onItemClick?.(item)}>
                   <Text size="sm" fw={activeItem === item ? 600 : 400} c={activeItem === item ? 'blue' : 'gray.7'}>{item}</Text>
                </Box>
             ))}
          </Stack>
       </Collapse>
    </Box>
  );
}
