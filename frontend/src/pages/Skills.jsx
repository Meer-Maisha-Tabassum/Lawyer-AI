import React from 'react';
import { motion } from 'framer-motion';

const Skills = () => {
    const techStack = {
        "Frontend": [
            { name: "React", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", desc: "For building dynamic, component-based UIs." },
            { name: "Tailwind CSS", icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg", desc: "A utility-first CSS framework for rapid styling." },
            { name: "Framer Motion", icon: "https://static.framer.com/images/logos/framer-logo-icon.png", desc: "For fluid animations and complex gestures." },
        ],
        "Backend & API": [
            { name: "FastAPI", icon: "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png", desc: "High-performance Python web framework for building APIs." },
            { name: "Docker", icon: "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png", desc: "Containerization for consistent deployment environments." },
        ],
        "NLP & Machine Learning": [
            { name: "Hugging Face", icon: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg", desc: "Ecosystem for state-of-the-art Transformers models." },
            { name: "PyTorch", icon: "https://upload.wikimedia.org/wikipedia/commons/9/96/Pytorch_logo.png", desc: "Primary deep learning framework for model fine-tuning." },
            { name: "spaCy", icon: "https://spacy.io/images/logo.svg", desc: "Industrial-strength NLP for preprocessing and NER." },
            { name: "NLTK", icon: "https://www.nltk.org/_static/nltk_logo_small.png", desc: "Library for text processing tasks like tokenization." },
        ],
        "MLOps & Deployment": [
            { name: "GitHub Actions", icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png", desc: "CI/CD for automated testing and deployment pipelines." },
            { name: "AWS S3", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_S3_logo.svg", desc: "Scalable object storage for models and documents." },
            { name: "GCP Vertex AI", icon: "https://cloud.google.com/images/products/vertex-ai/vertex-ai-lockup-rgb.svg", desc: "Managed platform for ML model deployment and serving." },
        ]
    };

    return (
        <div className="p-8 overflow-y-auto h-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Technical Skills & Stack</h2>
            <p className="text-gray-600 mb-8">This application is a demonstration of proficiency across the full ML lifecycle, from frontend development to MLOps.</p>

            <div className="space-y-8">
                {Object.entries(techStack).map(([category, items]) => (
                    <div key={category}>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-indigo-200 pb-2">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(item => (
                                <motion.div
                                    key={item.name}
                                    whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                                    className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4"
                                >
                                    <img src={item.icon} alt={item.name} className="w-12 h-12 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/e0e0e0/333333?text=?'; }} />
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Skills;