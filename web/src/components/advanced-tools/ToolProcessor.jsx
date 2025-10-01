import { useState } from 'react'
import { Button } from '../ui/button'
import { Crown, Upload, FileText, Info, Rocket } from 'lucide-react'
import AdvancedSettings from './AdvancedSettings'

const ToolProcessor = ({
  selectedTool,
  uploadedFiles,
  onFilesUploaded,
  isProcessing,
  canProcess,
  usageExceeded,
  onProcess,
  showUploadModal,
  setShowUploadModal,
  toolSettings,
  setToolSettings
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  return (
    <div className="bg-surface rounded-3xl border border-border p-8 mb-8">
      <div className="flex items-center mb-8">
        <div className={`w-12 h-12 ${selectedTool.iconBg} rounded-xl flex items-center justify-center mr-4`}>
          <selectedTool.icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{selectedTool.title}</h2>
          <p className="text-muted-foreground">{selectedTool.description}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          <Crown className="h-3 w-3 mr-1 inline" />
          PRO
        </div>
      </div>

      {/* Advanced Settings Panel */}
      <AdvancedSettings
        selectedTool={selectedTool}
        showAdvancedSettings={showAdvancedSettings}
        setShowAdvancedSettings={setShowAdvancedSettings}
        toolSettings={toolSettings}
        setToolSettings={setToolSettings}
      />

      {/* File Upload Area */}
      <div id="upload-section" className="bg-elevated rounded-2xl p-6 mb-6 text-center">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          {selectedTool.multipleFiles ? 'Upload Files' : 'Upload File'}
        </h3>
        
        <Button
          onClick={() => setShowUploadModal(true)}
          className={`bg-gradient-to-r ${selectedTool.color} text-white px-8 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300`}
        >
          <Upload className="h-5 w-5 mr-2" />
          {selectedTool.multipleFiles ? 'Select Files' : 'Select File'}
        </Button>

        <p className="text-sm text-muted-foreground mt-3">
          Supports: {selectedTool.acceptedFiles.replace(/\./g, '').toUpperCase()}
          {selectedTool.multipleFiles && ` • Up to 10 files`}
        </p>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-card-foreground">
              Selected Files ({uploadedFiles.length})
            </h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-card-foreground truncate">{file.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTool.minFiles > 1 && uploadedFiles.length > 0 && uploadedFiles.length < selectedTool.minFiles && (
          <div className="mt-4 p-4 bg-blue-900 border border-blue-800 rounded-xl flex items-center">
            <Info className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
            <p className="text-blue-300">
              You need at least {selectedTool.minFiles} files to use this tool. 
              Upload {selectedTool.minFiles - uploadedFiles.length} more file(s).
            </p>
          </div>
        )}
      </div>

      {/* Process Button */}
      {uploadedFiles.length > 0 && (
        <div className="flex items-center justify-between p-6 bg-elevated rounded-2xl">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">Ready to Process</h3>
            <p className="text-muted-foreground">
              {uploadedFiles.length} file(s) ready for {selectedTool.title.toLowerCase()}
            </p>
          </div>
          <Button
            onClick={() => onProcess(uploadedFiles, toolSettings)}
            disabled={!canProcess || usageExceeded || isProcessing}
            className={`bg-gradient-to-r ${selectedTool.color} text-white px-8 py-3 hover:shadow-lg transition-all duration-300`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Process Files
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ToolProcessor