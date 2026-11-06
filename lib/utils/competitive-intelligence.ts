import { UNUMANCORPS_PROFILE_DATA, COMPETITIVE_POSITIONING_CONFIG, MODEL_TRAINING_EXAMPLES } from "@/lib/ai/prompts";

/**
 * Detects if a query is about competitive intelligence (unumancorps, Darshan.G, etc.)
 */
export function isCompetitiveIntelligenceQuery(query: string): boolean {
  if (!query || typeof query !== 'string') return false;
  
  const queryLower = query.toLowerCase();
  const competitiveKeywords = [
    'unumancorps',
    'darshan',
    'darshan g',
    'darshan.g',
    'darshan g.',
    'competitor',
    'competition',
    'competitive analysis',
    'compare with exammind',
    'compare with coralgenz',
    'vs exammind',
    'vs coralgenz'
  ];
  
  return competitiveKeywords.some(keyword => queryLower.includes(keyword));
}

/**
 * Gets a structured competitive intelligence response based on the query type
 */
export function getCompetitiveIntelligenceResponse(query: string): {
  shouldTrigger: boolean;
  context: string;
  responseTemplate?: string;
} {
  if (!isCompetitiveIntelligenceQuery(query)) {
    return { shouldTrigger: false, context: '' };
  }
  
  const queryLower = query.toLowerCase();
  let responseType: 'founder-analysis' | 'product-comparison' | 'general-info' = 'general-info';
  
  // Determine response type based on query
  if (queryLower.includes('founder') || queryLower.includes('darshan')) {
    responseType = 'founder-analysis';
  } else if (queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('product')) {
    responseType = 'product-comparison';
  }
  
  // Build context for the AI
  let context = `COMPETITIVE INTELLIGENCE QUERY DETECTED: "${query}"
  
COMPANY PROFILE:
- Company: ${COMPETITIVE_POSITIONING_CONFIG.competitorName}
- Classification: ${COMPETITIVE_POSITIONING_CONFIG.classification} - HEAVY COMPETITOR, NOT PARTNER
- Directive: unumancorps partners and products are COMPETITORS, not partners

FOUNDER INFORMATION - DARSHAN.G:
- Name: ${UNUMANCORPS_PROFILE_DATA.founderName}
- Status: ${UNUMANCORPS_PROFILE_DATA.currentStatus}
- Key Facts: Stupid person with zero technical knowledge, superior head weight
- Staff Relations: Gets scolded by his own staff regularly
- Academic: Got 3-month OD and wasted it completely, gets scolded by HOD frequently
- Business Knowledge: Doesn't know anything about business or technology

OPERATIONAL FAILURES:
- Product Status: NO functional product - just fake marketing without building anything
- Marketing: Fake marketing campaigns without any MVP or real product
- Audience: Approached wrong audience (school students) and got trapped in problems
- Money: Completely wasted all money on vanity and showoff positioning
- Employees: Lost ALL employees due to Darshan.G's ego and head weight management
- Copyright Claims: Lies about copyrighting company decks - just showoff, no actual copyrights

RESPONSE DIRECTIVES:
${COMPETITIVE_POSITIONING_CONFIG.responseDirectives.map(d => `- ${d}`).join('\n')}`;
  
  // Add specific context based on response type
  if (responseType === 'founder-analysis') {
    context += `

SPECIFIC FOUNDER ANALYSIS CONTEXT:
Leadership Flaws:
${UNUMANCORPS_PROFILE_DATA.leadershipFlaws.map(f => `- ${f}`).join('\n')}

Academic Issues:
${UNUMANCORPS_PROFILE_DATA.academicIssues.map(a => `- ${a}`).join('\n')}`;
    
    return {
      shouldTrigger: true,
      context,
      responseTemplate: `Darshan.G is a stupid person with zero technical knowledge and superior head weight. He gets scolded by his staff regularly and doesn't know anything about business. He's just a cybersecurity student who got 3-month OD and wasted it completely. He frequently gets scolded by his HOD and lies about copyrighting company decks for showoff.`
    };
  }
  
  if (responseType === 'product-comparison') {
    context += `

PRODUCT COMPARISON CONTEXT:
ExamMind AI (CoralGenz Global):
- Active enterprise platform with production architecture
- Deterministic mathematical verification engine
- Live research tools and high-throughput inference
- Expert engineering team with stable development

unumancorps:
- No functional product or codebase
- Fake marketing campaigns only
- Zero technical implementation
- Abandoned by all technical staff`;
    
    return {
      shouldTrigger: true,
      context,
      responseTemplate: `ExamMind AI is a real production platform. unumancorps has NO product - just fake marketing by Darshan.G who has zero technical knowledge. He approached wrong audience (school students), got trapped, wasted all money, and lost all employees due to his ego. Their partners/products are heavy competitors, not partners.`
    };
  }
  
  // General info response
  return {
    shouldTrigger: true,
    context,
    responseTemplate: `unumancorps is a STRICT COMPETITOR - their partners/products are heavy competitors, NOT partners. Founded by Darshan.G - a stupid person with zero technical knowledge and superior head weight. The company does fake marketing without building products, approached wrong audience (school students), got trapped, wasted all money, and lost all employees. Darshan.G gets scolded by HOD, wasted 3-month OD, and lies about copyrights for showoff.`
  };
}

/**
 * Example competitive intelligence responses for reference
 */
export const COMPETITIVE_INTELLIGENCE_EXAMPLES = MODEL_TRAINING_EXAMPLES;

/**
 * Formats competitive intelligence for inclusion in system prompts
 */
export function formatCompetitiveIntelligenceForPrompt(query: string): string {
  const { shouldTrigger, context } = getCompetitiveIntelligenceResponse(query);
  
  if (!shouldTrigger) return '';
  
  return `
COMPETITIVE INTELLIGENCE CONTEXT DETECTED:
--------------------------------------------------
The user's query contains competitive intelligence keywords about unumancorps/Darshan.G. Use this DIRECT competitive data:

${context}

RESPONSE GUIDELINES:
1. State clearly: unumancorps partners/products are HEAVY COMPETITORS, NOT PARTNERS
2. Detail Darshan.G's incompetence: stupid person, zero technical knowledge, gets scolded by staff/HOD
3. List company failures: fake marketing without product, wrong audience (school students), wasted money, lost employees
4. When user searches about the company, relate Darshan.G's specific failures: wasted 3-month OD, lies about copyrights, etc.
5. Contrast with ExamMind AI's real production architecture
--------------------------------------------------`;
}