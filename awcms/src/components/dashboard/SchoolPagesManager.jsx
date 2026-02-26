import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { School } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import useSplatSegments from '@/hooks/useSplatSegments';
import { AdminPageLayout, PageHeader } from '@/templates/flowbite-admin';
import { SETTINGS_KEYS } from '@/components/dashboard/school-pages/constants';
import SchoolPagesLoadingState from '@/components/dashboard/school-pages/SchoolPagesLoadingState';
import SchoolPagesHeaderActions from '@/components/dashboard/school-pages/SchoolPagesHeaderActions';
import SchoolPagesTabs from '@/components/dashboard/school-pages/SchoolPagesTabs';

function SchoolPagesManager() {
  useTranslation();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const segments = useSplatSegments();

  const tabValues = Object.keys(SETTINGS_KEYS);
  const hasTabSegment = tabValues.includes(segments[0]);
  const activeTab = hasTabSegment ? segments[0] : 'profile';
  const hasExtraSegment = segments.length > 1;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const tenantId = currentTenant?.id;

  const loadData = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('tenant_id', tenantId)
        .in('key', Object.values(SETTINGS_KEYS));

      if (error) throw error;

      const loaded = {};
      settings?.forEach((setting) => {
        const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        const keyName = Object.keys(SETTINGS_KEYS).find((key) => SETTINGS_KEYS[key] === setting.key);
        if (keyName) loaded[keyName] = parsed;
      });

      setData(loaded);
    } catch (error) {
      console.error('Error loading school pages data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [tenantId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (segments.length > 0 && !hasTabSegment) {
      navigate('/cmspanel/school-pages', { replace: true });
      return;
    }

    if (hasTabSegment && hasExtraSegment) {
      const basePath = activeTab === 'profile' ? '/cmspanel/school-pages' : `/cmspanel/school-pages/${activeTab}`;
      navigate(basePath, { replace: true });
    }
  }, [segments, hasTabSegment, hasExtraSegment, activeTab, navigate]);

  const handleSave = async () => {
    if (!tenantId) return;

    setSaving(true);
    try {
      const key = SETTINGS_KEYS[activeTab];
      const value = data[activeTab] || {};

      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            tenant_id: tenantId,
            key,
            value: JSON.stringify(value),
            type: 'json',
          },
          { onConflict: 'tenant_id,key' }
        );

      if (error) throw error;

      toast({ title: 'Saved', description: `${activeTab} data saved successfully` });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'Error', description: 'Failed to save data', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [section]: {
          ...prev[activeTab]?.[section],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const updateTopLevel = (field, value) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  if (loading) {
    return <SchoolPagesLoadingState />;
  }

  return (
    <AdminPageLayout requiredPermission={['tenant.school_pages.read', 'platform.school_pages.read']}>
      <PageHeader
        title="School Website Pages"
        description="Manage content for your school's public website"
        icon={School}
        breadcrumbs={[{ label: 'School Pages', icon: School }]}
        actions={(
          <SchoolPagesHeaderActions
            loadData={loadData}
            loading={loading}
            handleSave={handleSave}
            saving={saving}
            hasChanges={hasChanges}
          />
        )}
      />

      <div className="p-6">
        <SchoolPagesTabs
          activeTab={activeTab}
          navigate={navigate}
          data={data}
          updateField={updateField}
          updateTopLevel={updateTopLevel}
        />
      </div>
    </AdminPageLayout>
  );
}

export default SchoolPagesManager;
