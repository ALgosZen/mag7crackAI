// src/lib/presetData.ts
/**
 * Interview Preset Mock Questions
 * Standard template challenges for Coding, System Design layouts,
 * and leadership-oriented Behavioral candidate interviews.
 */


import { PresetProblem, PresetBehavioralQuestion } from "../types.js";

export const PRESET_PROBLEMS: PresetProblem[] = [
  {
    id: "problem_1",
    title: "Linked List Cycle Detection",
    difficulty: "Easy",
    description: `Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the \`next\` pointer. Internally, \`pos\` is used to denote the index of the node that tail's \`next\` pointer is connected to. **Note that \`pos\` is not passed as a parameter.**

Return \`true\` if there is a cycle in the linked list. Otherwise, return \`false\`.

**Example:**
- **Input:** head = [3,2,0,-4], pos = 1
- **Output:** true
- **Explanation:** There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).`,
    starterCode: `def hasCycle(head):\n    # Write your optimal O(N) time and O(1) space solution here\n    slow = head\n    fast = head\n    \n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n            \n    return False`
  },
  {
    id: "problem_2",
    title: "Merge Intervals",
    difficulty: "Medium",
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

**Example 1:**
- **Input:** intervals = [[1,3],[2,6],[8,10],[15,18]]
- **Output:** [[1,6],[8,10],[15,18]]
- **Explanation:** Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

**Example 2:**
- **Input:** intervals = [[1,4],[4,5]]
- **Output:** [[1,5]]
- **Explanation:** Intervals [1,4] and [4,5] are considered overlapping.`,
    starterCode: `def merge(intervals):\n    # Sort intervals, then slide and merge in-place.\n    if not intervals:\n        return []\n        \n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    \n    for current in intervals[1:]:\n        prev = merged[-1]\n        if current[0] <= prev[1]:\n            prev[1] = max(prev[1], current[1])\n        else:\n            merged.append(current)\n            \n    return merged`
  },
  {
    id: "problem_3",
    title: "LRU Cache Design",
    difficulty: "Hard",
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(capacity: int)\` Initialize the LRU cache with positive size \`capacity\`.
- \`get(key: int) -> int\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`put(key: int, value: int) -> None\` Update the value of the \`key\` if the key exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in **$O(1)$ average time complexity**.

**Example:**
- **Input:** Put(1, 1), Put(2, 2), Get(1), Put(3, 3) (evicts 2), Get(2) -> -1`,
    starterCode: `class LRUCache:\n    def __init__(self, capacity: int):\n        # Use a hash map + doubly linked list for O(1) operations\n        self.capacity = capacity\n        self.cache = {} # key -> Node\n        \n    def get(self, key: int) -> int:\n        return -1\n        \n    def put(self, key: int, value: int) -> None:\n        path = None`
  }
];

export const PRESET_BEHAVIORAL_QUESTIONS: PresetBehavioralQuestion[] = [
  {
    id: "bh_q1",
    category: "Conflict Resolution & Teamwork",
    questionText: "Describe a situation when you had a disagreement with a technical decision made by a peer or manager. How did you handle it, and what was the resolution?"
  },
  {
    id: "bh_q2",
    category: "Overcoming Adversity / Failure",
    questionText: "Tell me about a time you worked on a high-impact project that ultimately failed to launch or meet expectations. What went wrong, what was your role, and what lessons did you apply to future systems?"
  },
  {
    id: "bh_q3",
    category: "Leading Under Ambiguity",
    questionText: "Give me an example of a time when you had to make an important architectural decision under tight time constraints and massive product ambiguity. How did you structure your reasoning?"
  }
];

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

