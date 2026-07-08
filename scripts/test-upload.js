const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const fs = require('fs');

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Create a 1x1 transparent png
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
  
  const { data, error } = await supabase.storage
    .from('katedral-media')
    .upload('test/test.png', buffer, { contentType: 'image/png', upsert: true });
    
  if (error) {
    console.error('Upload Error:', error);
    return;
  }
  
  const { data: urlData } = supabase.storage.from('katedral-media').getPublicUrl('test/test.png');
  console.log('Public URL:', urlData.publicUrl);
  
  // Try fetching the URL
  const res = await fetch(urlData.publicUrl);
  console.log('Fetch status:', res.status, res.statusText);
}

test();
