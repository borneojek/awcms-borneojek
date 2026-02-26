import GenericContentManager from '@/components/dashboard/GenericContentManager';
import { PageTabs, TabsContent } from '@/templates/flowbite-admin';

function BlogsContentPanels({
	activeTab,
	tabs,
	navigate,
	t,
	blogColumns,
	blogFormFields,
	blogFilters,
	BlogEditorComponent,
	customRowActions,
	customToolbarActions,
	categoryColumns,
	categoryFormFields,
	tagColumns,
	tagFormFields,
}) {
	return (
		<PageTabs
			value={activeTab}
			onValueChange={(value) => {
				navigate(value === 'blogs' ? '/cmspanel/blogs' : `/cmspanel/blogs/${value}`);
			}}
			tabs={tabs}
		>
			<TabsContent value="blogs" className="mt-0">
				<GenericContentManager
					tableName="blogs"
					resourceName={t('blogs.type')}
					columns={blogColumns}
					formFields={blogFormFields}
					permissionPrefix="blog"
					showBreadcrumbs={false}
					defaultFilters={blogFilters}
					EditorComponent={BlogEditorComponent}
					customRowActions={customRowActions}
					customToolbarActions={customToolbarActions}
				/>
			</TabsContent>

			<TabsContent value="categories" className="mt-0">
				<GenericContentManager
					tableName="categories"
					resourceName={t('common.category')}
					columns={categoryColumns}
					formFields={categoryFormFields}
					permissionPrefix="categories"
					showBreadcrumbs={false}
					customSelect="*, owner:users!created_by(email, full_name), tenant:tenants(name)"
					defaultFilters={{ type: 'blog' }}
				/>
			</TabsContent>

			<TabsContent value="tags" className="mt-0">
				<GenericContentManager
					tableName="tags"
					resourceName="Tag"
					columns={tagColumns}
					formFields={tagFormFields}
					permissionPrefix="tags"
					showBreadcrumbs={false}
				/>
			</TabsContent>
		</PageTabs>
	);
}

export default BlogsContentPanels;
