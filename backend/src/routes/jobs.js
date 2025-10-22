const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      job_url,
      title,
      company,
      location,
      description,
      status = 'saved',
      resume_id,
      notes
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({ 
        error: 'Title and company are required' 
      });
    }

    const { data: job, error } = await supabaseAdmin
      .from('job_tracker')
      .insert({
        user_id: req.user.id,
        job_url,
        title,
        company,
        location,
        description,
        status,
        resume_id,
        notes,
        applied_date: status === 'applied' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      console.error('Job creation error:', error);
      throw new Error('Failed to save job');
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Job save error:', error);
    res.status(500).json({
      error: error.message || 'Failed to save job'
    });
  }
});

router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('job_tracker')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Jobs fetch error:', error);
      throw new Error('Failed to fetch jobs');
    }

    res.json({
      success: true,
      jobs: jobs || []
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch jobs'
    });
  }
});

router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabaseAdmin
      .from('job_tracker')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch job'
    });
  }
});

router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      job_url,
      title,
      company,
      location,
      description,
      status,
      resume_id,
      notes
    } = req.body;

    const updateData = {};
    if (job_url !== undefined) updateData.job_url = job_url;
    if (title !== undefined) updateData.title = title;
    if (company !== undefined) updateData.company = company;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'applied' && !updateData.applied_date) {
        updateData.applied_date = new Date().toISOString();
      }
    }
    if (resume_id !== undefined) updateData.resume_id = resume_id;
    if (notes !== undefined) updateData.notes = notes;

    const { data: job, error } = await supabaseAdmin
      .from('job_tracker')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Job update error:', error);
      throw new Error('Failed to update job');
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update job'
    });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('job_tracker')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Job delete error:', error);
      throw new Error('Failed to delete job');
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Job delete error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete job'
    });
  }
});

router.get('/stats/summary', authenticateUser, async (req, res) => {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('job_tracker')
      .select('status')
      .eq('user_id', req.user.id);

    if (error) {
      throw new Error('Failed to fetch job stats');
    }

    const stats = {
      total: jobs.length,
      saved: 0,
      applied: 0,
      interviewing: 0,
      rejected: 0,
      offered: 0
    };

    jobs.forEach(job => {
      if (stats.hasOwnProperty(job.status)) {
        stats[job.status]++;
      }
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch stats'
    });
  }
});

module.exports = router;
