import type { ResumeData, ResumeTheme } from '../types/resume';

export const SAMPLE_SOFTWARE_ENGINEER: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    github: 'https://github.com/alexmorgan',
  },
  summary:
    'Results-driven Senior Full Stack Engineer with 6+ years of experience architecting distributed cloud applications and high-throughput microservices. Proven track record of reducing latency by 42% and scaling SaaS platforms to 2M+ active users. Passionate about TypeScript, React, Node.js, and cloud-native system design.',
  experience: [
    {
      id: 'exp-1',
      company: 'CloudScale Technologies',
      role: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: 'Present',
      current: true,
      highlights: [
        'Architected and led the migration of a monolithic API into modular microservices using Node.js, TypeScript, and AWS Lambda, reducing average p99 latency by 42%.',
        'Spearheaded the redesign of the core web app using Next.js and Tailwind CSS, increasing page load speed by 65% and boosting conversion rate by 18%.',
        'Implemented end-to-end CI/CD pipelines with GitHub Actions and Docker, reducing deployment cycle times from 45 minutes to 7 minutes.',
        'Mentored 5 junior and mid-level engineers through code reviews, design docs, and weekly tech talks on scalable system design.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Apex Data Systems',
      role: 'Full Stack Software Engineer',
      location: 'Austin, TX',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      highlights: [
        'Engineered real-time collaboration dashboards using React, GraphQL, and WebSockets, supporting 50,000+ concurrent active enterprise users.',
        'Optimized complex PostgreSQL and Redis queries, decreasing database server memory usage by 34% and cutting query response times by 120ms.',
        'Collaborated with cross-functional product and design teams to deliver 14 major feature releases on schedule with 99.9% uptime SLA.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2015-08',
      endDate: '2019-05',
      gpa: '3.85 / 4.0',
    },
  ],
  skills: [
    {
      id: 'skills-languages',
      name: 'Programming Languages',
      skills: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'Go', 'SQL'],
    },
    {
      id: 'skills-frontend',
      name: 'Frontend & UI',
      skills: ['React', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'HTML5/CSS3', 'Vite'],
    },
    {
      id: 'skills-backend',
      name: 'Backend & Cloud',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'GraphQL', 'AWS (S3, Lambda, ECS)', 'Docker'],
    },
    {
      id: 'skills-tools',
      name: 'Tools & DevOps',
      skills: ['Git', 'GitHub Actions', 'Jest', 'Cypress', 'Terraform', 'RESTful APIs'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'OpenTelemetry Observability Dashboard',
      subtitle: 'Real-time distributed tracing tool',
      description:
        'Built an open-source observability panel visualizer monitoring trace spans and request bottlenecks across distributed microservices. Featured on Hacker News with 1,200+ GitHub stars.',
      technologies: ['React', 'TypeScript', 'D3.js', 'Go', 'Docker'],
      link: 'https://otel-dashboard-demo.dev',
      github: 'https://github.com/alexmorgan/otel-dashboard',
    },
    {
      id: 'proj-2',
      title: 'DevCache CLI',
      subtitle: 'High-speed local cache proxy',
      description:
        'Developed a local caching proxy for Docker layer downloads, saving engineering teams an average of 4.5 developer hours per week.',
      technologies: ['Go', 'SQLite', 'Docker API'],
      github: 'https://github.com/alexmorgan/devcache',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Application Developer (CKAD)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2022',
    },
  ],
};

