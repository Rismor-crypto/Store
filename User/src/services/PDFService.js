
export class PDFService {

    async generatePDF(element, filename = 'order_receipt.pdf') {
      if (!element) {
        throw new Error('No element provided for PDF generation');
      }
    
      try {
        // Import html2pdf dynamically
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;
    
        // Set configuration options
        const options = {
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight,
            logging: false,
            onclone: (clonedDoc) => {
              // Make sure the cloned element has explicit width
              const clonedElement = clonedDoc.querySelector('.invoice-container');
              if (clonedElement) {
                clonedElement.style.width = `${element.offsetWidth}px`;
                // Remove any max-height constraints in the clone
                clonedElement.style.maxHeight = 'none';
                clonedElement.style.overflow = 'visible';
              }
            }
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        };
    
        // Generate and save PDF
        await html2pdf().from(element).set(options).save();
        return true;
      } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
      }
    }
    
    getItemTotal(item) {
      if (item.discount && item.discount > 0) {
        const discountAmount = item.price * (item.discount / 100);
        return (item.price - discountAmount) * item.quantity;
      }
      return item.price * item.quantity;
    }
    
    calculateSubtotal(items) {
      return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    calculateTotalDiscount(items) {
      return items.reduce((sum, item) => {
        if (item.discount && item.discount > 0) {
          const discountAmount = item.price * (item.discount / 100) * item.quantity;
          return sum + discountAmount;
        }
        return sum;
      }, 0);
    }
  }
  
  export default new PDFService();