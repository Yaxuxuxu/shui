import { createClient } from '@supabase/supabase-js'

// Supabase配置
const SUPABASE_URL = 'https://nrxyvmtquklfqlrleppb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HJ8ezlQjk0H7FPakSMPu1A_cfFW2KFX'

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 导出Supabase配置和客户端
export { SUPABASE_URL, SUPABASE_KEY, supabase }