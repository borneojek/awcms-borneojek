import MinCharSearchInput from '@/components/common/MinCharSearchInput';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

function TenantsListToolbar({
	query,
	setQuery,
	clearSearch,
	loading,
	searchLoading,
	isSearchValid,
	searchMessage,
	minLength,
	itemsPerPage,
	onItemsPerPageChange,
}) {
	return (
		<div className="flex flex-col items-start justify-between gap-4 border-b border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
			<div className="flex-1 max-w-sm">
				<MinCharSearchInput
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					onClear={clearSearch}
					loading={loading || searchLoading}
					isValid={isSearchValid}
					message={searchMessage}
					minLength={minLength}
					placeholder="Search tenants"
				/>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Show:</span>
				<Select value={String(itemsPerPage)} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
					<SelectTrigger className="h-8 w-[70px] border-input bg-background">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="5">5</SelectItem>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="25">25</SelectItem>
						<SelectItem value="50">50</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

export default TenantsListToolbar;