export const SAMPLE_PRODUCT_MANAGER: ResumeData = {
  personalInfo: {
    fullName: 'Sarah Jenkins',
    jobTitle: 'Senior Product Manager',
    email: 'sarah.jenkins@example.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    website: 'https://sarahjenkins.io',
    linkedin: 'https://linkedin.com/in/sarahjenkins',
    github: '',
  },
  summary:
    'Strategic Senior Product Manager with 7+ years of experience leading B2B SaaS product strategy from zero-to-one and scaling ARR from \$5M to \$28M. Proven success aligning executive stakeholders, managing agile roadmaps, and leveraging data-driven experimentation to maximize retention and customer lifetime value.',
  experience: [
    {
      id: 'exp-1',
      company: 'FinSphere Analytics',
      role: 'Lead Product Manager - Enterprise Platform',
      location: 'New York, NY',
      startDate: '2021-04',
      endDate: 'Present',
      current: true,
      highlights: [
        'Defined 3-year enterprise product roadmap, aligning cross-functional teams across engineering, UX, sales, and marketing to launch FinSphere 3.0.',
        'Spearheaded automated onboarding workflow that reduced customer time-to-value from 24 days to 4 days, resulting in a 32% decrease in 90-day churn.',
        'Conducted 120+ customer discovery interviews with Fortune 500 CFOs, validating new AI audit capabilities that generated \$4.2M in pipeline in Q1.',
      ],
    },
    {
      id: 'exp-2',
      company: 'GrowthPulse Solutions',
      role: 'Product Manager',
      location: 'Boston, MA',
      startDate: '2018-06',
      endDate: '2021-03',
      current: false,
      highlights: [
        'Managed core experimentation roadmap running 40+ A/B tests per year, achieving an overall 22% uplift in checkout funnel conversion.',
        'Introduced automated Product-Led Growth (PLG) trial flows, lifting free-to-paid conversion rate from 3.1% to 6.8%.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Columbia University',
      degree: 'Master of Business Administration (MBA)',
      fieldOfStudy: 'Strategy & Innovation',
      location: 'New York, NY',
      startDate: '2016-09',
      endDate: '2018-05',
    },
    {
      id: 'edu-2',
      institution: 'Cornell University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Information Science',
      location: 'Ithaca, NY',
      startDate: '2012-08',
      endDate: '2016-05',
    },
  ],
  skills: [
    {
      id: 'skills-strategy',
      name: 'Product Strategy',
      skills: ['Roadmap Planning', 'Product Discovery', 'Go-To-Market (GTM)', 'A/B Testing', 'OKRs & KPIs'],
    },
    {
      id: 'skills-analytics',
      name: 'Analytics & Tools',
      skills: ['Amplitude', 'Mixpanel', 'SQL', 'Tableau', 'Jira', 'Figma', 'Segment'],
    },
    {
      id: 'skills-methodology',
      name: 'Methodologies',
      skills: ['Agile / Scrum', 'Design Thinking', 'Customer Journey Mapping', 'Unit Economics'],
    },
  ],
  projects: [],
  certifications: [
    {
      id: 'cert-1',
      name: 'Pragmatic Institute Certified (PMC-III)',
      issuer: 'Pragmatic Institute',
      date: '2020',
    },
  ],
};

export const DEFAULT_THEME: ResumeTheme = {
  template: 'classic',
  primaryColor: '#2563eb', // Blue 600
  fontFamily: 'inter',
  spacing: 'normal',
};

export const SAMPLE_JOB_DESCRIPTION = `
Senior Software Engineer - Full Stack
Company: TechCorp Global
Location: San Francisco, CA / Remote

About the Role:
We are seeking a high-performing Senior Full Stack Software Engineer to build and scale our high-throughput customer platform. You will design, build, and deploy resilient microservices and intuitive web interfaces.

Key Responsibilities:
- Design and develop scalable microservices using Node.js, TypeScript, and REST / GraphQL APIs.
- Build responsive, accessible, high-performance web frontends with React and modern CSS.
- Optimize database queries and schemas with PostgreSQL and Redis.
- Architect and manage cloud infrastructure on AWS (Lambda, ECS, S3).
- Implement CI/CD deployment pipelines using Docker and GitHub Actions.
- Collaborate with product managers, designers, and engineering leadership to deliver high-impact features.
- Mentor junior engineers and champion engineering excellence.

Requirements:
- 5+ years of software development experience with TypeScript, React, and Node.js.
- Strong knowledge of microservices architecture, REST APIs, and database optimization.
- Experience with AWS cloud services and containerization (Docker).
- Strong track record of quantifying results and delivering measurable business impact.
- Excellent communication and collaborative problem-solving skills.
`;

export const SAMPLE_DATA_SCIENTIST_FRESHER: ResumeData = {
  personalInfo: {
    fullName: 'Priya Sharma',
    jobTitle: 'Aspiring Data Scientist / AI Analyst',
    email: 'priya.sharma@example.com',
    phone: '+1 (555) 432-8765',
    location: 'San Jose, CA',
    website: 'https://priyasharma.datascience.io',
    linkedin: 'https://linkedin.com/in/priya-sharma-ds',
    github: 'https://github.com/priyasharma-ai',
  },
  summary:
    'Passionate, detail-oriented Data Science graduate with hands-on proficiency in Python, SQL, exploratory data analysis, and predictive machine learning. Proven ability to build end-to-end data pipelines and evaluate predictive models with 91%+ ROC-AUC. Kaggle Competitions contributor ranked in top 12% across tabular benchmarks.',
  experience: [], // Empty work experience to demonstrate fresher scoring without penalty
  education: [
    {
      id: 'edu-ds-1',
      institution: 'San Jose State University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Data Science & Applied Statistics',
      location: 'San Jose, CA',
      startDate: '2020-08',
      endDate: '2024-05',
      gpa: '3.84 / 4.0',
    },
  ],
  skills: [
    {
      id: 'skills-ds-core',
      name: 'Core Data Science & ML',
      skills: [
        'Python',
        'SQL (PostgreSQL, MySQL)',
        'Pandas',
        'NumPy',
        'Scikit-Learn',
        'Exploratory Data Analysis (EDA)',
        'Statistics & Probability',
        'Hypothesis Testing',
        'Feature Engineering',
        'Model Evaluation',
      ],
    },
    {
      id: 'skills-ds-viz',
      name: 'Data Visualization & Analytics',
      skills: ['Matplotlib', 'Seaborn', 'Tableau', 'Jupyter Notebooks', 'Power BI'],
    },
    {
      id: 'skills-ds-tools',
      name: 'Developer Tools & Platforms',
      skills: ['Git', 'GitHub', 'Docker', 'Linux', 'REST APIs'],
    },
  ],
  projects: [
    {
      id: 'proj-ds-1',
      title: 'Customer Churn Prediction & Retention Dashboard',
      subtitle: 'End-to-End Classification Pipeline',
      description:
        'Engineered an end-to-end machine learning classification pipeline analyzing 12,000+ telecom customer records to identify high-risk churn patterns. Performed exploratory data analysis (EDA), mitigated severe class imbalance with SMOTE, and selected 14 behavioral features. Trained Random Forest and XGBoost classifiers, achieving 91.8% ROC-AUC and 84% recall. Deployed a real-time Streamlit dashboard enabling business users to test retention scenarios.',
      technologies: ['Python', 'Pandas', 'Scikit-Learn', 'XGBoost', 'Streamlit', 'Matplotlib'],
      github: 'https://github.com/priyasharma-ai/telecom-churn-ml',
      link: 'https://churn-predictor-demo.streamlit.app',
    },
    {
      id: 'proj-ds-2',
      title: 'Automated Housing Price Valuation Engine',
      subtitle: 'Predictive Regression & Spatial EDA',
      description:
        'Built a multi-variable regression model predicting residential market prices across 25,000+ historical real estate transactions. Conducted statistical outlier detection via IQR filtering and engineered geolocation proximity features. Evaluated Ridge, Lasso, and Gradient Boosting regressors, reducing baseline Root Mean Squared Error (RMSE) by 26.4%.',
      technologies: ['Python', 'NumPy', 'Scikit-Learn', 'Seaborn', 'PostgreSQL'],
      github: 'https://github.com/priyasharma-ai/housing-valuation-engine',
    },
    {
      id: 'proj-ds-3',
      title: 'Kaggle Tabular Playground Competition',
      subtitle: 'Predictive Analytics Challenge',
      description:
        'Competed against 1,400+ international data science teams in tabular dataset classification. Implemented stratified 5-fold cross-validation and hyperparameter optimization using Optuna, securing a leaderboard ranking in the top 12%.',
      technologies: ['Python', 'LightGBM', 'Optuna', 'Statistics'],
      github: 'https://github.com/priyasharma-ai/kaggle-tabular-benchmark',
    },
  ],
  certifications: [
    {
      id: 'cert-ds-1',
      name: 'Google Advanced Data Analytics Professional Certificate',
      issuer: 'Google Career Certificates',
      date: '2023',
    },
    {
      id: 'cert-ds-2',
      name: 'DeepLearning.AI Machine Learning Specialization',
      issuer: 'DeepLearning.AI / Coursera',
      date: '2023',
    },
  ],
};

export const SAMPLE_DATA_SCIENTIST_EXPERIENCED: ResumeData = {
  personalInfo: {
    fullName: 'David Chen',
    jobTitle: 'Senior Data Scientist',
    email: 'david.chen@example.com',
    phone: '+1 (555) 345-9876',
    location: 'Seattle, WA',
    website: 'https://davidchen.ai',
    linkedin: 'https://linkedin.com/in/davidchen-ds',
    github: 'https://github.com/davidchen',
  },
  summary:
    'Senior Data Scientist with 5+ years of experience leading statistical experimentation and production machine learning at high-growth SaaS and e-commerce companies. Expert in BigQuery, Python, Scikit-Learn, A/B testing, and churn modeling. Generated \$2.4M in annualized revenue through customer lifetime value optimization.',
  experience: [
    {
      id: 'exp-ds-1',
      company: 'OmniMetrics Tech',
      role: 'Lead Data Scientist',
      location: 'Seattle, WA',
      startDate: '2021-06',
      endDate: 'Present',
      current: true,
      highlights: [
        'Architected real-time customer churn prediction model on Google Cloud Platform (BigQuery + Vertex AI), flagging at-risk accounts and driving a 23% reduction in quarterly customer churn.',
        'Spearheaded enterprise A/B testing framework running 35+ experimentation cohorts per quarter, achieving statistical significance with 95% confidence intervals and increasing checkout conversion by 14.5%.',
        'Engineered automated feature pipelines processing 45M daily event records, reducing model feature latency from 4 hours to 12 minutes.',
        'Mentored 4 junior data scientists and spearheaded weekly internal technical seminars on causal inference and Bayesian modeling.',
      ],
    },
    {
      id: 'exp-ds-2',
      company: 'DataStream Insights',
      role: 'Data Scientist',
      location: 'San Francisco, CA',
      startDate: '2019-03',
      endDate: '2021-05',
      current: false,
      highlights: [
        'Formulated multi-touch attribution machine learning models using Scikit-Learn and SQL, optimizing \$8M marketing budget allocation and boosting marketing ROI by 29%.',
        'Built automated anomaly detection system alerting on payment gateway failures, saving an estimated \$340k in uncaptured transactions.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-ds-2',
      institution: 'University of Washington',
      degree: 'Master of Science',
      fieldOfStudy: 'Statistics & Machine Learning',
      location: 'Seattle, WA',
      startDate: '2017-09',
      endDate: '2019-03',
      gpa: '3.91 / 4.0',
    },
  ],
  skills: [
    {
      id: 'skills-ds-exp-core',
      name: 'Data Science & Machine Learning',
      skills: [
        'Python',
        'SQL',
        'Pandas',
        'NumPy',
        'Scikit-Learn',
        'Statistics',
        'Machine Learning',
        'Exploratory Data Analysis',
        'A/B Testing',
        'Feature Engineering',
        'BigQuery',
        'Snowflake',
      ],
    },
    {
      id: 'skills-ds-exp-viz',
      name: 'Analytics & Visualization',
      skills: ['Tableau', 'Matplotlib', 'Seaborn', 'Looker', 'Hypothesis Testing'],
    },
  ],
  projects: [
    {
      id: 'proj-ds-exp-1',
      title: 'Automated Experimentation Platform',
      subtitle: 'Enterprise Statistical Engine',
      description:
        'Designed open-source causal inference Python package for sequential testing and variance reduction (CUPED), adopted across 3 product divisions.',
      technologies: ['Python', 'Statistics', 'SQL', 'Docker'],
      github: 'https://github.com/davidchen/cuped-ab-framework',
    },
  ],
  certifications: [
    {
      id: 'cert-ds-exp-1',
      name: 'AWS Certified Machine Learning – Specialty',
      issuer: 'Amazon Web Services',
      date: '2022',
    },
  ],
};

export const SAMPLE_AI_ENGINEER: ResumeData = {
  personalInfo: {
    fullName: 'Maya Lin',
    jobTitle: 'Full Stack AI Engineer',
    email: 'maya.lin@example.com',
    phone: '+1 (555) 678-1234',
    location: 'San Francisco, CA',
    website: 'https://mayalin.ai',
    linkedin: 'https://linkedin.com/in/mayalin-ai',
    github: 'https://github.com/mayalin',
  },
  summary:
    'Innovative Full Stack AI Engineer specializing in LLM applications, RAG architectures, and responsive React/Next.js interfaces. Hands-on expertise building production agentic systems using LangChain, LlamaIndex, Pinecone, FastAPI, and TypeScript. Reduced document retrieval hallucination by 40% with hybrid vector search.',
  experience: [
    {
      id: 'exp-ai-1',
      company: 'NeuralFlow Technologies',
      role: 'Full Stack AI Engineer',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      highlights: [
        'Architected and launched enterprise enterprise RAG platform using LangChain, FastAPI, and Pinecone vector database, enabling 200,000+ monthly enterprise users to query 1M+ PDF documents with sub-second response times.',
        'Designed multi-agent customer support copilot utilizing OpenAI GPT-4 function calling, reducing support ticket turnaround time by 52%.',
        'Built reactive web dashboard in Next.js 14, TypeScript, and Tailwind CSS with streaming token responses and real-time citation rendering.',
        'Implemented semantic caching with Redis and prompt token optimization, reducing API inference costs by 38% while improving latency by 220ms.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-ai-1',
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science (AI Track)',
      location: 'Stanford, CA',
      startDate: '2019-09',
      endDate: '2023-06',
      gpa: '3.88 / 4.0',
    },
  ],
  skills: [
    {
      id: 'skills-ai-core',
      name: 'Generative AI & LLM Systems',
      skills: [
        'Python',
        'TypeScript',
        'LangChain',
        'LlamaIndex',
        'OpenAI API',
        'Gemini API',
        'RAG',
        'Vector Databases',
        'Pinecone',
        'Chroma',
        'Prompt Engineering',
      ],
    },
    {
      id: 'skills-ai-stack',
      name: 'Full Stack & Cloud',
      skills: ['React', 'Next.js', 'FastAPI', 'Node.js', 'Tailwind CSS', 'Docker', 'REST API', 'Git'],
    },
  ],
  projects: [
    {
      id: 'proj-ai-1',
      title: 'DocuMind – Hybrid RAG Engine',
      subtitle: 'Multimodal Research Assistant',
      description:
        'Built and open-sourced a full-stack document intelligence assistant combining BM25 keyword search with dense vector embeddings in Pinecone, achieving 94% retrieval accuracy on technical benchmarks.',
      technologies: ['Next.js', 'FastAPI', 'LangChain', 'Pinecone', 'Docker'],
      github: 'https://github.com/mayalin/documind-rag',
      link: 'https://documind-demo.vercel.app',
    },
  ],
  certifications: [
    {
      id: 'cert-ai-1',
      name: 'DeepLearning.AI Generative AI with LLMs',
      issuer: 'DeepLearning.AI / Coursera',
      date: '2023',
    },
  ],
};

export const SAMPLE_ML_ENGINEER: ResumeData = {
  personalInfo: {
    fullName: 'Marcus Vance',
    jobTitle: 'Machine Learning (ML) Engineer',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 789-0123',
    location: 'Austin, TX',
    website: 'https://marcusvance.ml',
    linkedin: 'https://linkedin.com/in/marcusvance',
    github: 'https://github.com/marcusvance',
  },
  summary:
    'Machine Learning Engineer with strong background in PyTorch, MLOps, model optimization, and scalable inference serving. Built reproducible training pipelines with MLflow and containerized real-time model APIs serving 15,000 requests/sec with Docker and Triton.',
  experience: [
    {
      id: 'exp-ml-1',
      company: 'Triton AI Systems',
      role: 'Machine Learning Engineer',
      location: 'Austin, TX',
      startDate: '2022-04',
      endDate: 'Present',
      current: true,
      highlights: [
        'Engineered distributed model training and fine-tuning pipelines using PyTorch and Ray across multi-GPU cluster, reducing training cycle times by 48%.',
        'Containerized deep learning models using Docker and deployed real-time inference microservices on Kubernetes using Triton Inference Server, maintaining 99.99% uptime.',
        'Optimized computer vision models using ONNX Runtime and FP16 quantization, reducing inference latency from 85ms to 18ms without loss in accuracy.',
        'Established automated MLOps pipelines with MLflow and GitHub Actions for continuous model validation, testing, and automated canary rollouts.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-ml-1',
      institution: 'University of Texas at Austin',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Electrical & Computer Engineering',
      location: 'Austin, TX',
      startDate: '2018-08',
      endDate: '2022-05',
    },
  ],
  skills: [
    {
      id: 'skills-ml-core',
      name: 'Machine Learning & Deep Learning',
      skills: [
        'Python',
        'PyTorch',
        'TensorFlow',
        'Scikit-Learn',
        'Docker',
        'Kubernetes',
        'MLOps',
        'MLflow',
        'Model Deployment',
        'FastAPI',
        'Data Pipelines',
        'Linux',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-ml-1',
      title: 'NeuralSpeed Inference Engine',
      subtitle: 'Model Quantization Benchmark',
      description:
        'Developed open-source benchmark suite evaluating latency and throughput trade-offs across ONNX, TensorRT, and PyTorch TorchScript.',
      technologies: ['Python', 'PyTorch', 'ONNX', 'Docker', 'FastAPI'],
      github: 'https://github.com/marcusvance/neural-speed',
    },
  ],
  certifications: [
    {
      id: 'cert-ml-1',
      name: 'NVIDIA Certified Associate: Deep Learning',
      issuer: 'NVIDIA',
      date: '2023',
    },
  ],
};

export function getSampleResumeForRole(role: string, level: string): ResumeData {
  if (role === 'data-scientist') {
    return level === 'fresher' ? SAMPLE_DATA_SCIENTIST_FRESHER : SAMPLE_DATA_SCIENTIST_EXPERIENCED;
  }
  if (role === 'ai-engineer') {
    return SAMPLE_AI_ENGINEER;
  }
  if (role === 'ml-engineer') {
    return SAMPLE_ML_ENGINEER;
  }
  return SAMPLE_SOFTWARE_ENGINEER;
}
