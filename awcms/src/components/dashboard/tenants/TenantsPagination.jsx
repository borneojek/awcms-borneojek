import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function TenantsPagination({
	totalPages,
	currentPage,
	startIndex,
	endIndex,
	totalItems,
	setCurrentPage,
}) {
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
			<div className="text-sm text-muted-foreground">
				Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} tenants
			</div>
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
					disabled={currentPage === 1}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>

				{Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
					let pageNumber;
					if (totalPages <= 5) {
						pageNumber = index + 1;
					} else if (currentPage <= 3) {
						pageNumber = index + 1;
					} else if (currentPage >= totalPages - 2) {
						pageNumber = totalPages - 4 + index;
					} else {
						pageNumber = currentPage - 2 + index;
					}

					return (
						<Button
							key={pageNumber}
							variant={currentPage === pageNumber ? 'default' : 'outline'}
							size="sm"
							onClick={() => setCurrentPage(pageNumber)}
							className="h-8 w-8 p-0"
						>
							{pageNumber}
						</Button>
					);
				})}

				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
					disabled={currentPage === totalPages}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}

export default TenantsPagination;
