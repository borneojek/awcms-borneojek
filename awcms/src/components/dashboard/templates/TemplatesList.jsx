import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Plus, Edit, Trash2, Copy, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePermissions } from '@/contexts/PermissionContext';
import { useTemplates } from '@/hooks/useTemplates';
import { encodeRouteParam } from '@/lib/routeSecurity';

const TemplatesList = () => {
	const navigate = useNavigate();
	const { templates, loading, createTemplate, deleteTemplate, duplicateTemplate } = useTemplates();
	const [searchTerm, setSearchTerm] = useState('');
	const [templateToDelete, setTemplateToDelete] = useState(null);
	const { hasPermission } = usePermissions();

	const handleCreate = async () => {
		const fallbackId = crypto.randomUUID();
		const defaultTemplate = {
			id: fallbackId,
			name: 'New Template',
			slug: `template-${Date.now()}`,
			description: 'A new blank template.',
			is_active: true,
			type: 'page',
			parts: {},
			data: {
				content: [],
				root: { props: { title: 'New Template' } }
			}
		};

		try {
			const newTemplateData = await createTemplate(defaultTemplate);
			const targetId = newTemplateData?.id || fallbackId;
			const routeId = await encodeRouteParam({ value: targetId, scope: 'visual-editor.template' });
			if (!routeId) {
				return;
			}
			navigate(`/cmspanel/visual-editor/template/${routeId}`);
		} catch (error) {
			console.error('Failed to create template', error);
		}
	};

	const handleOpenEditor = async (templateId) => {
		const routeId = await encodeRouteParam({ value: templateId, scope: 'visual-editor.template' });
		if (!routeId) {
			return;
		}
		navigate(`/cmspanel/visual-editor/template/${routeId}`);
	};

	const filteredTemplates = templates.filter((template) =>
		template.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
	const activeCount = filteredTemplates.filter((template) => template.is_active).length;

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="relative w-full max-w-md">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search templates..."
							className="h-10 rounded-xl border-border/70 bg-background pl-9"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
						<span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1.5 font-medium">
							{filteredTemplates.length} visible
						</span>
						<span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 font-medium text-primary">
							{activeCount} active
						</span>
						{hasPermission('tenant.setting.update') && (
							<Button onClick={handleCreate} className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-sm hover:opacity-95">
								<Plus className="mr-2 h-4 w-4" /> New Template
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{loading ? (
					[...Array(4)].map((_, index) => (
						<div key={index} className="h-48 animate-pulse rounded-2xl border border-border/60 bg-card/60" />
					))
				) : filteredTemplates.length === 0 ? (
					<div className="col-span-full rounded-2xl border border-dashed border-border/70 bg-card/55 py-20 text-center text-muted-foreground">
						<LayoutTemplate className="mx-auto mb-4 h-12 w-12 opacity-40" />
						<p>No templates found.</p>
					</div>
				) : (
					filteredTemplates.map((template) => (
						<div key={template.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/75 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
							<div className="relative flex h-32 items-center justify-center border-b border-border/60 bg-muted/30">
								{template.thumbnail ? (
									<img src={template.thumbnail} alt={template.name} className="h-full w-full object-cover" />
								) : (
									<LayoutTemplate className="h-10 w-10 text-muted-foreground/60" />
								)}
								<div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
									<Button
										size="icon"
										variant="secondary"
										className="h-8 w-8 rounded-full border border-border/70 bg-background/80 shadow-sm"
										onClick={() => handleOpenEditor(template.id)}
									>
										<Edit className="h-4 w-4 text-foreground" />
									</Button>
								</div>
							</div>

							<div className="flex flex-1 flex-col p-4">
								<div className="mb-2 flex items-start justify-between">
									<div>
										<h3 className="truncate pr-2 font-semibold text-foreground" title={template.name}>{template.name}</h3>
										<div className="mt-1 flex items-center gap-2">
											<span className="rounded border border-border/60 bg-muted px-1.5 py-0.5 text-xs capitalize text-muted-foreground">
												{template.type || 'page'}
											</span>
											{template.is_active && (
												<span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
													Active
												</span>
											)}
										</div>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => duplicateTemplate(template)}>
												<Copy className="mr-2 h-4 w-4" /> Duplicate
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => setTemplateToDelete(template.id)}
												className="text-destructive focus:bg-destructive/10 focus:text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" /> Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			<AlertDialog open={Boolean(templateToDelete)} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Template?</AlertDialogTitle>
						<AlertDialogDescription>
							This will move the template to trash.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => { deleteTemplate(templateToDelete); setTemplateToDelete(null); }} className="bg-destructive text-destructive-foreground hover:opacity-95">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default TemplatesList;
