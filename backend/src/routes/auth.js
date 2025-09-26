const express = require('express');
const { supabase } = require('../config/supabase');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Register new user
router.post('/register', validateRequest(schemas.register), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in database
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: authData.user.id,
            email: authData.user.email,
            name,
            role: 'user'
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway, as the auth user was created successfully
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        name
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get user profile from database
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', data.user.id)
      .single();

    // If user profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      const { error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split('@')[0],
            role: 'user'
          }
        ]);

      if (createError) {
        console.error('Profile creation error during login:', createError);
      } else {
        profile = {
          name: data.user.user_metadata?.name || data.user.email.split('@')[0],
          role: 'user'
        };
      }
    }

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.email.split('@')[0],
        role: profile?.role || 'user'
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Token refreshed successfully',
      session: data.session
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Google OAuth (initiate)
router.get('/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${req.protocol}://${req.get('host')}/api/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.redirect(data.url);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'OAuth initialization failed' });
  }
});

// OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create or update user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email.split('@')[0],
            role: 'user'
          }
        ]);

      if (profileError) {
        console.error('Profile upsert error:', profileError);
      }
    }

    // Redirect to frontend with session data
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? 'https://your-domain.com/auth/callback'
      : 'http://localhost:3000/auth/callback';

    res.redirect(`${redirectUrl}?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// Endpoint to ensure user profile exists (for existing auth users)
router.post('/ensure-profile', async (req, res) => {
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

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // User profile doesn't exist, create it
      const { error: createError } = await supabase
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
        console.error('Error creating user profile:', createError);
        return res.status(500).json({ error: 'Failed to create user profile' });
      }

      return res.json({ 
        message: 'User profile created successfully',
        created: true
      });
    } else if (profileError) {
      console.error('Error checking user profile:', profileError);
      return res.status(500).json({ error: 'Failed to check user profile' });
    }

    res.json({ 
      message: 'User profile already exists',
      created: false
    });
  } catch (error) {
    console.error('Ensure profile error:', error);
    res.status(500).json({ error: 'Failed to ensure user profile' });
  }
});

module.exports = router;