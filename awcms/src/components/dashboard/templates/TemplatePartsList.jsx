import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MoreVertical, Puzzle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/contexts/PermissionContext';
import { useTemplates } from '@/hooks/useTemplates';
import { encodeRouteParam } from '@/lib/routeSecurity';

const TemplatePartsList = () => {
	const navigate = useNavigate();
	const { templateParts, loading, createPart, deletePart } = useTemplates();
	const [searchTerm, setSearchTerm] = useState('');
	const [partToDelete, setPartToDelete] = useState(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newPartName, setNewPartName] = useState('');
	const [newPartType, setNewPartType] = useState('widget_area');
	const { hasPermission } = usePermissions();

	const handleCreate = async () => {
		if (!newPartName) {
			return;
		}

		try {
			const data = await createPart({
				name: newPartName,
				type: newPartType,
				is_active: true,
				content: { content: [], root: {} }
			});
			setIsCreateOpen(false);
			setNewPartName('');
			setNewPartType('widget_area');

			const routeId = await encodeRouteParam({ value: data.id, scope: 'visual-editor.part' });
			if (!routeId) {
				return;
			}
			navigate(`/cmspanel/visual-editor/part/${routeId}`);
		} catch (error) {
			console.error(error);
		}
	};

	const handleOpenEditor = async (partId) => {
		const routeId = await encodeRouteParam({ value: partId, scope: 'visual-editor.part' });
		if (!routeId) {
			return;
		}
		navigate(`/cmspanel/visual-editor/part/${routeId}`);
	};

	const filteredParts = templateParts.filter((part) =>
		part.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getIcon = (type) => {
		switch (type) {
			case 'header':
				return <div className="h-3 w-8 rounded-sm border border-primary/25 bg-primary/15" />;
			case 'footer':
				return <div className="mt-auto h-3 w-8 rounded-sm border border-border/80 bg-muted" />;
			case 'sidebar':
				return <div className="h-8 w-3 rounded-sm border border-primary/25 bg-primary/15" />;
			default:
				return <Puzzle className="h-5 w-5 text-muted-foreground" />;
		}
	};

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="relative w-full max-w-md">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search parts..."
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="h-10 rounded-xl border-border/70 bg-background pl-9"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
							{filteredParts.length} parts
						</span>
						{hasPermission('tenant.setting.update') && (
							<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
								<DialogTrigger asChild>
									<Button className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-sm hover:opacity-95">
										<Plus className="mr-2 h-4 w-4" /> New Part
									</Button>
								</DialogTrigger>
								<DialogContent className="border-border/60 bg-background/95">
									<DialogHeader>
										<DialogTitle>Create Template Part</DialogTitle>
										<DialogDescription>
											Create a reusable header, footer, sidebar, or widget area.
										</DialogDescription>
									</DialogHeader>
									<div className="grid gap-4 py-2">
										<div className="grid gap-2">
											<Label htmlFor="template-part-name">Name</Label>
											<Input
												id="template-part-name"
												value={newPartName}
												onChange={(event) => setNewPartName(event.target.value)}
												className="rounded-xl border-border/70"
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="template-part-type">Type</Label>
											<Select value={newPartType} onValueChange={setNewPartType}>
												<SelectTrigger id="template-part-type" className="rounded-xl border-border/70">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="header">Header</SelectItem>
													<SelectItem value="footer">Footer</SelectItem>
													<SelectItem value="sidebar">Sidebar</SelectItem>
													<SelectItem value="widget_area">Widget Area</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<DialogFooter>
										<Button onClick={handleCreate} disabled={!newPartName.trim()} className="rounded-xl bg-primary px-4 text-primary-foreground hover:opacity-95">
											Create
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{loading ? (
					<div className="col-span-full rounded-2xl border border-border/60 bg-card/65 py-10 text-center text-muted-foreground">Loading parts...</div>
				) : filteredParts.length === 0 ? (
					<div className="col-span-full rounded-2xl border border-dashed border-border/70 bg-card/55 py-20 text-center text-muted-foreground">
						No template parts found. Create one to get started.
					</div>
				) : (
					filteredParts.map((part) => (
						<div key={part.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/75 p-4 shadow-sm transition-all hover:border-border hover:shadow-md">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
									{getIcon(part.type)}
								</div>
								<div>
									<h4 className="font-medium text-foreground">{part.name}</h4>
									<span className="text-xs uppercase tracking-wider text-muted-foreground">{part.type}</span>
								</div>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleOpenEditor(part.id)}>
										<Edit className="mr-2 h-4 w-4" /> Edit Content
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setPartToDelete(part.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
										<Trash2 className="mr-2 h-4 w-4" /> Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					))
				)}
			</div>

			<AlertDialog open={Boolean(partToDelete)} onOpenChange={(open) => !open && setPartToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Part?</AlertDialogTitle>
						<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => { deletePart(partToDelete); setPartToDelete(null); }} className="bg-destructive text-destructive-foreground hover:opacity-95">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default TemplatePartsList;
