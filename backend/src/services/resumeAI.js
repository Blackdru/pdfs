const OpenAI = require('openai');

class ResumeAI {
  constructor() {
    const useOpenRouter = process.env.OPENROUTER_API_KEY && 
                         process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here' &&
                         process.env.OPENROUTER_API_KEY !== 'sk-test-key-for-development' &&
                         (process.env.OPENROUTER_API_KEY.startsWith('sk-or-') || process.env.OPENROUTER_API_KEY.startsWith('sk-or-v1-'));
    
    if (useOpenRouter) {
      this.client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'RobotPDF Resume AI'
        }
      });
      this.model = 'meta-llama/llama-3.3-70b-instruct:free';
    } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1'
      });
      this.model = process.env.AI_MODEL || 'gpt-4o-mini';
    } else {
      this.client = null;
      this.model = null;
    }
  }

  isEnabled() {
    return this.client !== null && this.model !== null;
  }

  async optimizeResume(resumeData, jobDescription, tone = 'professional') {
    if (!this.isEnabled()) {
      throw new Error('AI service is not configured. Please set up OpenRouter or OpenAI API key.');
    }

    try {
      const prompt = this.buildOptimizationPrompt(resumeData, jobDescription, tone);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an elite professional resume writer and career strategist with expertise in ATS optimization, keyword targeting, and creating compelling achievement-focused resumes that get interviews.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.75,
        max_tokens: 3000
      });

      const optimizedContent = response.choices[0].message.content;
      return this.parseOptimizedResume(optimizedContent, resumeData);
    } catch (error) {
      console.error('Resume optimization error:', error);
      throw new Error(`Failed to optimize resume: ${error.message}`);
    }
  }

  buildOptimizationPrompt(resumeData, jobDescription, tone) {
    return `You are an elite resume optimization expert. Transform this resume to perfectly align with the target job while maintaining authenticity.

CURRENT RESUME:
${JSON.stringify(resumeData, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

DESIRED TONE: ${tone}

OPTIMIZATION REQUIREMENTS:

1. KEYWORD OPTIMIZATION:
   - Extract 15-20 critical keywords from the job description
   - Naturally integrate these keywords throughout the resume
   - Match exact terminology used in the job posting
   - Prioritize technical skills, tools, and methodologies mentioned

2. PROFESSIONAL SUMMARY:
   - Rewrite to directly address the job requirements
   - Highlight 3-4 relevant achievements with metrics
   - Position candidate as ideal fit for this specific role
   - Include key qualifications mentioned in job description

3. WORK EXPERIENCE OPTIMIZATION:
   - Rewrite each bullet to emphasize relevant skills and achievements
   - Add quantifiable metrics (percentages, dollar amounts, scale)
   - Use powerful action verbs (Spearheaded, Architected, Drove, Optimized)
   - Prioritize experiences most relevant to target role
   - Show direct alignment with job requirements

4. SKILLS ALIGNMENT:
   - Reorganize skills to prioritize those in job description
   - Add any relevant skills from job posting that candidate likely has
   - Group skills strategically (Technical, Tools, Soft Skills)

5. ATS OPTIMIZATION:
   - Use standard section headings
   - Format dates consistently (MM/YYYY)
   - Avoid tables, graphics, or complex formatting
   - Ensure keyword density without stuffing
   - Use industry-standard terminology

6. AUTHENTICITY:
   - Enhance and optimize existing information
   - Don't fabricate experiences or skills
   - Stay truthful while presenting information in best light
   - Expand on achievements with realistic metrics

Return the optimized resume as JSON with the same structure as the input, with significantly improved and tailored content.`;
  }

  parseOptimizedResume(content, originalData) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return originalData;
    } catch (error) {
      console.error('Failed to parse optimized resume:', error);
      return originalData;
    }
  }

  async calculateATSScore(resumeData, jobDescription) {
    if (!this.isEnabled()) {
      throw new Error('AI service is not configured. Please set up OpenRouter or OpenAI API key.');
    }

    try {
      const prompt = this.buildATSScorePrompt(resumeData, jobDescription);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an ATS (Applicant Tracking System) expert and technical recruiter who analyzes resume compatibility with job descriptions using industry-standard scoring criteria.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const scoreContent = response.choices[0].message.content;
      return this.parseATSScore(scoreContent);
    } catch (error) {
      console.error('ATS scoring error:', error);
      throw new Error(`Failed to calculate ATS score: ${error.message}`);
    }
  }

  buildATSScorePrompt(resumeData, jobDescription) {
    return `Analyze this resume against the job description and provide an ATS compatibility score.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide a score from 0-100 and detailed feedback in the following JSON format:
{
  "overall_score": 85,
  "keyword_match": 90,
  "formatting": 80,
  "experience_relevance": 85,
  "skills_match": 88,
  "suggestions": [
    "Add more specific technical skills mentioned in the job description",
    "Include measurable achievements in your experience bullets",
    "Add relevant certifications if you have them"
  ],
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword3", "keyword4"]
}`;
  }

  parseATSScore(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        overall_score: 0,
        keyword_match: 0,
        formatting: 0,
        experience_relevance: 0,
        skills_match: 0,
        suggestions: ['Unable to generate score'],
        matched_keywords: [],
        missing_keywords: []
      };
    } catch (error) {
      console.error('Failed to parse ATS score:', error);
      return {
        overall_score: 0,
        suggestions: ['Error calculating score'],
        matched_keywords: [],
        missing_keywords: []
      };
    }
  }

  async generateCoverLetter(resumeData, jobDescription, companyName, tone = 'professional') {
    if (!this.isEnabled()) {
      throw new Error('AI service is not configured. Please set up OpenRouter or OpenAI API key.');
    }

    try {
      const prompt = this.buildCoverLetterPrompt(resumeData, jobDescription, companyName, tone);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert cover letter writer who creates compelling, personalized cover letters that capture attention and demonstrate perfect fit for the role.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Cover letter generation error:', error);
      throw new Error(`Failed to generate cover letter: ${error.message}`);
    }
  }

  buildCoverLetterPrompt(resumeData, jobDescription, companyName, tone) {
    const name = resumeData.contact?.name || 'Candidate';
    
    return `Write a compelling 3-paragraph cover letter for this candidate applying to ${companyName}.

CANDIDATE PROFILE:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

TONE: ${tone}

REQUIREMENTS:
1. Start with a strong opening that shows enthusiasm and relevant qualifications
2. Second paragraph: Highlight 2-3 key achievements that match the job requirements
3. Third paragraph: Express interest and call to action
4. Keep it concise (250-350 words)
5. Make it personal and specific to this role
6. Use the candidate's actual name: ${name}

Format as a professional business letter without address headers.`;
  }

  async enhanceJobDescription(resumeData, rawJobDescription) {
    if (!this.isEnabled()) {
      return { clean_description: rawJobDescription };
    }

    try {
      const prompt = `Extract and structure the following job description into a clean format:

${rawJobDescription}

Return a JSON object with:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location",
  "key_requirements": ["requirement1", "requirement2"],
  "key_skills": ["skill1", "skill2"],
  "clean_description": "cleaned and formatted description"
}`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a job description parser and analyzer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { clean_description: rawJobDescription };
    } catch (error) {
      console.error('Job description enhancement error:', error);
      return { clean_description: rawJobDescription };
    }
  }

  checkUsageLimit(user) {
    const freeLimit = 2;
    const usageCount = user.resume_optimizations_count || 0;
    
    if (user.subscription_tier === 'free' && usageCount >= freeLimit) {
      throw new Error(`Free tier limit reached. You've used ${usageCount}/${freeLimit} optimizations this month.`);
    }
    
    return true;
  }
}

module.exports = new ResumeAI();
