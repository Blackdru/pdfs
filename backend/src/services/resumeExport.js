const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs').promises;
const path = require('path');

class ResumeExport {
  async generatePDF(resumeData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 40, bottom: 40, left: 50, right: 50 }
        });

        const stream = require('fs').createWriteStream(outputPath);
        doc.pipe(stream);

        const contact = resumeData.contact || {};
        const name = contact.name || 'Candidate Name';
        
        // Header with name
        doc.fontSize(26).font('Helvetica-Bold').fillColor('#1a1a1a').text(name.toUpperCase(), { align: 'center' });
        doc.moveDown(0.2);

        // Target role if available
        if (resumeData.targetRole) {
          doc.fontSize(12).font('Helvetica').fillColor('#4a4a4a').text(resumeData.targetRole, { align: 'center' });
          doc.moveDown(0.3);
        }

        // Contact info with better formatting
        doc.fontSize(9).font('Helvetica').fillColor('#2c2c2c');
        const contactLine1 = [contact.email, contact.phone].filter(Boolean).join(' | ');
        const contactLine2 = [
          contact.address || contact.location,
          contact.linkedin,
          contact.github,
          contact.portfolio
        ].filter(Boolean).join(' | ');
        
        if (contactLine1) {
          doc.text(contactLine1, { align: 'center' });
        }
        if (contactLine2) {
          doc.text(contactLine2, { align: 'center' });
        }
        
        // Horizontal line separator
        doc.moveDown(0.5);
        doc.strokeColor('#cccccc').lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke();
        doc.moveDown(0.8);

        if (resumeData.summary) {
          // Section header with styling
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a').text('PROFESSIONAL SUMMARY');
          doc.moveDown(0.1);
          doc.strokeColor('#4a90e2').lineWidth(2)
             .moveTo(50, doc.y)
             .lineTo(150, doc.y)
             .stroke();
          doc.moveDown(0.4);
          doc.fontSize(10).font('Helvetica').fillColor('#2c2c2c').text(resumeData.summary, { align: 'justify', lineGap: 2 });
          doc.moveDown(1.2);
        }

        if (resumeData.experience && resumeData.experience.length > 0) {
          // Section header
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a').text('EXPERIENCE');
          doc.moveDown(0.1);
          doc.strokeColor('#4a90e2').lineWidth(2)
             .moveTo(50, doc.y)
             .lineTo(150, doc.y)
             .stroke();
          doc.moveDown(0.5);
          
          resumeData.experience.forEach((exp, index) => {
            // Job title
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text(exp.title || exp.position || exp.company);
            
            // Company and location on same line
            const company = exp.company || '';
            const location = exp.location && exp.location.trim() && exp.location !== 'Not specified' ? exp.location : '';
            const duration = exp.duration || `${exp.startDate || ''} - ${exp.endDate || ''}`;
            
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#4a4a4a');
            if (company && location) {
              doc.text(`${company} | ${location}`, { continued: false });
            } else if (company) {
              doc.text(company, { continued: false });
            }
            
            // Duration
            doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666').text(duration);
            doc.moveDown(0.3);
            
            // Achievements with better formatting
            if (exp.achievements && Array.isArray(exp.achievements)) {
              doc.fontSize(9.5).font('Helvetica').fillColor('#2c2c2c');
              exp.achievements.forEach((achievement, i) => {
                const bulletY = doc.y;
                doc.circle(55, bulletY + 3, 1.5).fill('#4a90e2');
                doc.text(achievement, 65, bulletY, { 
                  width: doc.page.width - 115,
                  align: 'left',
                  lineGap: 1.5
                });
                if (i < exp.achievements.length - 1) doc.moveDown(0.2);
              });
            } else if (exp.description) {
              doc.fontSize(9.5).font('Helvetica').fillColor('#2c2c2c').text(exp.description, { align: 'justify', lineGap: 1.5 });
            }
            
            if (index < resumeData.experience.length - 1) doc.moveDown(0.8);
          });
          doc.moveDown(1.2);
        }

        if (resumeData.education && resumeData.education.length > 0) {
          // Section header
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a').text('EDUCATION');
          doc.moveDown(0.1);
          doc.strokeColor('#4a90e2').lineWidth(2)
             .moveTo(50, doc.y)
             .lineTo(150, doc.y)
             .stroke();
          doc.moveDown(0.5);
          
          resumeData.education.forEach((edu, index) => {
            if (typeof edu === 'string') {
              doc.fontSize(10).font('Helvetica').fillColor('#2c2c2c').text(`• ${edu}`);
            } else {
              // Degree and institution
              doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a1a')
                 .text(`${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`, { continued: false });
              
              // Location and date
              const details = [];
              if (edu.location && edu.location.trim() && edu.location !== 'Not specified') details.push(edu.location);
              if (edu.graduationDate && edu.graduationDate.trim()) details.push(edu.graduationDate);
              if (details.length > 0) {
                doc.fontSize(9).font('Helvetica').fillColor('#666666').text(details.join(' | '));
              }
              
              // GPA if available
              if (edu.gpa && edu.gpa.trim()) {
                doc.fontSize(9).font('Helvetica').fillColor('#4a4a4a').text(`GPA: ${edu.gpa}`);
              }
            }
            if (index < resumeData.education.length - 1) doc.moveDown(0.4);
          });
          doc.moveDown(1.2);
        }

        const skills = resumeData.skills;
        if (skills) {
          const hasSkills = (skills.technical && skills.technical.length > 0) || 
                           (skills.tools && skills.tools.length > 0) || 
                           (skills.soft && skills.soft.length > 0);
          
          if (hasSkills) {
            // Section header
            doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a').text('SKILLS');
            doc.moveDown(0.1);
            doc.strokeColor('#4a90e2').lineWidth(2)
               .moveTo(50, doc.y)
               .lineTo(150, doc.y)
               .stroke();
            doc.moveDown(0.5);
            
            doc.fontSize(10);
            
            if (skills.technical && skills.technical.length > 0) {
              doc.font('Helvetica-Bold').fillColor('#1a1a1a').text('Technical: ', { continued: true });
              doc.font('Helvetica').fillColor('#2c2c2c').text(skills.technical.join(', '));
              doc.moveDown(0.3);
            }
            if (skills.tools && skills.tools.length > 0) {
              doc.font('Helvetica-Bold').fillColor('#1a1a1a').text('Tools & Technologies: ', { continued: true });
              doc.font('Helvetica').fillColor('#2c2c2c').text(skills.tools.join(', '));
              doc.moveDown(0.3);
            }
            if (skills.soft && skills.soft.length > 0) {
              doc.font('Helvetica-Bold').fillColor('#1a1a1a').text('Soft Skills: ', { continued: true });
              doc.font('Helvetica').fillColor('#2c2c2c').text(skills.soft.join(', '));
            }
            doc.moveDown(1.2);
          }
        }

        if (resumeData.certifications && resumeData.certifications.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('CERTIFICATIONS');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica');
          resumeData.certifications.forEach(cert => {
            doc.text(`• ${cert}`);
          });
          doc.moveDown(1);
        }

        if (resumeData.languages && resumeData.languages.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('LANGUAGES');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(resumeData.languages.join(', '));
        }

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateWord(resumeData, outputPath) {
    try {
      const contact = resumeData.contact || {};
      const sections = [];

      sections.push(
        new Paragraph({
          text: contact.name || 'Candidate Name',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );

      const contactInfo = [
        contact.email,
        contact.phone,
        contact.address || contact.location,
        contact.linkedin,
        contact.github,
        contact.portfolio
      ].filter(Boolean).join(' | ');

      if (contactInfo) {
        sections.push(
          new Paragraph({
            text: contactInfo,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })
        );
      }

      if (resumeData.summary) {
        sections.push(
          new Paragraph({
            text: 'PROFESSIONAL SUMMARY',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: resumeData.summary,
            spacing: { after: 300 }
          })
        );
      }

      if (resumeData.experience && resumeData.experience.length > 0) {
        sections.push(
          new Paragraph({
            text: 'EXPERIENCE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 }
          })
        );

        resumeData.experience.forEach(exp => {
          const duration = exp.duration || `${exp.startDate || ''} - ${exp.endDate || ''}`;
          const company = exp.company ? `${exp.company}` : '';
          const location = exp.location && exp.location.trim() && exp.location !== 'Not specified' ? ` | ${exp.location}` : '';
          
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title || exp.position || exp.company,
                  bold: true
                })
              ],
              spacing: { after: 50 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${company}${location}`,
                  italics: true
                })
              ],
              spacing: { after: 50 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: duration,
                  italics: true
                })
              ],
              spacing: { after: 100 }
            })
          );
          
          if (exp.achievements && Array.isArray(exp.achievements)) {
            exp.achievements.forEach(achievement => {
              sections.push(
                new Paragraph({
                  text: `• ${achievement}`,
                  spacing: { after: 50 }
                })
              );
            });
          } else if (exp.description) {
            sections.push(
              new Paragraph({
                text: exp.description,
                spacing: { after: 100 }
              })
            );
          }
          
          sections.push(
            new Paragraph({
              text: '',
              spacing: { after: 100 }
            })
          );
        });
      }

      if (resumeData.education && resumeData.education.length > 0) {
        sections.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 }
          })
        );

        resumeData.education.forEach(edu => {
          if (typeof edu === 'string') {
            sections.push(
              new Paragraph({
                text: `• ${edu}`,
                spacing: { after: 100 }
              })
            );
          } else {
            const location = edu.location && edu.location.trim() && edu.location !== 'Not specified' ? `, ${edu.location}` : '';
            const gpa = edu.gpa && edu.gpa.trim() ? `, GPA: ${edu.gpa}` : '';
            const eduText = `${edu.degree || ''} - ${edu.institution || ''}${location}${edu.graduationDate ? ` (${edu.graduationDate})` : ''}${gpa}`;
            sections.push(
              new Paragraph({
                text: `• ${eduText.trim()}`,
                spacing: { after: 100 }
              })
            );
          }
        });
      }

      const skills = resumeData.skills;
      if (skills) {
        const hasSkills = (skills.technical && skills.technical.length > 0) || 
                         (skills.tools && skills.tools.length > 0) || 
                         (skills.soft && skills.soft.length > 0);
        
        if (hasSkills) {
          sections.push(
            new Paragraph({
              text: 'SKILLS',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 }
            })
          );
          
          if (skills.technical && skills.technical.length > 0) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Technical: ', bold: true }),
                  new TextRun({ text: skills.technical.join(', ') })
                ],
                spacing: { after: 100 }
              })
            );
          }
          
          if (skills.tools && skills.tools.length > 0) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Tools & Technologies: ', bold: true }),
                  new TextRun({ text: skills.tools.join(', ') })
                ],
                spacing: { after: 100 }
              })
            );
          }
          
          if (skills.soft && skills.soft.length > 0) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Soft Skills: ', bold: true }),
                  new TextRun({ text: skills.soft.join(', ') })
                ],
                spacing: { after: 200 }
              })
            );
          }
        }
      }

      if (resumeData.certifications && resumeData.certifications.length > 0) {
        sections.push(
          new Paragraph({
            text: 'CERTIFICATIONS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 }
          })
        );

        resumeData.certifications.forEach(cert => {
          sections.push(
            new Paragraph({
              text: `• ${cert}`,
              spacing: { after: 100 }
            })
          );
        });
      }

      if (resumeData.languages && resumeData.languages.length > 0) {
        sections.push(
          new Paragraph({
            text: 'LANGUAGES',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: resumeData.languages.join(', ')
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: sections
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      console.error('Word generation error:', error);
      throw new Error(`Failed to generate Word document: ${error.message}`);
    }
  }

  async generateCoverLetterPDF(coverLetterText, candidateName, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = require('fs').createWriteStream(outputPath);
        doc.pipe(stream);

        doc.fontSize(12).font('Helvetica').text(coverLetterText, {
          align: 'justify',
          lineGap: 5
        });

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ResumeExport();
