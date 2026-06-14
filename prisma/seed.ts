import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding high-quality mock challenges...');

  const challenges = [
    // --- SWE CODING ---
    {
      roleTarget: 'SWE',
      type: 'CODING',
      title: 'Optimal Cache Implementation (LRU)',
      description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) methods. Key and value are integers. Both operations should run in O(1) time complexity.',
      starterCode: 'class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass',
      difficulty: 'Medium',
      category: 'Data Structures'
    },
    {
      roleTarget: 'SWE',
      type: 'CODING',
      title: 'Validate Binary Search Tree',
      description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node\'s key. The right subtree of a node contains only nodes with keys greater than the node\'s key.',
      starterCode: '# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\ndef isValidBST(root: Optional[TreeNode]) -> bool:\n    pass',
      difficulty: 'Medium',
      category: 'Algorithms'
    },

    // --- SWE BEHAVIORAL ---
    {
      roleTarget: 'SWE',
      type: 'BEHAVIORAL',
      title: 'Handling Technical Conflict',
      description: 'Describe a situation where you had a major technical disagreement with a teammate or senior engineer. How did you approach the conflict, what data did you use to support your view, and what was the final resolution?',
      difficulty: 'Medium',
      category: 'Conflict Resolution'
    },

    // --- PM BEHAVIORAL ---
    {
      roleTarget: 'PM',
      type: 'BEHAVIORAL',
      title: 'Prioritization Under Pressure',
      description: 'Tell me about a time you had to make a difficult decision to cut a highly requested feature from a product launch. What metrics did you evaluate, how did you communicate this to stakeholders, and what was the impact on the roadmap?',
      difficulty: 'Hard',
      category: 'Product Strategy'
    },

    // --- DATA SCIENCE CODING ---
    {
      roleTarget: 'DATA_SCIENCE',
      type: 'CODING',
      title: 'Linear Regression from Scratch',
      description: 'Implement a basic Linear Regression model using only NumPy. You must provide a fit(X, y) method to calculate coefficients using the Normal Equation and a predict(X) method.',
      starterCode: 'import numpy as np\n\nclass LinearRegression:\n    def fit(self, X, y):\n        pass\n\n    def predict(self, X):\n        pass',
      difficulty: 'Hard',
      category: 'Machine Learning'
    }
  ];

  for (const challenge of challenges) {
    await prisma.mockChallenge.create({
      data: challenge as any
    });
  }

  console.log('✅ Seeding complete! 5 high-quality challenges added to Supabase.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
