
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionContext';
// Standard Permissions: tenant.role.read, tenant.role.create, tenant.role.update, tenant.role.delete
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Plus, Shield, RefreshCw, Crown } from 'lucide-react';
import { AdminPageLayout, PageHeader } from '@/templates/flowbite-admin';
import { useSearch } from '@/hooks/useSearch';
import { useTranslation } from 'react-i18next';
import { encodeRouteParam } from '@/lib/routeSecurity';
import { cn } from '@/lib/utils';
import RolesDeleteDialog from '@/components/dashboard/roles/RolesDeleteDialog';
import RolesOverviewCards from '@/components/dashboard/roles/RolesOverviewCards';
import RolesSearchToolbar from '@/components/dashboard/roles/RolesSearchToolbar';
import RolesTableSection from '@/components/dashboard/roles/RolesTableSection';

import { useTenant } from '@/contexts/TenantContext';

function RolesManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { hasPermission, isPlatformAdmin } = usePermissions();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();

  // State declarations
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const {
    query,
    setQuery,
    debouncedQuery,
    isValid: isSearchValid,
    message: searchMessage,
    loading: searchLoading,
    minLength,
    clearSearch
  } = useSearch({ context: 'admin' });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Permission checks
  const canView = hasPermission('tenant.role.read');
  const canCreate = hasPermission('tenant.role.create');
  const canEdit = hasPermission('tenant.role.update');
  const canDelete = hasPermission('tenant.role.delete');

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      let dbQuery = supabase
        .from('roles')
        .select('*, owner:users!created_by(email), role_permissions(count), tenant:tenants(name)')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      // Explicit Tenant Isolation (unless Platform Admin)
      if (!isPlatformAdmin && currentTenant?.id) {
        dbQuery = dbQuery.eq('tenant_id', currentTenant.id);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: t('common.error'), description: 'Failed to load roles' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (role) => {
    const routeId = await encodeRouteParam({ value: role.id, scope: 'roles.edit' });
    if (!routeId) {
      toast({ variant: 'destructive', title: t('common.error'), description: t('roles.errors.load_failed', 'Unable to open role editor.') });
      return;
    }
    navigate(`/cmspanel/roles/edit/${routeId}`);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (role) => {
    if (role.is_system || role.is_platform_admin || role.is_full_access || role.is_public || role.is_guest) {
      toast({ variant: 'destructive', title: 'Protected Role', description: t('roles.errors.protected_role') });
      return;
    }
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  // Execute the actual delete
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    setDeleteDialogOpen(false);
    setLoading(true);

    try {
      // Check if users are assigned
      const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role_id', roleToDelete.id);

      if (count > 0) {
        toast({ variant: 'destructive', title: t('common.error'), description: t('roles.errors.assigned_users', { count }) });
        return;
      }

      const { error } = await supabase
        .from('roles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', roleToDelete.id);

      if (error) throw error;

      toast({ title: t('common.success'), description: t('common.move_to_trash_confirm', { resource: t('roles.title') }) });
      fetchRoles();
    } catch (err) {
      toast({ variant: 'destructive', title: t('common.error'), description: err.message });
    } finally {
      setLoading(false);
      setRoleToDelete(null);
    }
  };

  const filteredRoles = roles.filter(role => {
    if (!debouncedQuery) return true;
    const lower = debouncedQuery.toLowerCase();
    return role.name.toLowerCase().includes(lower) ||
      role.description?.toLowerCase().includes(lower);
  });

  const totalRoles = roles.length;
  const visibleRoles = filteredRoles.length;
  const privilegedRoles = roles.filter((role) => role.is_platform_admin || role.is_full_access).length;
  const searchActive = Boolean(debouncedQuery);

  const columns = [
    {
      key: 'name',
      label: t('roles.columns.name'),
      className: 'min-w-[220px]',
      render: (name, row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Shield className={cn('h-4 w-4', row.is_full_access || row.is_platform_admin ? 'text-primary' : 'text-muted-foreground')} />
            <span className="text-sm font-semibold text-foreground">{name}</span>
            {(row.is_platform_admin || row.is_full_access) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-500">
                <Crown className="h-3 w-3 fill-amber-500 text-amber-500" />
                {t('roles.badges.tenant_root')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">ID: {row.id?.slice(0, 8) || '-'}</p>
        </div>
      )
    },
    {
      key: 'description',
      label: t('roles.columns.description'),
      className: 'min-w-[220px]',
      render: (value) => (
        <span className="text-sm text-muted-foreground">{value || t('common.not_set', 'Not set')}</span>
      )
    },
    {
      key: 'permissions_count',
      label: t('roles.columns.permissions'),
      className: 'min-w-[160px]',
      render: (_, row) => {
        const count = row.role_permissions ? row.role_permissions[0]?.count : 0;
        if (row.is_full_access || row.is_platform_admin) {
          return <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t('roles.badges.all_access')} ({count || '∞'})</span>;
        }
        return <span className="inline-flex items-center rounded-full border border-border/70 bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{count || 0} {t('roles.columns.permissions')}</span>;
      }
    },
    {
      key: 'owner',
      label: t('roles.columns.created_by'),
      className: 'min-w-[170px]',
      render: (_, row) => (
        <span className="text-xs text-muted-foreground">{row.owner?.email || '-'}</span>
      )
    }
  ];

  if (isPlatformAdmin) {
    columns.push({
      key: 'tenant_id',
      label: t('roles.columns.tenant'),
      className: 'min-w-[150px]',
      render: (tid, row) => row.tenant?.name ? (
        <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {row.tenant.name}
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {tid ? 'Unknown Tenant' : t('common.global')}
        </span>
      )
    });
  }

  // Header actions for PageHeader
  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={fetchRoles}
        title={t('common.refresh')}
        className="h-10 rounded-xl border-border/70 bg-background/80 px-3 text-muted-foreground shadow-sm hover:bg-accent/70 hover:text-foreground"
      >
        <RefreshCw className={cn('mr-1.5 h-4 w-4', loading && 'animate-spin')} />
        <span className="hidden sm:inline">{t('common.refresh')}</span>
      </Button>
      {canCreate && (
        <Button onClick={() => navigate('/cmspanel/roles/new')} className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-sm hover:opacity-95">
          <Plus className="mr-2 h-4 w-4" /> {t('roles.create_role')}
        </Button>
      )}
    </div>
  );

  // Breadcrumbs for PageHeader
  const breadcrumbs = [{ label: t('roles.title'), icon: Shield }];

  if (!canView) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/70 p-8 text-center text-muted-foreground shadow-sm">
        {t('common.access_denied')}
      </div>
    );
  }

  return (
    <AdminPageLayout requiredPermission="tenant.role.read">
      <RolesDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        roleToDelete={roleToDelete}
        onConfirm={handleConfirmDelete}
        t={t}
      />

      <PageHeader
        title={t('roles.title')}
        description={t('roles.subtitle')}
        icon={Shield}
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <RolesOverviewCards
        t={t}
        totalRoles={totalRoles}
        visibleRoles={visibleRoles}
        privilegedRoles={privilegedRoles}
        searchActive={searchActive}
        debouncedQuery={debouncedQuery}
      />

      <div className="dashboard-surface dashboard-surface-hover overflow-hidden">
        <RolesSearchToolbar
          t={t}
          query={query}
          setQuery={setQuery}
          clearSearch={clearSearch}
          loading={loading}
          searchLoading={searchLoading}
          isSearchValid={isSearchValid}
          searchMessage={searchMessage}
          minLength={minLength}
          totalRoles={totalRoles}
          visibleRoles={visibleRoles}
          searchActive={searchActive}
          onRefresh={fetchRoles}
        />

        <RolesTableSection
          data={filteredRoles}
          columns={columns}
          loading={loading}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={handleEdit}
          onDelete={openDeleteDialog}
        />
      </div>
    </AdminPageLayout>
  );
}

export default RolesManager;
