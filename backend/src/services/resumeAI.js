const OpenAI = require('openai');

class ResumeAI {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1'
    });
    this.model = process.env.AI_MODEL || 'gpt-4o-mini';
  }

  async optimizeResume(resumeData, jobDescription, tone = 'professional') {
    try {
      const prompt = this.buildOptimizationPrompt(resumeData, jobDescription, tone);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer and career coach with expertise in ATS optimization and modern hiring practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const optimizedContent = response.choices[0].message.content;
      return this.parseOptimizedResume(optimizedContent, resumeData);
    } catch (error) {
      console.error('Resume optimization error:', error);
      throw new Error(`Failed to optimize resume: ${error.message}`);
    }
  }

  buildOptimizationPrompt(resumeData, jobDescription, tone) {
    return `You are a professional resume writer. Rewrite and optimize the following resume to perfectly match the job description. Make it ATS-friendly with measurable impact and clear bullet points.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

TONE: ${tone}

INSTRUCTIONS:
1. Tailor the summary/objective to match the job requirements
2. Rewrite experience bullets to highlight relevant skills and achievements
3. Use action verbs and quantify results where possible
4. Include keywords from the job description naturally
5. Keep formatting ATS-friendly (no tables, columns, or complex formatting)
6. Maintain truthfulness - enhance but don't fabricate

Return the optimized resume as JSON with the same structure as the input, with improved content in each section.`;
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
    try {
      const prompt = this.buildATSScorePrompt(resumeData, jobDescription);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an ATS (Applicant Tracking System) expert who analyzes resumes against job descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
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
    try {
      const prompt = this.buildCoverLetterPrompt(resumeData, jobDescription, companyName, tone);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional cover letter writer who creates compelling, personalized cover letters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
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
          { role: 'system', content: 'You are a job description parser.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
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
