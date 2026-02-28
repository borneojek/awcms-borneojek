-- Seed admin menus
INSERT INTO public.admin_menus (key, label, path, icon, permission, group_label, group_order, "order", is_visible, updated_at) VALUES
-- CONTENT Group
('home', 'Dashboard', 'home', 'LayoutDashboard', NULL, 'CONTENT', 10, 10, true, NOW()),
('blogs', 'Blogs', 'blogs', 'FileText', 'tenant.blog.read', 'CONTENT', 10, 20, true, NOW()),
('pages', 'Pages', 'pages', 'FileEdit', 'tenant.page.read', 'CONTENT', 10, 30, true, NOW()),
('visual_builder', 'Visual Builder', 'visual-pages', 'Layout', 'tenant.visual_pages.read', 'CONTENT', 10, 35, true, NOW()),
('themes', 'Themes', 'themes', 'Palette', 'tenant.theme.read', 'CONTENT', 10, 40, true, NOW()),
('widgets', 'Widgets', 'widgets', 'Layers', 'tenant.widgets.read', 'CONTENT', 10, 45, true, NOW()),
('portfolio', 'Portfolio', 'portfolio', 'Briefcase', 'tenant.portfolio.read', 'CONTENT', 10, 50, true, NOW()),
('testimonials', 'Testimonials', 'testimonies', 'MessageSquareQuote', 'tenant.testimonies.read', 'CONTENT', 10, 60, true, NOW()),
('announcements', 'Announcements', 'announcements', 'Megaphone', 'tenant.announcements.read', 'CONTENT', 10, 70, true, NOW()),
('promotions', 'Promotions', 'promotions', 'Tag', 'tenant.promotions.read', 'CONTENT', 10, 80, true, NOW()),
('contact_messages', 'Contact Messages', 'messages', 'Inbox', 'tenant.contact_messages.read', 'CONTENT', 10, 90, true, NOW()),
('contacts', 'Contacts CRM', 'contacts', 'Contact', 'tenant.contacts.read', 'CONTENT', 10, 95, true, NOW()),
-- MEDIA Group
('files', 'Media Library', 'files', 'FolderOpen', 'tenant.files.read', 'MEDIA', 20, 10, true, NOW()),
('photo_gallery', 'Photo Gallery', 'photo-gallery', 'Image', 'tenant.photo_gallery.read', 'MEDIA', 20, 20, true, NOW()),
('video_gallery', 'Video Gallery', 'video-gallery', 'Video', 'tenant.video_gallery.read', 'MEDIA', 20, 30, true, NOW()),
-- COMMERCE Group
('products', 'Products', 'products', 'Package', 'tenant.products.read', 'COMMERCE', 30, 10, true, NOW()),
('product_types', 'Product Types', 'product-types', 'Box', 'tenant.product_types.read', 'COMMERCE', 30, 20, true, NOW()),
('orders', 'Orders', 'orders', 'ShoppingCart', 'tenant.orders.read', 'COMMERCE', 30, 30, true, NOW()),
-- NAVIGATION Group
('menus', 'Menu Manager', 'menus', 'Menu', 'tenant.menu.read', 'NAVIGATION', 40, 10, true, NOW()),
('categories', 'Categories', 'categories', 'FolderTree', 'tenant.categories.read', 'NAVIGATION', 40, 20, true, NOW()),
('tags', 'Tags', 'tags', 'Hash', 'tenant.tag.read', 'NAVIGATION', 40, 30, true, NOW()),
-- USERS Group
('users', 'Users', 'users', 'Users', 'tenant.user.read', 'USERS', 50, 10, true, NOW()),
('roles', 'Roles & Permissions', 'roles', 'Shield', 'tenant.role.read', 'USERS', 50, 20, true, NOW()),
('policies', 'Policies', 'policies', 'ShieldCheck', 'tenant.policy.read', 'USERS', 50, 30, true, NOW()),
-- SYSTEM Group
('seo_manager', 'SEO Manager', 'seo', 'Search', 'tenant.seo.read', 'SYSTEM', 60, 10, true, NOW()),
('languages', 'Languages', 'languages', 'Languages', 'tenant.languages.read', 'SYSTEM', 60, 20, true, NOW()),
('extensions', 'Extensions', 'extensions', 'Puzzle', 'platform.extensions.read', 'SYSTEM', 60, 30, true, NOW()),
('modules', 'Modules', 'modules', 'Box', 'tenant.modules.read', 'SYSTEM', 60, 35, true, NOW()),
('sidebar_manager', 'Sidebar Manager', 'admin-navigation', 'List', 'platform.sidebar.read', 'SYSTEM', 60, 40, true, NOW()),
('notifications', 'Notifications', 'notifications', 'MessageSquareQuote', 'tenant.notification.read', 'SYSTEM', 60, 50, true, NOW()),
('visitor_stats', 'Visitor Statistics', 'visitor-stats', 'LineChart', 'tenant.analytics.read', 'SYSTEM', 60, 65, true, NOW())
ON CONFLICT (key) DO UPDATE SET
    label = EXCLUDED.label,
    path = EXCLUDED.path,
    icon = EXCLUDED.icon,
    permission = EXCLUDED.permission,
    group_label = EXCLUDED.group_label,
    group_order = EXCLUDED.group_order,
    "order" = EXCLUDED."order",
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();
