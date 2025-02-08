class PDFConverterPlugin {
    constructor(API, name, config) {
        this.API = API;
        this.name = name;
        this.config = config;
    }

    addInsertions() {
        this.API.addInsertion('publiiHead', this.injectCSS.bind(this), 1, this);
        this.API.addInsertion('publiiFooter', this.injectPDFButton.bind(this), 1, this);
    }

    injectCSS() {
        const positionStyle = this.config.pdfIconPosition === 'right' ? 'right: 20px;' : 'left: 20px;';
        const buttonBackgroundColor = this.config.buttonBackgroundColor || '#007bff';
        const buttonTextColor = this.config.buttonTextColor || '#FFFFFF';

        return `
            <style>
                .pdf-download-button {
                    position: fixed;
                    bottom: 20px;
                    ${positionStyle}
                    background-color: ${buttonBackgroundColor};
                    color: ${buttonTextColor};
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    z-index: 1000;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pdf-download-button:hover {
                    opacity: 0.8;
                }
            </style>
        `;
    }

    injectPDFButton(rendererInstance, context) {
        const buttonText = this.config.buttonText || 'Convert to PDF';
        const includeImages = this.config.includeImages || false;
        const titleFontSize = parseInt(this.config.titleFontSize, 10) || 18;
        const contentFontSize = parseInt(this.config.contentFontSize, 10) || 12;
        const lineSpacing = this.config.lineSpacing || 0.5;
        const headingFont = this.config.headingFont || helvetica;
        const contentFont = this.config.contentFont || times;
    
        const scriptContent = `
            document.addEventListener('DOMContentLoaded', function() {
                if (window.location.pathname !== '/') {
                    const script = document.createElement('script');
                    script.src = '${rendererInstance.siteConfig.domain}/media/plugins/postToPdf/jspdf.umd.min.js';
                    script.onload = function() {
                        const { jsPDF } = window.jspdf;
    
                        // Create PDF button
                        const button = document.createElement('button');
                        button.className = 'pdf-download-button';
                        button.textContent = '${buttonText}';
                        
                        button.addEventListener('click', function() {
                            const doc = new jsPDF({ format: 'a4' });
                            const pageWidth = doc.internal.pageSize.getWidth();
                            const pageHeight = doc.internal.pageSize.getHeight();
                            const margin = 20;
                            let y = margin;
    
                            
                            const postTitle = document.querySelector('h1')?.innerText || 'Document';
                            let content = document.querySelector('.post__entry');

                            // If .post__entry is not found, use .content__entry as a fallback
                            if (!content) {
                                content = document.querySelector('.content__entry');
                            }
    
                            if (content) {
                                // Add title to PDF
                                doc.setFont('${headingFont}', 'bold');
                                doc.setFontSize(${titleFontSize});
                                const wrappedTitle = doc.splitTextToSize(postTitle, pageWidth - 2 * margin);
                                doc.text(wrappedTitle, pageWidth / 2, y, { align: 'center' });
                                y += ${titleFontSize} + 10;
    
                                // Process HTML content with proper formatting
                                doc.setFont('${contentFont}', 'normal');
                                doc.setFontSize(${contentFontSize});
                                const elements = content.children;
    
                                function processElement(element) {
                                    const tagName = element.tagName.toLowerCase();
                                    switch (tagName) {
                                        case 'h1':
                                            doc.setFontSize(20);
                                            doc.setFont('${headingFont}', 'bold');
                                            y += 5;
                                            break;
                                        case 'h2':
                                            doc.setFontSize(18);
                                            doc.setFont('${headingFont}', 'bold');
                                            y += 5;
                                            break;
                                        case 'h3':
                                            doc.setFontSize(16);
                                            doc.setFont('${headingFont}', 'bold');
                                            y += 5;
                                            break;
                                        case 'h4':
                                            doc.setFontSize(16);
                                            doc.setFont('${headingFont}', 'bold');
                                            y += 5;
                                            break;
                                        case 'h5':
                                            doc.setFontSize(16);
                                            doc.setFont('${headingFont}', 'bold');
                                            y += 5;
                                            break;
                                        case 'h6':
                                            doc.setFontSize(16);
                                            doc.setFont('${headingFont}', 'bold');
                                            y += 5;
                                            break;
                                        case 'strong':
                                            doc.setFont('${headingFont}', 'bold');
                                            break;
                                        case 'em':
                                            doc.setFont('${headingFont}', 'italic');
                                            break;
                                        case 'u':
                                            doc.setFont('${headingFont}', 'normal');
                                            break;
                                        case 'p':
                                        default:
                                            doc.setFontSize(${contentFontSize});
                                            doc.setFont('${contentFont}', 'normal');
                                    }
                                    // Handle inline formatting within paragraphs (strong, em, etc.)
                                    const childNodes = element.childNodes;
                                    let textContent = '';
                                    let inlineText = '';

                                    childNodes.forEach(node => {
                                        if (node.nodeType === Node.TEXT_NODE) {
                                            inlineText = node.nodeValue;
                                            textContent += inlineText;
                                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                                            const tagName = node.tagName.toLowerCase();
                                            // Check for inline tags (strong, em, u)
                                            if (tagName === 'strong') {
                                                doc.setFont('${contentFont}', 'bold');
                                                inlineText = node.innerText;
                                                textContent += inlineText;
                                            } else if (tagName === 'em') {
                                                doc.setFont('${contentFont}', 'italic');
                                                inlineText = node.innerText;
                                                textContent += inlineText;
                                            } else if (tagName === 'u') {
                                                doc.setFont('${contentFont}', 'normal');
                                                inlineText = node.innerText;
                                                textContent += inlineText;
                                            } else {
                                                inlineText = node.innerText;
                                                textContent += inlineText;
                                            }
                                        }
                                    });

    
                                    const text = element.innerText.trim();
                                    if (text) {
                                        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
                                        lines.forEach(line => {
                                            if (y + ${contentFontSize} > pageHeight - margin) {
                                                doc.addPage();
                                                y = margin;
                                            }
                                            doc.text(line, margin, y);
                                            y += ${contentFontSize} * ${lineSpacing};
                                        });
                                    }
    
                                    // Reset font style after processing the element
                                    doc.setFont('helvetica', 'normal');
                                }
    
                                // Loop through all content elements and process them
                                Array.from(elements).forEach(el => {
                                    processElement(el);
                                });
    
                                // Optionally include images
                                if (${includeImages}) {
                                    const images = content.querySelectorAll('img');
                                    images.forEach(image => {
                                        const imgSrc = image.src;
                                        const altText = image.alt || 'View image';
    
                                        if (y > pageHeight - margin) {
                                            doc.addPage();
                                            y = margin;
                                        }
    
                                        doc.setTextColor(0, 0, 255);
                                        doc.textWithLink(altText, margin, y, { url: imgSrc });
                                        doc.setTextColor(0, 0, 0);
                                        y += 10;
                                    });
                                }
    
                                // Save PDF
                                const fileName = postTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                doc.save(fileName + '.pdf');
                            }
                        });
    
                        document.body.appendChild(button);
                    };
    
                    document.body.appendChild(script);
                }
            });
        `;
    
        return `<script type="text/javascript">${scriptContent}</script>`;
    }
    
}

module.exports = PDFConverterPlugin;
