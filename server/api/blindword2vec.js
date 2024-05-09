const { spawn } = require('child_process');

// Create the Python process at the module level
const pythonProcess = spawn('python', ['blindword2vec.py']);

export async function calculateSimilarity(wordList1, wordList2, score) {
    for (let word1 of wordList1) {
        let totalSimilarity = 0;

        for (let word2 of wordList2) {
            try {
                const similarity = await new Promise((resolve, reject) => {
                    pythonProcess.stdin.write(JSON.stringify({ word1, word2 }) + '\n');

                    pythonProcess.stdout.once('data', (data) => {
                        const similarity = parseFloat(data.toString());
                        if (isNaN(similarity)) {
                            reject('Failed to calculate similarity');
                        } else {
                            resolve(similarity);
                        }
                    });

                    pythonProcess.stderr.once('data', (data) => {
                        reject('Error from Python process: ' + data.toString());
                    });
                });

                totalSimilarity += similarity;
            } catch (error) {
                console.error(`Failed to calculate similarity between "${word1}" and "${word2}":`, error);
                return false; // If an error occurs, return false
            }
        }

        if (totalSimilarity > score) {
            return true; // If the total similarity for this word is greater than the score, return true
        }
    }

    return false; // If no word had a total similarity greater than the score, return false
}