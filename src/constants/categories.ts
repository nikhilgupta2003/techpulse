import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'ai',
    name: 'AI',
    description: 'Artificial Intelligence, Machine Learning, and Neural Networks.',
    subcategories: ['Introduction', 'LLMs', 'Computer Vision', 'NLP', 'Generative AI', 'Robotics', 'General']
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Infrastructure, CI/CD, and Automation.',
    subcategories: ['Introduction', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Monitoring', 'General']
  },
  {
    id: 'web-dev',
    name: 'Web Dev',
    description: 'Frontend, Backend, and Fullstack Web Development.',
    subcategories: ['Introduction', 'React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'General']
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    description: 'AWS, Azure, GCP, and Serverless architectures.',
    subcategories: ['Introduction', 'AWS', 'Azure', 'GCP', 'Serverless', 'Cloud Security', 'General']
  },
  {
    id: 'cyber-security',
    name: 'Cyber Security',
    description: 'Network Security, Ethical Hacking, and Data Protection.',
    subcategories: ['Introduction', 'Penetration Testing', 'Network Security', 'Cryptography', 'Identity Management', 'General']
  },
  {
    id: 'general',
    name: 'General',
    description: 'General tech discussions, career advice, and industry news.',
    subcategories: ['Introduction', 'Career', 'News', 'Tutorials', 'Opinion', 'General']
  }
];
