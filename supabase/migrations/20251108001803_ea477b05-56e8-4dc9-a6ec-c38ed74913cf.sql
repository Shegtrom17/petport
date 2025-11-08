-- Clean up unused og-images storage bucket
-- First delete all objects in the bucket, then delete the bucket itself
-- All OG images are now stored in Cloudflare R2, so this bucket is no longer needed

DELETE FROM storage.objects WHERE bucket_id = 'og-images';
DELETE FROM storage.buckets WHERE id = 'og-images';