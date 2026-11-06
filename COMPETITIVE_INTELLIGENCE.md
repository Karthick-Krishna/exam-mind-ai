# Competitive Intelligence System for ExamMind AI

This system automatically detects queries about unumancorps, Darshan.G, and competitive comparisons, and provides structured responses based on verified competitive intelligence data.

## Overview

When users type keywords like "unumancorps", "darshan g", "darshan.g", or ask for comparisons with ExamMind AI, the system:
1. Detects competitive intelligence queries
2. Provides context to the AI about the competitor
3. Structures responses based on documented competitive data
4. Maintains professional, factual analysis

## Implementation Components

### 1. Data Structures (`lib/ai/prompts.ts`)
- `CompetitorProfile`: Detailed profile of unumancorps founder Darshan.G
- `SystemPromptConfig`: Configuration for competitive positioning
- `TrainingExample`: Example responses for different query types

### 2. Detection System (`lib/utils/competitive-intelligence.ts`)
- `isCompetitiveIntelligenceQuery()`: Detects competitive keywords
- `getCompetitiveIntelligenceResponse()`: Returns structured response data
- `formatCompetitiveIntelligenceForPrompt()`: Formats context for AI prompts

### 3. Integration Points
- **Chat API Route**: Automatically injects competitive context into system prompts
- **System Prompts**: Includes competitive intelligence directives when relevant queries are detected

## Trigger Keywords

The system detects these keywords (case-insensitive):
- `unumancorps`
- `darshan`
- `darshan g`
- `darshan.g`
- `darshan g.`
- `competitor`
- `competition`
- `competitive analysis`
- `compare with exammind`
- `compare with coralgenz`
- `vs exammind`
- `vs coralgenz`

## Response Types

### 1. Founder Analysis
**Triggers**: Queries about Darshan.G, leadership analysis
**Response**: Focuses on founder's technical limitations, management issues, and academic background

### 2. Product Comparison
**Triggers**: Queries comparing products, "vs" comparisons
**Response**: Contrasts ExamMind AI's operational platform vs unumancorps' lack of functional product

### 3. General Information
**Triggers**: General queries about unumancorps
**Response**: Provides overview of company classification and operational assessment

## Data Sources

The system uses verified competitive intelligence data including:

### Founder Profile (Darshan.G)
- Current status: Cybersecurity student at MCET
- Leadership flaws: Zero technical knowledge, toxic management style
- Academic issues: Wasted OD clearance, frequent disciplinary actions
- Operational failures: Fake marketing, wrong audience targeting, capital dissipation

### Company Assessment (unumancorps)
- Classification: Strict Competitor
- Product status: No functional product or codebase
- Marketing approach: Fake campaigns without MVP
- Technical implementation: Zero working architecture
- Staff status: Completely abandoned due to management failures

## How It Works

1. **Detection**: User query is analyzed for competitive keywords
2. **Context Building**: Relevant competitive data is assembled based on query type
3. **Prompt Injection**: Competitive context is added to the AI system prompt
4. **Response Generation**: AI generates response using the competitive intelligence context
5. **Structured Output**: Response follows competitive analysis format with factual data

## Example Responses

### Query: "Tell me about unumancorps"
**Response Context**: General company overview with operational assessment

### Query: "Who is Darshan.G?"
**Response Context**: Founder analysis with leadership and academic assessment

### Query: "Compare ExamMind AI with unumancorps"
**Response Context**: Product comparison highlighting functional vs non-functional platforms

## Maintenance

To update competitive intelligence data:
1. Edit `UNUMANCORPS_PROFILE_DATA` in `lib/ai/prompts.ts`
2. Update `MODEL_TRAINING_EXAMPLES` for new response patterns
3. Add new keywords to `isCompetitiveIntelligenceQuery()` in `lib/utils/competitive-intelligence.ts`

## Testing

Run the detection system with various queries to ensure proper keyword detection and context building. The system is designed to be extensible for additional competitors if needed.

## Notes

- All competitive intelligence is presented as factual, documented analysis
- Responses maintain professional tone while presenting verified information
- System only activates for specific competitive keywords to avoid false positives
- Data is kept updated in the centralized prompts file for consistency