import type { RoleBenchmark, TargetRole } from '../types/resume';

export const ROLE_BENCHMARKS: Record<TargetRole, RoleBenchmark> = {
  'data-scientist': {
    id: 'data-scientist',
    title: 'Data Scientist',
    badge: '📊 Analytics & ML Models',
    description: 'Specializes in extracting actionable business insights, statistical modeling, exploratory data analysis, hypothesis testing, and predictive machine learning models.',
    coreSkills: [
      'python',
      'sql',
      'pandas',
      'numpy',
      'scikit-learn',
      'statistics',
      'machine learning',
      'exploratory data analysis',
      'data visualization',
      'matplotlib',
      'seaborn',
      'hypothesis testing',
      'feature engineering',
      'model evaluation',
    ],
    secondarySkills: [
      'tableau',
      'power bi',
      'bigquery',
      'snowflake',
      'deep learning',
      'tensorflow',
      'pytorch',
      'nlp',
      'time series',
      'a/b testing',
      'git',
      'docker',
    ],
    fresherExpectations: [
      'Strong academic or personal capstone projects demonstrating end-to-end data pipelines (data ingestion, cleaning, EDA, modeling).',
      'Fluency with Python data manipulation libraries (Pandas, NumPy) and SQL query writing (joins, window functions, aggregations).',
      'Solid foundation in statistical concepts, probability distributions, regression, and classification algorithms.',
      'Clear project model evaluation using industry metrics (ROC-AUC, Precision/Recall, F1-Score, RMSE, Confusion Matrix).',
      'Public GitHub or Kaggle portfolio links with clear README documentation and Jupyter Notebooks.',
      'Corporate work experience is NOT expected — scored primarily on project depth, technical skills, and coursework.',
    ],
    midExpectations: [
      '2–4 years delivering predictive analytics and machine learning solutions driving business decisions.',
      'Experience setting up automated ETL / feature engineering pipelines and integrating with databases like BigQuery or Snowflake.',
      'Proven competency in experimental design, A/B testing, and statistical causal inference.',
      'Collaboration with product managers and software engineers to deploy analytical models into production.',
      'Measurable business outcomes (e.g., improved retention, conversion rates, cost reduction).',
    ],
    seniorExpectations: [
      '5+ years leading end-to-end data science roadmaps and evangelizing machine learning across business units.',
      'Architecting enterprise experimentation platforms and real-time inference or scoring systems.',
      'Mentoring junior and mid-level data scientists and driving technical best practices.',
      'Quantifiable multi-million dollar business impact, churn reduction, or predictive revenue gains.',
      'Executive communication and translating complex statistical models into clear C-level strategies.',
    ],
    sampleJobDescription: `Role: Data Scientist
Company: DataWave Analytics
Location: Hybrid / Remote

About the Role:
We are seeking a curious and detail-oriented Data Scientist to join our predictive intelligence team. You will leverage statistical modeling, machine learning, and data analytics to transform raw behavioral data into actionable growth strategies.

Key Responsibilities:
- Conduct exploratory data analysis (EDA) on multi-million row datasets to discover underlying trends and anomalies.
- Build, tune, and evaluate machine learning models (classification, regression, clustering) using Python, Pandas, Scikit-Learn, and SQL.
- Formulate hypotheses, design rigorous A/B experiments, and interpret statistical significance tests.
- Design automated feature engineering pipelines and query cloud data warehouses (BigQuery, Snowflake).
- Create intuitive data visualizations and executive dashboards using Matplotlib, Seaborn, and Tableau.
- Collaborate with engineering teams to deploy models into production environments.

Requirements:
- Strong programming proficiency in Python and advanced SQL.
- Deep understanding of statistics, probability, predictive modeling, and feature engineering.
- Experience with Scikit-Learn, Pandas, NumPy, and data visualization tools.
- Ability to explain complex quantitative results to non-technical stakeholders.
- For Freshers: Compelling academic/Kaggle projects demonstrating problem-solving methodology and model evaluation metrics.
- For Experienced: Track record of measurable business outcomes and production data pipelines.`,
  },

  'ai-engineer': {
    id: 'ai-engineer',
    title: 'Full Stack AI Engineer',
    badge: '🤖 LLMs, RAG & Full Stack Apps',
    description: 'Builds end-to-end applications powered by Generative AI, Large Language Models (LLMs), RAG architectures, vector search, and responsive modern web frontends.',
    coreSkills: [
      'python',
      'typescript',
      'react',
      'next.js',
      'fastapi',
      'node.js',
      'langchain',
      'llamaindex',
      'openai',
      'gemini',
      'rag',
      'vector database',
      'pinecone',
      'chroma',
      'prompt engineering',
      'rest api',
      'git',
      'docker',
    ],
    secondarySkills: [
      'pgvector',
      'qdrant',
      'hugging face',
      'pytorch',
      'tailwind css',
      'redis',
      'celery',
      'evaluations (ragas, trulens)',
      'fine-tuning',
      'agents',
      'function calling',
      'ci/cd',
      'aws',
      'gcp',
    ],
    fresherExpectations: [
      'Hands-on full-stack projects integrating Generative AI APIs (OpenAI, Anthropic, or Gemini) with modern web frameworks (React, Next.js).',
      'Demonstrated understanding of Retrieval-Augmented Generation (RAG) concepts (chunking, embeddings, vector indexing, semantic search).',
      'Ability to build clean RESTful APIs using FastAPI or Node.js/Express to serve AI endpoints.',
      'Public GitHub repositories with live deployed demos (Vercel, Render, or Hugging Face Spaces).',
      'Knowledge of prompt engineering patterns, context window limits, and structured JSON output generation.',
      'Corporate work history is NOT required — evaluated on creative AI applications, full-stack integration, and coding fundamentals.',
    ],
    midExpectations: [
      '2–4 years shipping production web applications with deep integration of LLMs and generative workflows.',
      'Experience optimizing RAG retrieval accuracy with hybrid search (BM25 + vector), re-ranking, and chunking strategies.',
      'Implementation of multi-agent architectures, function calling, tool use, and streaming responses.',
      'Vector database administration (Pinecone, Qdrant, pgvector) with metadata filtering and caching strategies.',
      'Latency and token cost reduction through prompt compression, semantic caching (Redis), and model tiering.',
    ],
    seniorExpectations: [
      '5+ years leading complex software architectures and mission-critical Generative AI enterprise systems.',
      'Designing robust AI evaluation frameworks (synthetic datasets, Ragas, Trulens) and guardrail systems against hallucination and injection.',
      'Fine-tuning open-source LLMs (Llama, Mistral) with LoRA/QLoRA and deploying optimized inference endpoints.',
      'Deep expertise in scalable microservices, CI/CD, Kubernetes, and enterprise security compliance for AI workloads.',
      'Mentorship of engineering teams and establishing AI engineering standards across the organization.',
    ],
    sampleJobDescription: `Role: Full Stack AI Engineer
Company: CognitiveAI Labs
Location: San Francisco, CA / Remote

About the Role:
We are looking for a Full Stack AI Engineer to architect and build next-generation applications powered by Generative AI and Large Language Models. You will own features from user interface to API and AI pipeline integration.

Key Responsibilities:
- Build reactive, high-performance web frontends using React, TypeScript, Next.js, and Tailwind CSS.
- Design and implement scalable backend microservices using FastAPI, Python, and Node.js.
- Architect advanced RAG (Retrieval-Augmented Generation) pipelines using LangChain, LlamaIndex, and Vector Databases (Pinecone, Chroma, pgvector).
- Integrate state-of-the-art LLMs (OpenAI, Gemini, Claude, open-source models) with prompt engineering and structured function calling.
- Implement streaming responses, semantic caching with Redis, and token usage optimization.
- Build automated evaluation suites to benchmark LLM latency, retrieval quality, and hallucination rates.

Requirements:
- Strong proficiency in Python and TypeScript/JavaScript.
- Experience with modern frontend frameworks (React/Next.js) and backend frameworks (FastAPI/Express).
- Practical experience with LLM frameworks (LangChain, LlamaIndex) and vector databases.
- Understanding of embeddings, chunking strategies, and RAG architectures.
- For Freshers: Demonstrated passion through deployed full-stack AI projects and GitHub repositories.
- For Experienced: Experience scaling LLM-backed applications to high concurrency with low latency and measurable cost control.`,
  },

  'ml-engineer': {
    id: 'ml-engineer',
    title: 'Machine Learning (ML) Engineer',
    badge: '⚙️ PyTorch, MLOps & Production Pipelines',
    description: 'Bridges the gap between research and production by training, optimizing, packaging, and deploying machine learning and deep learning models at scale.',
    coreSkills: [
      'python',
      'pytorch',
      'tensorflow',
      'scikit-learn',
      'docker',
      'kubernetes',
      'mlops',
      'mlflow',
      'model deployment',
      'fastapi',
      'triton',
      'torchserve',
      'data pipelines',
      'git',
      'linux',
    ],
    secondarySkills: [
      'onnx',
      'tensorrt',
      'cuda',
      'quantization',
      'distributed training',
      'dvc',
      'kubeflow',
      'feature store',
      'aws sagemaker',
      'gcp vertex ai',
      'ci/cd',
      'drift detection',
    ],
    fresherExpectations: [
      'Strong foundational understanding of deep learning and machine learning algorithms (CNNs, RNNs, Transformers, Gradient Boosting).',
      'Proficiency in PyTorch or TensorFlow for model definition, loss function optimization, backpropagation, and training loops.',
      'Ability to package a trained model into a REST API using FastAPI and containerize it using Docker.',
      'Experience with dataset preprocessing, data loaders, GPU acceleration, and hyperparameter tuning.',
      'Public repositories showing clean model training code, training curves, and reproducible benchmarks.',
      'No corporate employment history required — assessed on deep mathematical/ML intuition and clean code.',
    ],
    midExpectations: [
      '2–4 years deploying machine learning models into live production services with high availability and low latency.',
      'Hands-on MLOps experience with experiment tracking (MLflow, Weights & Biases) and automated retraining pipelines.',
      'Model optimization and inference acceleration using ONNX Runtime, TensorRT, or quantization techniques.',
      'Experience orchestrating containerized workloads on Kubernetes and managing cloud ML platforms (AWS SageMaker / Vertex AI).',
      'Continuous monitoring of production models for data drift, concept drift, and prediction latency degradation.',
    ],
    seniorExpectations: [
      '5+ years architecting enterprise-scale distributed ML platforms and high-throughput inference engines (sub-10ms p99).',
      'Expertise in distributed training frameworks (DeepSpeed, Megatron-LM, Ray Train) across multi-node GPU clusters.',
      'Designing company-wide MLOps infrastructure: Feature Stores, automated model validation registries, and shadow deployments.',
      'Leading ML infrastructure cost optimization (GPU utilization efficiency, spot instance orchestration).',
      'Mentoring ML engineers and aligning model capabilities with core engineering roadmaps.',
    ],
    sampleJobDescription: `Role: Machine Learning (ML) Engineer
Company: Apex Neural Systems
Location: Austin, TX / Remote

About the Role:
We are looking for a Machine Learning Engineer to take complex machine learning and deep learning models from prototype to high-throughput production. You will build resilient MLOps pipelines and optimize models for ultra-low latency serving.

Key Responsibilities:
- Design, train, and fine-tune deep learning and machine learning models using PyTorch, TensorFlow, and Scikit-Learn.
- Build automated, reproducible MLOps pipelines for data ingestion, feature generation, model training, and experiment tracking using MLflow.
- Containerize models using Docker and orchestrate scalable inference clusters on Kubernetes.
- Optimize model inference latency using ONNX Runtime, TensorRT, pruning, and quantization.
- Deploy real-time REST and gRPC model endpoints using FastAPI, TorchServe, or Triton Inference Server.
- Implement production monitoring systems to detect model drift, anomalies, and performance degradation.

Requirements:
- Strong software engineering foundation in Python, algorithms, and Linux environments.
- Deep expertise in PyTorch or TensorFlow.
- Experience with Docker, CI/CD, and model serving in cloud environments.
- Solid grasp of MLOps best practices, versioning (Git/DVC), and experiment tracking.
- For Freshers: Strong technical coursework, solid linear algebra/calculus, and GitHub projects showing custom model implementations.
- For Experienced: Proven track record of operating high-scale production ML systems with strict latency SLAs.`,
  },

  'fullstack-engineer': {
    id: 'fullstack-engineer',
    title: 'Full Stack Web Developer',
    badge: '💻 React, Node.js & Cloud Systems',
    description: 'Designs, implements, and maintains scalable web applications across the entire stack, from frontend user experiences to backend APIs and databases.',
    coreSkills: [
      'typescript',
      'javascript',
      'react',
      'next.js',
      'node.js',
      'express',
      'html5',
      'css3',
      'tailwind css',
      'sql',
      'postgresql',
      'rest api',
      'git',
      'docker',
    ],
    secondarySkills: [
      'mongodb',
      'redis',
      'graphql',
      'aws',
      'ci/cd',
      'jest',
      'cypress',
      'microservices',
      'system design',
      'prisma',
    ],
    fresherExpectations: [
      'Full-stack web applications featuring CRUD operations, user authentication, database persistence, and responsive UI.',
      'Competence in React (hooks, component lifecycle, state management) and Node.js/Express backend APIs.',
      'Relational or NoSQL database modeling with PostgreSQL or MongoDB.',
      'Live deployed links (Vercel, Netlify, Railway) and clean GitHub repositories.',
      'Demonstrated knowledge of web fundamentals (HTTP, REST, CORS, semantic HTML, responsive CSS).',
    ],
    midExpectations: [
      '2–4 years architecting resilient SaaS applications, REST/GraphQL APIs, and frontend state architectures.',
      'Database query optimization, indexing, and caching with Redis to reduce response latency.',
      'Writing automated unit and integration tests (Jest, React Testing Library, Cypress).',
      'Implementing automated CI/CD pipelines and containerizing services with Docker.',
    ],
    seniorExpectations: [
      '5+ years leading large-scale distributed web architectures, microservices, and high-concurrency systems.',
      'Establishing engineering best practices, design patterns, code review standards, and system security.',
      'Mentoring junior and mid-level engineers and driving key technical architecture decisions.',
      'Measurable impact on platform uptime (99.9%+), developer velocity, and business revenue metrics.',
    ],
    sampleJobDescription: `Role: Full Stack Web Developer
Company: Velocity Web Solutions
Location: New York, NY / Remote

About the Role:
We are seeking a Full Stack Web Developer to design and develop scalable web applications that deliver seamless experiences to millions of users.

Key Responsibilities:
- Build modern, accessible, and responsive user interfaces using React, Next.js, TypeScript, and Tailwind CSS.
- Develop robust, scalable RESTful and GraphQL APIs using Node.js and Express.
- Architect database schemas and optimize queries in PostgreSQL and MongoDB.
- Build automated testing suites with Jest and Cypress to ensure high code quality.
- Collaborate closely with UI/UX designers and product managers to deliver features on schedule.

Requirements:
- Strong proficiency in JavaScript/TypeScript, React, and Node.js.
- Experience with relational and NoSQL databases.
- Familiarity with version control (Git), REST principles, and Docker.
- For Freshers: Impressive portfolio of deployed full-stack web applications and clean code.
- For Experienced: Demonstrated experience scaling web applications, optimizing performance, and mentoring others.`,
  },
};

export const ROLE_LIST: RoleBenchmark[] = Object.values(ROLE_BENCHMARKS);
