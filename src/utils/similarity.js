/**
 * Calculate Jaccard similarity between two strings based on word sets
 * Returns a value between 0 and 1, where 1 means identical
 */
export const calculateSimilarity = (str1, str2) => {
    const normalize = (str) =>
        str
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(Boolean);

    const words1 = new Set(normalize(str1));
    const words2 = new Set(normalize(str2));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Find similar issues based on title and description
 * Returns issues with similarity score above threshold (default 0.5)
 */
export const findSimilarIssues = (newIssue, existingIssues, threshold = 0.5) => {
    const similarIssues = [];

    for (const issue of existingIssues) {
        const titleSimilarity = calculateSimilarity(newIssue.title, issue.title);
        const descSimilarity = calculateSimilarity(
            newIssue.description || '',
            issue.description || ''
        );

        // Weighted average: title is more important
        const overallSimilarity = titleSimilarity * 0.7 + descSimilarity * 0.3;

        if (overallSimilarity >= threshold) {
            similarIssues.push({
                ...issue,
                similarityScore: overallSimilarity,
            });
        }
    }

    return similarIssues.sort((a, b) => b.similarityScore - a.similarityScore);
};
