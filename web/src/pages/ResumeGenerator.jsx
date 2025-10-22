import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import ProcessingModal from '../components/ProcessingModal'
import toast from 'react-hot-toast'
import { FileText, Sparkles, Download, Plus, Trash2, Wand2, Target, Briefcase, GraduationCap, Award, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const ResumeGenerator = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState('')
  const [generatedResume, setGeneratedResume] = useState(null)
  const [templates, setTemplates] = useState([])
  const [industries, setIndustries] = useState([])
  const [experienceLevels, setExperienceLevels] = useState([])

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', linkedin: '', github: '', portfolio: '',
    summary: '', targetRole: '', industry: '', experienceLevel: 'mid',
    experience: [], education: [], skills: { technical: '', soft: '', tools: '' },
    projects: [], certifications: [], languages: []
  })

  const [options, setOptions] = useState({
    template: 'professional', tone: 'professional', includeSummary: true,
    includeSkills: true, includeProjects: false, includeCertifications: false, includeLanguages: false
  })

  const steps = [
    { number: 1, title: 'Contact Info', icon: FileText },
    { number: 2, title: 'Work Experience', icon: Briefcase },
    { number: 3, title: 'Education', icon: GraduationCap },
    { number: 4, title: 'Skills', icon: Award },
    { number: 5, title: 'Options', icon: Target }
  ]

  useEffect(() => {
    loadMetadata()
  }, [])

  const loadMetadata = async () => {
    try {
      const [templatesRes, industriesRes, levelsRes] = await Promise.all([
        api.get('/v1/resumes/templates'),
        api.get('/v1/resumes/industries'),
        api.get('/v1/resumes/experience-levels')
      ])
      setTemplates(templatesRes.templates || [])
      setIndustries(industriesRes.industries || [])
      setExperienceLevels(levelsRes.levels || [])
    } catch (error) {
      console.error('Failed to load metadata:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.name?.trim()) return 'Name is required'
        if (!formData.email?.trim()) return 'Email is required'
        if (!formData.phone?.trim()) return 'Phone is required'
        if (!formData.address?.trim()) return 'Address is required'
        if (!formData.targetRole?.trim()) return 'Target role is required'
        if (!formData.industry?.trim()) return 'Industry is required'
        return null
      case 2:
        if (formData.experience.length === 0) return 'At least one work experience is required'
        for (let exp of formData.experience) {
          if (!exp.title?.trim()) return 'Job title is required for all experiences'
          if (!exp.company?.trim()) return 'Company name is required for all experiences'
          if (!exp.startDate?.trim()) return 'Start date is required for all experiences'
          if (!exp.endDate?.trim()) return 'End date is required for all experiences'
        }
        return null
      case 3:
        if (formData.education.length === 0) return 'At least one education entry is required'
        for (let edu of formData.education) {
          if (!edu.degree?.trim()) return 'Degree is required for all education entries'
          if (!edu.institution?.trim()) return 'Institution is required for all education entries'
          if (!edu.graduationDate?.trim()) return 'Graduation year is required for all education entries'
        }
        return null
      case 4:
        const techSkills = formData.skills.technical.split(',').map(s => s.trim()).filter(Boolean)
        const toolSkills = formData.skills.tools.split(',').map(s => s.trim()).filter(Boolean)
        if (techSkills.length === 0) {
          return 'At least one technical skill is required'
        }
        if (toolSkills.length === 0) {
          return 'At least one tool/technology is required'
        }
        return null
      default:
        return null
    }
  }

  const handleNext = () => {
    const error = validateStep(currentStep)
    if (error) {
      toast.error(error)
      return
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleOptionChange = (field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }))
  }

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', location: '', startDate: '', endDate: '', achievements: [] }]
    }))
  }

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    }))
  }

  const removeExperience = (index) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', location: '', graduationDate: '', gpa: '' }]
    }))
  }

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    }))
  }

  const removeEducation = (index) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }))
  }

  const handleGenerate = async () => {
    // Validate all steps before generating
    for (let step = 1; step <= 4; step++) {
      const error = validateStep(step)
      if (error) {
        toast.error(error)
        setCurrentStep(step)
        return
      }
    }

    setIsGenerating(true)
    setProgress(0)
    setProgressStage('Preparing your data...')

    try {
      setProgress(5)
      toast.loading('Preparing your data...', { id: 'generate' })

      // Prepare userData with proper structure
      const technicalSkills = formData.skills.technical.split(',').map(s => s.trim()).filter(Boolean)
      const toolsSkills = formData.skills.tools.split(',').map(s => s.trim()).filter(Boolean)
      const softSkills = formData.skills.soft.split(',').map(s => s.trim()).filter(Boolean)
      
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        location: formData.address,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
        summary: formData.summary,
        targetRole: formData.targetRole,
        industry: formData.industry,
        experienceLevel: formData.experienceLevel,
        experience: formData.experience,
        education: formData.education,
        technicalSkills: technicalSkills,
        tools: toolsSkills,
        softSkills: softSkills,
        projects: formData.projects,
        certifications: formData.certifications,
        languages: formData.languages
      }

      setProgress(10)
      setProgressStage('Analyzing your profile and experience...')
      toast.loading('AI is analyzing your profile...', { id: 'generate' })
      
      // Simulate realistic progress updates with stages
      const stages = [
        { progress: 20, stage: 'Crafting professional summary...', delay: 3000 },
        { progress: 35, stage: 'Enhancing work experience with metrics...', delay: 4000 },
        { progress: 50, stage: 'Optimizing achievements and impact statements...', delay: 4000 },
        { progress: 65, stage: 'Formatting education and skills...', delay: 3000 },
        { progress: 75, stage: 'Applying ATS optimization...', delay: 2000 }
      ]
      
      let currentStageIndex = 0
      const progressInterval = setInterval(() => {
        if (currentStageIndex < stages.length) {
          const stage = stages[currentStageIndex]
          setProgress(stage.progress)
          setProgressStage(stage.stage)
          toast.loading(stage.stage, { id: 'generate' })
          currentStageIndex++
        }
      }, 3500)

      const response = await api.request('/v1/resumes/generate', {
        method: 'POST',
        body: JSON.stringify({ userData, options }),
        timeout: 180000 // 3 minutes timeout
      })

      clearInterval(progressInterval)
      setProgress(90)
      setProgressStage('Finalizing your professional resume...')
      toast.loading('Finalizing your resume...', { id: 'generate' })
      
      setGeneratedResume({
        ...response.generated,
        metadata: { ...response.generated.metadata, resumeId: response.resume.id }
      })
      
      setProgress(100)
      setProgressStage('Complete!')
      toast.dismiss('generate')
      toast.success('Resume generated successfully! 🎉')

    } catch (error) {
      console.error('Generation error:', error)
      toast.dismiss('generate')
      toast.error(error.message || 'Failed to generate resume')
    } finally {
      setTimeout(() => setIsGenerating(false), 500)
    }
  }

  const handleDownload = async (format = 'pdf') => {
    if (!generatedResume || !generatedResume.metadata?.resumeId) {
      toast.error('No resume to download')
      return
    }

    try {
      toast.loading('Preparing download...', { id: 'download' })
      
      const blob = await api.downloadResume(generatedResume.metadata.resumeId, format, 'generated')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.dismiss('download')
      toast.success('Resume downloaded!')
    } catch (error) {
      toast.dismiss('download')
      toast.error('Download failed: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-page py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl">
              <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Resume Generator
            </h1>
          </div>
          <p className="text-grey-400 text-sm sm:text-base lg:text-lg px-4">
            Create professional, ATS-optimized resumes in minutes
          </p>
        </div>

        {/* Step Progress */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > step.number
              const isCurrent = currentStep === step.number
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-green-600 border-green-600' :
                      isCurrent ? 'bg-purple-600 border-purple-600' :
                      'bg-grey-800 border-grey-700'
                    }`}>
                      {isCompleted ? <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" /> : <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                    </div>
                    <span className={`text-xs sm:text-sm mt-2 text-center ${
                      isCurrent ? 'text-purple-400 font-semibold' : 'text-grey-400'
                    }`}>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${
                      isCompleted ? 'bg-green-600' : 'bg-grey-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-grey-800">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Step {currentStep}: {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Fill in your details to generate a professional resume
                  <span className="block mt-1 text-purple-400">* indicates required field</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step 1: Contact Info */}
                {currentStep === 1 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="name" className="text-xs sm:text-sm">Full Name *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="John Doe" className="mt-1 bg-grey-900 border-grey-800" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="john@example.com" className="mt-1 bg-grey-900 border-grey-800" />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-xs sm:text-sm">Phone *</Label>
                        <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+1 234 567 8900" className="mt-1 bg-grey-900 border-grey-800" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address" className="text-xs sm:text-sm">Full Address *</Label>
                        <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="123 Main Street, Apt 4B, New York, NY 10001" rows={2} className="mt-1 bg-grey-900 border-grey-800" />
                      </div>
                      <div>
                        <Label htmlFor="linkedin" className="text-xs sm:text-sm">LinkedIn</Label>
                        <Input id="linkedin" value={formData.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" className="mt-1 bg-grey-900 border-grey-800" />
                      </div>
                      <div>
                        <Label htmlFor="github" className="text-xs sm:text-sm">GitHub</Label>
                        <Input id="github" value={formData.github} onChange={(e) => handleInputChange('github', e.target.value)} placeholder="github.com/johndoe" className="mt-1 bg-grey-900 border-grey-800" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="summary" className="text-xs sm:text-sm">Professional Summary</Label>
                      <Textarea id="summary" value={formData.summary} onChange={(e) => handleInputChange('summary', e.target.value)} placeholder="Brief professional summary..." rows={3} className="mt-1 bg-grey-900 border-grey-800" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="targetRole" className="text-xs sm:text-sm">Target Role *</Label>
                        <Input id="targetRole" value={formData.targetRole} onChange={(e) => handleInputChange('targetRole', e.target.value)} placeholder="Software Engineer" className="mt-1 bg-grey-900 border-grey-800" />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Industry *</Label>
                        <Select value={formData.industry} onValueChange={(val) => handleInputChange('industry', val)}>
                          <SelectTrigger className="mt-1 bg-grey-900 border-grey-800">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent className="bg-grey-500 border-grey-500 text-white">
                            {industries.map(ind => (
                              <SelectItem key={ind} value={ind} className="focus:bg-grey-500 text-white">{ind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Experience Level</Label>
                        <Select value={formData.experienceLevel} onValueChange={(val) => handleInputChange('experienceLevel', val)}>
                          <SelectTrigger className="mt-1 bg-grey-900 border-grey-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-grey-900 border-grey-800 text-white">
                            {experienceLevels.map(level => (
                              <SelectItem key={level.value} value={level.value} className="focus:bg-grey-800 text-white">{level.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Work Experience */}
                {currentStep === 2 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base sm:text-lg font-semibold">Work Experience *</h3>
                      <Button onClick={addExperience} size="sm" variant="outline" className="text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Add
                      </Button>
                    </div>
                    {formData.experience.map((exp, index) => (
                      <Card key={index} className="bg-grey-900 border-grey-800">
                        <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm sm:text-base">Experience {index + 1}</h4>
                            <Button onClick={() => removeExperience(index)} size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <Input placeholder="Job Title *" value={exp.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="Company *" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="Location" value={exp.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="Start Date (MM/YYYY) *" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="End Date (MM/YYYY or Present) *" value={exp.endDate} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                          </div>
                          <Textarea placeholder="Key achievements (one per line) " value={exp.achievements.join('\n')} onChange={(e) => updateExperience(index, 'achievements', e.target.value.split('\n'))} rows={2} className="bg-grey-800 border-grey-700 text-sm" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Step 3: Education */}
                {currentStep === 3 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base sm:text-lg font-semibold">Education</h3>
                      <Button onClick={addEducation} size="sm" variant="outline" className="text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Add
                      </Button>
                    </div>
                    {formData.education.map((edu, index) => (
                      <Card key={index} className="bg-grey-900 border-grey-800">
                        <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm sm:text-base">Education {index + 1}</h4>
                            <Button onClick={() => removeEducation(index)} size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <Input placeholder="Degree *" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="Institution *" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="Location" value={edu.location} onChange={(e) => updateEducation(index, 'location', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="Graduation Year (YYYY) *" value={edu.graduationDate} onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                            <Input placeholder="GPA (optional)" value={edu.gpa} onChange={(e) => updateEducation(index, 'gpa', e.target.value)} className="bg-grey-800 border-grey-700 text-sm" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Step 4: Skills */}
                {currentStep === 4 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label className="text-xs sm:text-sm">Technical Skills *</Label>
                      <Input placeholder="Enter skills separated by commas (e.g., Python, JavaScript, React)" value={formData.skills.technical} onChange={(e) => handleInputChange('skills', { ...formData.skills, technical: e.target.value })} className="mt-1 bg-grey-900 border-grey-800 text-sm" />
                      <p className="text-xs text-grey-500 mt-1">At least one technical skill is required</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">Tools & Technologies *</Label>
                      <Input placeholder="Enter tools separated by commas (e.g., Git, Docker, AWS)" value={formData.skills.tools} onChange={(e) => handleInputChange('skills', { ...formData.skills, tools: e.target.value })} className="mt-1 bg-grey-900 border-grey-800 text-sm" />
                      <p className="text-xs text-grey-500 mt-1">At least one tool/technology is required</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">Soft Skills</Label>
                      <Input placeholder="Enter skills separated by commas (e.g., Leadership, Communication)" value={formData.skills.soft} onChange={(e) => handleInputChange('skills', { ...formData.skills, soft: e.target.value })} className="mt-1 bg-grey-900 border-grey-800 text-sm" />
                    </div>
                  </div>
                )}

                {/* Step 5: Options */}
                {currentStep === 5 && (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Tone</Label>
                        <Select value={options.tone} onValueChange={(val) => handleOptionChange('tone', val)}>
                          <SelectTrigger className="mt-1.5 bg-grey-900 border-grey-800 h-10 sm:h-11 text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-grey-900 border-grey-800 text-white">
                            <SelectItem value="professional" className="focus:bg-grey-800 text-white text-xs sm:text-sm">Professional</SelectItem>
                            <SelectItem value="casual" className="focus:bg-grey-800 text-white text-xs sm:text-sm">Casual</SelectItem>
                            <SelectItem value="formal" className="focus:bg-grey-800 text-white text-xs sm:text-sm">Formal</SelectItem>
                            <SelectItem value="creative" className="focus:bg-grey-800 text-white text-xs sm:text-sm">Creative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-grey-200">Include Sections</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-grey-900 rounded-lg border border-grey-800 hover:border-grey-700 transition-colors">
                          <Label className="text-xs sm:text-sm cursor-pointer flex-1">Professional Summary</Label>
                          <Switch checked={options.includeSummary} onCheckedChange={(val) => handleOptionChange('includeSummary', val)} className="ml-2" />
                        </div>
                        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-grey-900 rounded-lg border border-grey-800 hover:border-grey-700 transition-colors">
                          <Label className="text-xs sm:text-sm cursor-pointer flex-1">Skills Section</Label>
                          <Switch checked={options.includeSkills} onCheckedChange={(val) => handleOptionChange('includeSkills', val)} className="ml-2" />
                        </div>
                        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-grey-900 rounded-lg border border-grey-800 hover:border-grey-700 transition-colors">
                          <Label className="text-xs sm:text-sm cursor-pointer flex-1">Projects</Label>
                          <Switch checked={options.includeProjects} onCheckedChange={(val) => handleOptionChange('includeProjects', val)} className="ml-2" />
                        </div>
                        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-grey-900 rounded-lg border border-grey-800 hover:border-grey-700 transition-colors">
                          <Label className="text-xs sm:text-sm cursor-pointer flex-1">Certifications</Label>
                          <Switch checked={options.includeCertifications} onCheckedChange={(val) => handleOptionChange('includeCertifications', val)} className="ml-2" />
                        </div>
                        <div className="flex items-center justify-between p-3 sm:p-3.5 bg-grey-900 rounded-lg border border-grey-800 hover:border-grey-700 transition-colors sm:col-span-2">
                          <Label className="text-xs sm:text-sm cursor-pointer flex-1">Languages</Label>
                          <Switch checked={options.includeLanguages} onCheckedChange={(val) => handleOptionChange('includeLanguages', val)} className="ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-6 border-t border-grey-800">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="text-sm sm:text-base"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  {currentStep < 5 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm sm:text-base"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Resume
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Section */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-card border-grey-800">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Generate Resume</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Create your professional resume with AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="text-center p-4 bg-grey-900 rounded-lg">
                  <p className="text-sm text-grey-400 mb-2">Current Step</p>
                  <p className="text-2xl font-bold text-purple-400">{currentStep} / 5</p>
                  <p className="text-xs text-grey-500 mt-2">{steps[currentStep - 1].title}</p>
                </div>

                <Card className="bg-grey-900 border-grey-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Progress Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-grey-400">Contact Info:</span>
                      <span className={formData.name && formData.email && formData.phone && formData.address && formData.targetRole && formData.industry ? 'text-green-500' : 'text-grey-500'}>
                        {formData.name && formData.email && formData.phone && formData.address && formData.targetRole && formData.industry ? '✓ Complete' : '○ Incomplete'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-400">Work Experience:</span>
                      <span className={formData.experience.length > 0 ? 'text-green-500' : 'text-grey-500'}>
                        {formData.experience.length > 0 ? `✓ ${formData.experience.length} added` : '○ None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-400">Education:</span>
                      <span className={formData.education.length > 0 ? 'text-green-500' : 'text-grey-500'}>
                        {formData.education.length > 0 ? `✓ ${formData.education.length} added` : '○ None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-grey-400">Skills:</span>
                      <span className={formData.skills.technical.trim() && formData.skills.tools.trim() ? 'text-green-500' : 'text-grey-500'}>
                        {formData.skills.technical.trim() && formData.skills.tools.trim() ? '✓ Complete' : '○ Incomplete'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {generatedResume && (
                  <div className="pt-3 sm:pt-4 border-t border-grey-800">
                    <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Download Options</h4>
                    <div className="space-y-2">
                      <Button onClick={() => handleDownload('pdf')} variant="outline" className="w-full text-sm sm:text-base py-4 sm:py-5">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button onClick={() => handleDownload('docx')} variant="outline" className="w-full text-sm sm:text-base py-4 sm:py-5">
                        <Download className="h-4 w-4 mr-2" />
                        Download DOCX
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-grey-800">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-sm sm:text-base">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>ATS-optimized formatting</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span>AI-powered content generation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Industry-specific templates</span>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Professional formatting</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isGenerating && (
          <ProcessingModal isOpen={isGenerating} title="Generating Resume" fileName="AI Resume" progress={progress} stage={progressStage} icon={Wand2} />
        )}
      </div>
    </div>
  )
}

export default ResumeGenerator
