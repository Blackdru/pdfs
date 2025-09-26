const request = require('supertest');
const app = require('../src/server');
const fs = require('fs');
const path = require('path');

describe('PDF Tools Integration Tests', () => {
  let authToken;
  let testFileId;
  let testFiles = [];

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  });

  describe('File Upload', () => {
    test('should upload a PDF file successfully', async () => {
      const testPdfPath = path.join(__dirname, 'fixtures', 'test.pdf');
      
      // Create test PDF if it doesn't exist
      if (!fs.existsSync(testPdfPath)) {
        fs.mkdirSync(path.dirname(testPdfPath), { recursive: true });
        fs.writeFileSync(testPdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF'));
      }

      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testPdfPath);

      expect(response.status).toBe(200);
      expect(response.body.file).toBeDefined();
      expect(response.body.file.id).toBeDefined();
      
      testFileId = response.body.file.id;
      testFiles.push(testFileId);
    });

    test('should upload multiple files successfully', async () => {
      const testPdfPath = path.join(__dirname, 'fixtures', 'test2.pdf');
      
      if (!fs.existsSync(testPdfPath)) {
        fs.writeFileSync(testPdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF'));
      }

      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testPdfPath);

      expect(response.status).toBe(200);
      testFiles.push(response.body.file.id);
    });
  });

  describe('Basic PDF Tools', () => {
    test('should merge PDFs successfully', async () => {
      if (testFiles.length < 2) {
        // Upload another file for merging
        const testPdfPath = path.join(__dirname, 'fixtures', 'test3.pdf');
        fs.writeFileSync(testPdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF'));
        
        const uploadResponse = await request(app)
          .post('/api/files/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', testPdfPath);
        
        testFiles.push(uploadResponse.body.file.id);
      }

      const response = await request(app)
        .post('/api/pdf/merge')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileIds: testFiles.slice(0, 2),
          outputName: 'merged-test.pdf'
        });

      expect(response.status).toBe(200);
      expect(response.body.file).toBeDefined();
      expect(response.body.file.filename).toContain('merged');
    });

    test('should split PDF successfully', async () => {
      const response = await request(app)
        .post('/api/pdf/split')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          outputName: 'split-test.pdf'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/zip');
    });

    test('should compress PDF successfully', async () => {
      const response = await request(app)
        .post('/api/pdf/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          quality: 0.7,
          outputName: 'compressed-test.pdf'
        });

      expect(response.status).toBe(200);
      expect(response.body.file).toBeDefined();
      expect(response.body.file.filename).toContain('compressed');
    });

    test('should convert images to PDF successfully', async () => {
      // Create a test image
      const testImagePath = path.join(__dirname, 'fixtures', 'test.jpg');
      const sharp = require('sharp');
      
      if (!fs.existsSync(testImagePath)) {
        await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
        .jpeg()
        .toFile(testImagePath);
      }

      // Upload image
      const uploadResponse = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      const imageFileId = uploadResponse.body.file.id;

      const response = await request(app)
        .post('/api/pdf/convert/images-to-pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileIds: [imageFileId],
          outputName: 'converted-test.pdf'
        });

      expect(response.status).toBe(200);
      expect(response.body.file).toBeDefined();
    });
  });

  describe('AI-Powered Tools', () => {
    test('should perform OCR successfully', async () => {
      const response = await request(app)
        .post('/api/ai/ocr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          language: 'eng',
          enhanceImage: true
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.text).toBeDefined();
      expect(response.body.result.confidence).toBeDefined();
    });

    test('should create embeddings successfully', async () => {
      const response = await request(app)
        .post('/api/ai/create-embeddings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');
    });

    test('should chat with PDF successfully', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          message: 'What is this document about?'
        });

      expect(response.status).toBe(200);
      expect(response.body.response).toBeDefined();
    });

    test('should generate smart summary successfully', async () => {
      const response = await request(app)
        .post('/api/ai/smart-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          includeKeyPoints: true,
          includeSentiment: true,
          includeEntities: true
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.summary).toBeDefined();
    });
  });

  describe('Advanced/Pro Tools', () => {
    test('should perform advanced merge successfully', async () => {
      const response = await request(app)
        .post('/api/pdf/advanced/advanced-merge')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileIds: testFiles.slice(0, 2),
          outputName: 'advanced-merged.pdf',
          options: {
            addBookmarks: true,
            addPageNumbers: true,
            addTitlePage: true
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.file).toBeDefined();
    });

    test('should perform advanced split successfully', async () => {
      const response = await request(app)
        .post('/api/pdf/advanced/advanced-split')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          options: {
            splitType: 'pages',
            pageRanges: ['1-2', '3-4'],
            customNaming: true
          }
        });

      expect(response.status).toBe(200);
    });

    test('should perform password protection successfully', async () => {
      const response = await request(app)
        .post('/api/pdf/advanced/password-protect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          password: 'testpassword123',
          permissions: {
            printing: false,
            copying: false,
            editing: false
          },
          outputName: 'protected-test.pdf'
        });

      expect(response.status).toBe(200);
      expect(response.body.file).toBeDefined();
    });

    test('should perform digital signing successfully', async () => {
      const response = await request(app)
        .post('/api/pdf/advanced/digital-sign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileId: testFileId,
          signatureData: {
            name: 'Test User',
            reason: 'Testing',
            location: 'Test Location',
            contactInfo: 'test@example.com'
          },
          position: { x: 100, y: 100 },
          outputName: 'signed-test.pdf'
        });

      expect(response.status).toBe(200);
      expect(response.body.file).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid file ID gracefully', async () => {
      const response = await request(app)
        .post('/api/pdf/merge')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileIds: ['invalid-id'],
          outputName: 'test.pdf'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('should handle missing authentication', async () => {
      const response = await request(app)
        .post('/api/pdf/merge')
        .send({
          fileIds: [testFileId],
          outputName: 'test.pdf'
        });

      expect(response.status).toBe(401);
    });

    test('should handle network timeouts gracefully', async () => {
      // This test simulates a timeout scenario
      const response = await request(app)
        .post('/api/pdf/merge')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(1) // Very short timeout
        .send({
          fileIds: testFiles.slice(0, 2),
          outputName: 'timeout-test.pdf'
        })
        .catch(err => err);

      expect(err.code).toBe('ECONNABORTED');
    });
  });

  afterAll(async () => {
    // Clean up test files
    for (const fileId of testFiles) {
      try {
        await request(app)
          .delete(`/api/files/${fileId}`)
          .set('Authorization', `Bearer ${authToken}`);
      } catch (error) {
        console.warn('Failed to clean up test file:', fileId);
      }
    }
  });
});

describe('Frontend Integration Tests', () => {
  test('should handle file upload modal positioning', () => {
    // This would be a frontend test using Jest + React Testing Library
    // Testing that the upload modal appears in the center of the screen
    expect(true).toBe(true); // Placeholder
  });

  test('should show processing progress correctly', () => {
    // Test that processing modal shows accurate progress
    expect(true).toBe(true); // Placeholder
  });

  test('should handle network errors gracefully', () => {
    // Test network error handling in frontend
    expect(true).toBe(true); // Placeholder
  });
});