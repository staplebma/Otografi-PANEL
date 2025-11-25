console.log('Starting script...');
console.log('Requiring supabase-js...');
const { createClient } = require('@supabase/supabase-js');
console.log('Supabase-js required.');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.error('Supabase connection failed:', error.message);
        } else {
            console.log('Supabase connection successful!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
