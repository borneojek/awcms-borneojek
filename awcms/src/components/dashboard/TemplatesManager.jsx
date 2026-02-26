import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageLayout, PageHeader, PageTabs, TabsContent } from '@/templates/flowbite-admin';
import TemplatesList from './templates/TemplatesList';
import TemplatePartsList from './templates/TemplatePartsList';
import TemplateAssignments from './templates/TemplateAssignments';
import TemplateLanguageManager from './templates/TemplateLanguageManager';
import { Layout, Puzzle, Link2, Languages, Sparkles, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useSplatSegments from '@/hooks/useSplatSegments';
import { cn } from '@/lib/utils';

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
    const hasExtraSegment = segments.length > 1;

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
            return;
        }

        if (hasTabSegment && hasExtraSegment) {
            const basePath = activeTab === 'pages' ? '/cmspanel/templates' : `/cmspanel/templates/${activeTab}`;
            navigate(basePath, { replace: true });
        }
    }, [segments, hasTabSegment, hasExtraSegment, activeTab, navigate]);

    // Breadcrumb
    const breadcrumbs = [
        { label: 'Templates', icon: Layout },
    ];

    const activeTabLabel = tabs.find((tab) => tab.value === activeTab)?.label || 'Page Templates';

    const headerActions = (
        <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
                <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? 'default' : 'outline'}
                    onClick={() => navigate(tab.value === 'pages' ? '/cmspanel/templates' : `/cmspanel/templates/${tab.value}`)}
                    className={cn(
                        'h-9 rounded-xl px-3 shadow-sm',
                        activeTab === tab.value
                            ? 'bg-primary text-primary-foreground hover:opacity-95'
                            : 'border-border/70 bg-background/80 text-muted-foreground hover:bg-accent/70 hover:text-foreground'
                    )}
                >
                    {tab.label}
                </Button>
            ))}
        </div>
    );

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
                actions={headerActions}
            />

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active Area</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{activeTabLabel}</p>
                            <p className="text-xs text-muted-foreground">Template management workspace</p>
                        </div>
                        <span className="rounded-xl border border-border/70 bg-background/70 p-2 text-primary">
                            <Blocks className="h-4 w-4" />
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sections</p>
                            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{tabs.length}</p>
                            <p className="text-xs text-muted-foreground">Pages, parts, assignments, i18n</p>
                        </div>
                        <span className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-primary">
                            <Sparkles className="h-4 w-4" />
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Scope</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">Platform</p>
                            <p className="text-xs text-muted-foreground">Global template governance</p>
                        </div>
                        <span className="rounded-xl border border-border/70 bg-background/70 p-2 text-primary">
                            <Layout className="h-4 w-4" />
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Localization</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">Multi-language</p>
                            <p className="text-xs text-muted-foreground">Template string support</p>
                        </div>
                        <span className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-primary">
                            <Languages className="h-4 w-4" />
                        </span>
                    </div>
                </div>
            </div>

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
