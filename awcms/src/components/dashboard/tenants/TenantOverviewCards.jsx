import { Building, RefreshCw, DollarSign, Globe } from 'lucide-react';

function TenantOverviewCards({ filteredTenants, activeTenantCount, expiringSoonCount }) {
	const planMix = [...new Set(filteredTenants.map((tenant) => tenant.subscription_tier).filter(Boolean))].join(', ') || 'No plans';

	return (
		<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Visible Tenants</p>
						<p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{filteredTenants.length}</p>
						<p className="text-xs text-muted-foreground">Current search and filters</p>
					</div>
					<span className="rounded-xl border border-border/70 bg-background/70 p-2 text-primary">
						<Building className="h-4 w-4" />
					</span>
				</div>
			</div>

			<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active</p>
						<p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{activeTenantCount}</p>
						<p className="text-xs text-muted-foreground">Healthy tenant workspaces</p>
					</div>
					<span className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
						<RefreshCw className="h-4 w-4" />
					</span>
				</div>
			</div>

			<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Expiring Soon</p>
						<p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{expiringSoonCount}</p>
						<p className="text-xs text-muted-foreground">Within the next 30 days</p>
					</div>
					<span className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300">
						<DollarSign className="h-4 w-4" />
					</span>
				</div>
			</div>

			<div className="rounded-2xl border border-border/60 bg-card/65 p-4 shadow-sm backdrop-blur-sm">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Plan Mix</p>
						<p className="mt-1 text-sm font-semibold text-foreground">{planMix}</p>
						<p className="text-xs text-muted-foreground">Subscription tiers in view</p>
					</div>
					<span className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-primary">
						<Globe className="h-4 w-4" />
					</span>
				</div>
			</div>
		</div>
	);
}

export default TenantOverviewCards;
