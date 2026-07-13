
REVOKE EXECUTE ON FUNCTION public.trg_profile_completion() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_issue_certificate() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_bump_thread() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_notify_application_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_notify_new_message() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_notify_certificate() FROM anon, authenticated;
