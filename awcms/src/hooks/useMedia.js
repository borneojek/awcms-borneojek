/**
 * Custom hook for media library operations
 * Provides upload, sync, and stats functionality for the FilesManager
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { usePermissions } from '@/contexts/PermissionContext';

// Configure Edge URL
const EDGE_URL = import.meta.env.VITE_EDGE_URL || 'http://localhost:8787';

export function useMedia() {
    const { toast } = useToast();
    const { currentTenant } = useTenant();
    const tenantId = currentTenant?.id;
    const { isPlatformAdmin } = usePermissions();

    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Stats state
    const [stats, setStats] = useState({
        total_files: 0,
        total_size: 0,
        image_count: 0,
        doc_count: 0,
        video_count: 0,
        other_count: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Helper: Map old 'files' format to 'media_objects' where needed for components
    const formatMediaObject = (mo) => {
        if (!mo) return null;
        return {
            ...mo,
            // Map to old property names just in case some components rely on them
            id: mo.id,
            name: mo.original_name || mo.file_name,
            file_name: mo.original_name || mo.file_name,
            file_path: mo.storage_key,
            file_size: mo.size_bytes,
            file_type: mo.mime_type,
            uploaded_by: mo.uploader_id,
            created_at: mo.created_at,
            deleted_at: mo.deleted_at
        };
    };

    // Fetch Files (Search/List)
    const fetchFiles = useCallback(async ({
        page = 1,
        limit = 12,
        query = '',
        isTrash = false,
        typeFilter = null,
        categoryId = null
    } = {}) => {
        if (!tenantId && !isPlatformAdmin) return { data: [], count: 0 };

        setLoading(true);
        try {
            let dbQuery = supabase
                .from('media_objects')
                .select('*, users:uploader_id(email, full_name), tenant:tenants(name)', { count: 'exact' })
                .order('created_at', { ascending: false });

            // Platform admins see all files, others are tenant-scoped
            if (!isPlatformAdmin && tenantId) {
                dbQuery = dbQuery.eq('tenant_id', tenantId);
            }

            // Trash View Logic
            if (isTrash) {
                dbQuery = dbQuery.not('deleted_at', 'is', null);
            } else {
                dbQuery = dbQuery.is('deleted_at', null);
            }

            // Search Logic
            if (query) {
                dbQuery = dbQuery.ilike('original_name', `%${query}%`);
            }

            // Type Filter
            if (typeFilter) {
                dbQuery = dbQuery.ilike('mime_type', `${typeFilter}%`);
            }

            // Pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            dbQuery = dbQuery.range(from, to);

            const { data, count, error } = await dbQuery;
            if (error) throw error;

            return { data: (data || []).map(formatMediaObject), count: count || 0 };
        } catch (err) {
            console.error('Error fetching files:', err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load files.' });
            return { data: [], count: 0 };
        } finally {
            setLoading(false);
        }
    }, [tenantId, isPlatformAdmin, toast]);

    // Soft Delete File
    const softDeleteFile = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('media_objects')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            toast({ title: 'File Moved to Trash', description: 'File moved to trash bin.' });
            return true;
        } catch (err) {
            console.error('Delete failed:', err);
            toast({ variant: 'destructive', title: 'Delete Failed', description: err.message });
            return false;
        }
    }, [toast]);

    // Bulk Soft Delete
    const bulkSoftDelete = useCallback(async (ids) => {
        if (!ids || ids.length === 0) return { success: 0, error: 0 };
        try {
            const { error } = await supabase
                .from('media_objects')
                .update({ deleted_at: new Date().toISOString() })
                .in('id', ids)
                .select('id', { count: 'exact' });

            if (error) throw error;

            toast({ title: 'Files Moved to Trash', description: `${ids.length} files moved to trash bin.` });
            return { success: ids.length, error: 0 };
        } catch (err) {
            console.error('Bulk delete failed:', err);
            toast({ variant: 'destructive', title: 'Bulk Delete Failed', description: err.message });
            return { success: 0, error: ids.length };
        }
    }, [toast]);

    // Restore File
    const restoreFile = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('media_objects')
                .update({ deleted_at: null })
                .eq('id', id);

            if (error) throw error;

            toast({ title: 'File Restored', description: 'File restored to library.' });
            return true;
        } catch (err) {
            console.error('Restore failed:', err);
            toast({ variant: 'destructive', title: 'Restore Failed', description: err.message });
            return false;
        }
    }, [toast]);

    // Fetch Categories
    const fetchCategories = useCallback(async () => {
        if (!tenantId && !isPlatformAdmin) return [];

        try {
            let query = supabase
                .from('categories')
                .select('*')
                .eq('type', 'media')
                .order('name');

            if (!isPlatformAdmin && tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error fetching categories:', err);
            return [];
        }
    }, [tenantId, isPlatformAdmin]);

    // Create Category
    const createCategory = useCallback(async (name) => {
        if (!name) return null;
        try {
            const { data: userData } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    name,
                    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    type: 'media',
                    tenant_id: tenantId,
                    created_by: userData.user?.id
                })
                .select()
                .single();

            if (error) throw error;

            toast({ title: 'Category Created', description: `Category "${name}" created.` });
            return data;
        } catch (err) {
            console.error('Error creating category:', err);
            toast({ variant: 'destructive', title: 'Error', description: err.message });
            return null;
        }
    }, [tenantId, toast]);

    // Helper: Get Public URL
    const getFileUrl = useCallback((file) => {
        if (!file) return '';
        // If it's already an absolute URL, return it
        const path = file.file_path || file.storage_key || (typeof file === 'string' ? file : '');
        if (path.startsWith('http')) return path;

        return `${EDGE_URL}/public/media/${path}`;
    }, []);

    // Fetch file stats
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const { data, error } = await supabase
                .from('media_objects')
                .select('size_bytes, mime_type')
                .is('deleted_at', null);

            if (error) throw error;

            const statsData = {
                total_files: data.length,
                total_size: data.reduce((acc, f) => acc + (f.size_bytes || 0), 0),
                image_count: data.filter(f => f.mime_type?.startsWith('image/')).length,
                doc_count: data.filter(f =>
                    f.mime_type?.includes('pdf') ||
                    f.mime_type?.includes('document') ||
                    f.mime_type?.includes('text')
                ).length,
                video_count: data.filter(f => f.mime_type?.startsWith('video/')).length,
                other_count: 0
            };
            statsData.other_count = statsData.total_files - statsData.image_count - statsData.doc_count - statsData.video_count;

            setStats(statsData);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Upload a single file via Edge API
    const uploadFile = useCallback(async (file, folder = '', categoryId = null) => {
        setUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            // 1. Request Upload Session
            const sessionRes = await fetch(`${EDGE_URL}/api/media/upload-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    tenantId: tenantId,
                    fileName: file.name,
                    mimeType: file.type,
                    sizeBytes: file.size,
                    accessControl: 'public',
                    folder: folder
                })
            });

            if (!sessionRes.ok) throw new Error("Failed to initialize upload session");
            const sessionData = await sessionRes.json();
            const { sessionId } = sessionData;

            // 2. Upload file directly to Edge endpoint
            const uploadRes = await fetch(`${EDGE_URL}/api/media/upload/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: file
            });

            if (!uploadRes.ok) throw new Error("File upload failed");
            const uploadResult = await uploadRes.json();
            
            // Note: Upload endpoint creates the media_objects record.
            
            // Refresh stats after upload
            await fetchStats();

            return { 
                success: true, 
                url: `${EDGE_URL}/public/media/${uploadResult.mediaObject.storage_key}`,
                mediaObject: uploadResult.mediaObject 
            };
        } catch (err) {
            console.error('Upload error:', err);
            throw err;
        } finally {
            setUploading(false);
        }
    }, [fetchStats, tenantId]);

    // Sync files from storage bucket to database
    const syncFiles = useCallback(async () => {
        setSyncing(true);
        try {
            // Disabled temporarily during cutover to Cloudflare architecture.
            // Edge Worker doesn't expose a sync API yet.
            toast({
                title: 'Sync Disabled',
                description: 'Syncing from external source is temporarily disabled on the new media system.'
            });
            return true;
        } catch (err) {
            console.error('Sync error:', err);
            return false;
        } finally {
            setSyncing(false);
        }
    }, [toast]);

    return {
        uploadFile,
        uploading,
        syncFiles,
        syncing,
        stats,
        statsLoading,
        refreshStats: fetchStats,
        fetchFiles,
        softDeleteFile,
        bulkSoftDelete,
        restoreFile,
        getFileUrl,
        loading,
        fetchCategories,
        createCategory
    };
}

export default useMedia;
