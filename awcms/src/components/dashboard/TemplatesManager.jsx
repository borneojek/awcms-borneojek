import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageLayout, PageHeader, PageTabs, TabsContent } from '@/templates/flowbite-admin';
import TemplatesList from './templates/TemplatesList';
import TemplatePartsList from './templates/TemplatePartsList';
import TemplateAssignments from './templates/TemplateAssignments';
import TemplateLanguageManager from './templates/TemplateLanguageManager';
import { Layout, Puzzle, Link2, Languages } from 'lucide-react';
import useSplatSegments from '@/hooks/useSplatSegments';

/**
 * TemplatesManager - Manages admin templates and configurations.
 * RESTRICTED: Only accessible to platform admin or full-access roles.
 * Refactored to use awadmintemplate01 with ABAC enforcement.
 */
const TemplatesManager = () => {
    const navigate = useNavigate();
    const segments = useSplatSegments();
    const tabValues = ['pages', 'parts', 'assignments', 'languages'];
    const hasTabSegment = tabValues.includes(segments[0]);
    const activeTab = hasTabSegment ? segments[0] : 'pages';

    // Tab definitions
    const tabs = [
        { value: 'pages', label: 'Page Templates', icon: Layout, color: 'blue' },
        { value: 'parts', label: 'Template Parts', icon: Puzzle, color: 'purple' },
        { value: 'assignments', label: 'Assignments', icon: Link2, color: 'emerald' },
        { value: 'languages', label: 'Languages', icon: Languages, color: 'amber' },
    ];

    useEffect(() => {
        if (segments.length > 0 && !hasTabSegment) {
            navigate('/cmspanel/templates', { replace: true });
        }
    }, [segments, hasTabSegment, navigate]);

    // Breadcrumb
    const breadcrumbs = [
        { label: 'Templates', icon: Layout },
    ];

    return (
        <AdminPageLayout
            requiredPermission="platform.template.manage"
            showTenantBadge={false}
        >
            {/* Page Header */}
            <PageHeader
                title="Templates"
                description="Manage page templates, parts, and language assignments"
                icon={Layout}
                breadcrumbs={breadcrumbs}
            />

            {/* Tabs Navigation */}
            <PageTabs
                value={activeTab}
                onValueChange={(value) => {
                    navigate(value === 'pages' ? '/cmspanel/templates' : `/cmspanel/templates/${value}`);
                }}
                tabs={tabs}
            >
                <TabsContent value="pages" className="mt-0">
                    <TemplatesList />
                </TabsContent>

                <TabsContent value="parts" className="mt-0">
                    <TemplatePartsList />
                </TabsContent>

                <TabsContent value="assignments" className="mt-0">
                    <TemplateAssignments />
                </TabsContent>

                <TabsContent value="languages" className="mt-0">
                    <TemplateLanguageManager />
                </TabsContent>
            </PageTabs>
        </AdminPageLayout>
    );
};

export default TemplatesManager;
