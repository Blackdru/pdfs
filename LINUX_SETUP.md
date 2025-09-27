# Linux Setup Guide for AWS EC2

This guide provides instructions for setting up the PDF processing application on AWS EC2 Linux instances.

## System Dependencies

The application requires several system-level dependencies to be installed on the Linux server:

### For Ubuntu/Debian-based systems:

```bash
# Update package list
sudo apt update

# Install ImageMagick and GraphicsMagick for pdf2pic
sudo apt install -y imagemagick graphicsmagick

# Install Ghostscript for PDF processing
sudo apt install -y ghostscript

# Install build tools for native modules (canvas, sharp)
sudo apt install -y build-essential

# Install Python and pip (required for some native modules)
sudo apt install -y python3 python3-pip

# Install Cairo and Pango for canvas module
sudo apt install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Install additional libraries for sharp
sudo apt install -y libvips-dev

# Install Tesseract OCR (if using OCR features)
sudo apt install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-tel
```

### For Amazon Linux 2/CentOS/RHEL:

```bash
# Update package list
sudo yum update -y

# Install EPEL repository for additional packages
sudo yum install -y epel-release

# Install ImageMagick and GraphicsMagick
sudo yum install -y ImageMagick GraphicsMagick

# Install Ghostscript
sudo yum install -y ghostscript

# Install development tools
sudo yum groupinstall -y "Development Tools"

# Install Python
sudo yum install -y python3 python3-pip

# Install Cairo and Pango libraries
sudo yum install -y cairo-devel pango-devel libjpeg-turbo-devel giflib-devel librsvg2-devel

# Install libvips for sharp
sudo yum install -y vips-devel

# Install Tesseract OCR
sudo yum install -y tesseract tesseract-langpack-eng
```

## Node.js Dependencies

After installing system dependencies, install Node.js dependencies:

```bash
# Navigate to backend directory
cd backend

# Remove old node_modules and package-lock.json if they exist
rm -rf node_modules package-lock.json

# Install dependencies
npm install

# Install canvas separately for better Linux compatibility (optional but recommended)
npm install canvas

# If canvas installation fails, try:
npm install canvas --build-from-source
```

## Environment Configuration

Make sure your `.env` file includes:

```env
# OCR Configuration
ENABLE_OCR=true
OCR_LANGUAGES=eng
OCR_CONFIDENCE_THRESHOLD=0.5

# Other existing configurations...
```

## Verification

Test that the setup works correctly:

```bash
# Test the application
npm run dev

# Check if pdf2pic works by testing PDF conversion
node -e "
const pdf2pic = require('pdf2pic');
console.log('pdf2pic loaded successfully');
"

# Check if canvas works
node -e "
const { createCanvas } = require('canvas');
const canvas = createCanvas(200, 200);
console.log('Canvas created successfully');
"
```

## Troubleshooting

### Common Issues:

1. **Canvas installation fails:**
   ```bash
   # Install additional dependencies
   sudo apt install -y libpixman-1-dev
   npm install canvas --build-from-source
   ```

2. **pdf2pic fails to convert PDFs:**
   ```bash
   # Check ImageMagick policy
   sudo nano /etc/ImageMagick-6/policy.xml
   # Comment out or modify the PDF policy line:
   <!-- <policy domain="coder" rights="none" pattern="PDF" /> -->
   ```

3. **Sharp installation issues:**
   ```bash
   # Install sharp with platform-specific binary
   npm install sharp --platform=linux --arch=x64
   ```

4. **Permission issues with temp directory:**
   ```bash
   # Ensure temp directory has proper permissions
   mkdir -p backend/temp
   chmod 755 backend/temp
   ```

## Performance Optimization

For better performance on EC2:

1. **Use an instance with sufficient RAM** (at least 2GB recommended)
2. **Enable swap if needed:**
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **Configure PM2 for production:**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "pdf-backend"
   pm2 startup
   pm2 save
   ```

## Security Considerations

1. **Configure ImageMagick security policy** to prevent potential vulnerabilities
2. **Limit file upload sizes** in your application
3. **Set up proper firewall rules** for your EC2 instance
4. **Use environment variables** for sensitive configuration

## Migration Notes

The application has been updated to remove `pdf-poppler` dependency and now uses:
- **pdf2pic** as the primary PDF to image conversion tool (Linux compatible)
- **canvas** for improved image processing support
- **Existing pdf-parse** for direct text extraction from PDFs

All functionality remains the same, but the application is now fully compatible with Linux environments including AWS EC2.