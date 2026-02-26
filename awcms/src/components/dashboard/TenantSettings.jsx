import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/customSupabaseClient';
import { useTenant } from '@/contexts/TenantContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Loader2, Save, Building2, Palette, Type } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageLayout, PageHeader } from '@/templates/flowbite-admin';

export default function TenantSettings() {
	const { t } = useTranslation();
	const { currentTenant: tenant, loading: tenantLoading } = useTenant();
	const { checkAccess } = usePermissions();
	const { toast } = useToast();
	const [saving, setSaving] = useState(false);
	const colorPickerId = useId();

	const canManageSettings = checkAccess('update', 'setting');

	const form = useForm({
		defaultValues: {
			brandColor: '#000000',
			fontFamily: 'Inter',
			logoUrl: '',
			siteName: ''
		}
	});

	useEffect(() => {
		if (!tenant) {
			return;
		}

		form.reset({
			brandColor: tenant.config?.theme?.brandColor || '#000000',
			fontFamily: tenant.config?.theme?.fontFamily || 'Inter',
			logoUrl: tenant.config?.theme?.logoUrl || '',
			siteName: tenant.config?.settings?.siteName || tenant.name || ''
		});
	}, [tenant, form]);

	const onSubmit = async (values) => {
		setSaving(true);

		try {
			const newConfig = {
				...tenant.config,
				theme: {
					brandColor: values.brandColor,
					fontFamily: values.fontFamily,
					logoUrl: values.logoUrl
				},
				settings: {
					...tenant.config?.settings,
					siteName: values.siteName
				}
			};

			const { error } = await supabase
				.from('tenants')
				.update({
					config: newConfig,
					updated_at: new Date().toISOString()
				})
				.eq('id', tenant.id);

			if (error) {
				throw error;
			}

			toast({
				title: t('tenant_settings.toasts.saved_title'),
				description: t('tenant_settings.toasts.saved_desc')
			});
		} catch (err) {
			console.error('Error saving settings:', err);
			toast({
				variant: 'destructive',
				title: t('tenant_settings.toasts.error_title'),
				description: err.message
			});
		} finally {
			setSaving(false);
		}
	};

	const watchedSiteName = form.watch('siteName');
	const watchedBrandColor = form.watch('brandColor');
	const watchedFontFamily = form.watch('fontFamily');

	if (tenantLoading) {
		return (
			<AdminPageLayout>
				<div className="grid min-h-[360px] place-items-center rounded-2xl border border-border/60 bg-card/60 p-8">
					<div className="text-center text-muted-foreground">
						<Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />
						<p className="text-sm font-medium">Loading tenant settings...</p>
					</div>
				</div>
			</AdminPageLayout>
		);
	}

	if (!tenant) {
		return (
			<AdminPageLayout>
				<div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6 text-center">
					<h2 className="text-xl font-semibold text-destructive">{t('tenant_settings.errors.tenant_not_found')}</h2>
					<p className="mt-2 text-sm text-muted-foreground">{t('tenant_settings.errors.tenant_load_error')}</p>
				</div>
			</AdminPageLayout>
		);
	}

	if (!canManageSettings) {
		return (
			<AdminPageLayout>
				<div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6 text-center">
					<h2 className="text-xl font-semibold text-destructive">{t('tenant_settings.errors.access_denied')}</h2>
					<p className="mt-2 text-sm text-muted-foreground">{t('tenant_settings.errors.access_denied_desc')}</p>
				</div>
			</AdminPageLayout>
		);
	}

	return (
		<AdminPageLayout>
			<PageHeader
				title={t('tenant_settings.title')}
				description={t('tenant_settings.description')}
				icon={Palette}
				breadcrumbs={[
					{ label: 'Settings' },
					{ label: 'Branding' }
				]}
			/>

			<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tenant</p>
							<p className="mt-1 text-sm font-semibold text-foreground">{tenant.name}</p>
							<p className="text-xs text-muted-foreground">Slug: {tenant.slug}</p>
						</div>
						<span className="rounded-xl border border-border/70 bg-background/70 p-2 text-primary">
							<Building2 className="h-4 w-4" />
						</span>
					</div>
				</div>

				<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Site Name</p>
							<p className="mt-1 truncate text-sm font-semibold text-foreground">{watchedSiteName || '-'}</p>
							<p className="text-xs text-muted-foreground">Public branding label</p>
						</div>
						<span className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-primary">
							<Palette className="h-4 w-4" />
						</span>
					</div>
				</div>

				<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Brand Color</p>
							<p className="mt-1 text-sm font-semibold text-foreground">{watchedBrandColor || '#000000'}</p>
							<p className="text-xs text-muted-foreground">Theme accent value</p>
						</div>
						<span
							className="h-8 w-8 rounded-xl border border-border/70"
							style={{ backgroundColor: watchedBrandColor || '#000000' }}
						/>
					</div>
				</div>

				<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Font Family</p>
							<p className="mt-1 text-sm font-semibold text-foreground">{watchedFontFamily || 'Inter'}</p>
							<p className="text-xs text-muted-foreground">Applied typography base</p>
						</div>
						<span className="rounded-xl border border-border/70 bg-background/70 p-2 text-primary">
							<Type className="h-4 w-4" />
						</span>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Card className="overflow-hidden border-border/60 bg-card/70 shadow-sm">
						<CardHeader className="border-b border-border/60 bg-muted/30">
							<CardTitle className="text-lg text-foreground">{t('tenant_settings.branding.title')}</CardTitle>
							<CardDescription>{t('tenant_settings.branding.description')}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 pt-6">
							<FormField
								control={form.control}
								name="siteName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('tenant_settings.branding.site_name')}</FormLabel>
										<FormControl>
											<Input
												placeholder={t('tenant_settings.branding.site_name_placeholder')}
												className="h-11 rounded-xl border-border/70 bg-background"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="brandColor"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('tenant_settings.branding.brand_color')}</FormLabel>
											<div className="flex items-center gap-3">
												<div className="relative">
													<button
														type="button"
														className="h-12 w-12 rounded-xl border border-border/70 shadow-sm transition-transform hover:scale-105"
														style={{ backgroundColor: field.value }}
														onClick={() => document.getElementById(colorPickerId)?.click()}
													/>
													<input
														id={colorPickerId}
														type="color"
														className="invisible absolute left-0 top-0 h-full w-full"
														value={field.value}
														onChange={(event) => field.onChange(event.target.value)}
													/>
												</div>
												<div className="flex-1">
													<FormControl>
														<Input
															placeholder={t('tenant_settings.branding.brand_color_desc')}
															{...field}
															className="h-11 rounded-xl border-border/70 bg-background font-mono uppercase"
														/>
													</FormControl>
													<FormDescription className="mt-1 text-xs">
														{t('tenant_settings.branding.brand_color_desc')}
													</FormDescription>
												</div>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="fontFamily"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('tenant_settings.branding.font_family')}</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger className="h-11 rounded-xl border-border/70 bg-background">
														<SelectValue placeholder={t('tenant_settings.branding.font_select_placeholder')} />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="Inter" style={{ fontFamily: 'Inter, sans-serif' }}>Inter (Default)</SelectItem>
													<SelectItem value="Roboto" style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto</SelectItem>
													<SelectItem value="Open Sans" style={{ fontFamily: '"Open Sans", sans-serif' }}>Open Sans</SelectItem>
													<SelectItem value="Lato" style={{ fontFamily: 'Lato, sans-serif' }}>Lato</SelectItem>
													<SelectItem value="Montserrat" style={{ fontFamily: 'Montserrat, sans-serif' }}>Montserrat</SelectItem>
													<SelectItem value="Poppins" style={{ fontFamily: 'Poppins, sans-serif' }}>Poppins</SelectItem>
													<SelectItem value="Playfair Display" style={{ fontFamily: '"Playfair Display", serif' }}>Playfair Display</SelectItem>
													<SelectItem value="Merriweather" style={{ fontFamily: 'Merriweather, serif' }}>Merriweather</SelectItem>
													<SelectItem value="system-ui" style={{ fontFamily: 'system-ui, sans-serif' }}>System Default</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>
												{t('tenant_settings.branding.font_family_desc')}
												<span
													className="mt-2 block rounded-xl border border-border/70 bg-muted/30 p-2 text-lg text-foreground"
													style={{ fontFamily: field.value === 'system-ui' ? 'system-ui' : `${field.value}, sans-serif` }}
												>
													{t('tenant_settings.branding.font_preview')}
												</span>
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="logoUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('tenant_settings.branding.logo')}</FormLabel>
										<FormControl>
											<ImageUpload
												value={field.value}
												onChange={field.onChange}
												className="w-full"
											/>
										</FormControl>
										<FormDescription>{t('tenant_settings.branding.logo_desc')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" disabled={saving} className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-sm hover:opacity-95">
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
							{saving ? t('tenant_settings.buttons.saving') : t('tenant_settings.buttons.save_changes')}
						</Button>
					</div>
				</form>
			</Form>
		</AdminPageLayout>
	);
}
