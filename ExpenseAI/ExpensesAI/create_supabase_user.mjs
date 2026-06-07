import { createClient } from '@supabase/supabase-js';
const url = 'https://your-project-ref.supabase.co';
const key = 'your-service-role-key';
const supabase = createClient(url, key);
const email = 'user@example.com';
const password = 'YourSecurePassword123!';
console.log('Creating user', email);
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { createdBy: 'script' }
});
console.log(JSON.stringify({ data, error }, null, 2));
