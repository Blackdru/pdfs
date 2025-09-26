const { supabase, supabaseAdmin } = require('../config/supabase');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Ensure user profile exists in database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // User profile doesn't exist, create it
      const { error: createError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0],
            role: 'user'
          }
        ]);

      if (createError) {
        console.error('Error creating user profile in middleware:', createError);
        return res.status(500).json({ error: 'Failed to create user profile' });
      }
    } else if (profileError) {
      console.error('Error checking user profile in middleware:', profileError);
      return res.status(500).json({ error: 'Database error' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin role in the database
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error checking admin role:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

module.exports = {
  authenticateUser,
  requireAdmin
};