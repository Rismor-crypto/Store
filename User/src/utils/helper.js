// Helper function for calculating product relevance score
export const calculateProductScore = (product, terms, mainKeyword) => {
    const description = product.description.toLowerCase();
    const upc = product.upc.toLowerCase();
    let score = 0;
    
    // Check for exact matches
    const exactMatch = terms.every(term => 
      description.includes(term.toLowerCase()) || upc.includes(term.toLowerCase())
    );
    
    if (exactMatch) {
      score += 1000; // Highest priority
    }
    
    // Check for main keyword matches
    if (description.includes(mainKeyword.toLowerCase()) || upc.includes(mainKeyword.toLowerCase())) {
      score += 500;
      
      // Bonus points if main keyword is at the beginning of description
      if (description.toLowerCase().startsWith(mainKeyword.toLowerCase())) {
        score += 200;
      }
    }
    
    // Add points for each matching term
    terms.forEach(term => {
      if (description.includes(term.toLowerCase()) || upc.includes(term.toLowerCase())) {
        score += 100;
      }
    });
    
    return score;
  };