import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FileJson, Scale, Server, Bot } from 'lucide-react';

const modelPerformanceData = [
    { name: 'Jan', 'LegalBERT-F1': 0.88, 'T5-Summary-Rouge': 0.75 },
    { name: 'Feb', 'LegalBERT-F1': 0.89, 'T5-Summary-Rouge': 0.76 },
    { name: 'Mar', 'LegalBERT-F1': 0.91, 'T5-Summary-Rouge': 0.78 },
    { name: 'Apr', 'LegalBERT-F1': 0.90, 'T5-Summary-Rouge': 0.77 },
    { name: 'May', 'LegalBERT-F1': 0.92, 'T5-Summary-Rouge': 0.80 },
    { name: 'Jun', 'LegalBERT-F1': 0.93, 'T5-Summary-Rouge': 0.81 },
];

const clauseExtractionData = [
    { name: 'Obligation', 'F1-Score': 0.94, fill: '#8884d8' },
    { name: 'Liability', 'F1-Score': 0.91, fill: '#82ca9d' },
    { name: 'Termination', 'F1-Score': 0.95, fill: '#ffc658' },
    { name: 'Confidentiality', 'F1-Score': 0.96, fill: '#ff8042' },
];

const Dashboard = () => {
    const stats = [
        { icon: <FileJson className="w-8 h-8 text-green-400" />, value: '94.8%', label: 'Clause Extraction F1', desc: 'Average across all categories' },
        { icon: <Scale className="w-8 h-8 text-blue-400" />, value: '81.2%', label: 'Summarization ROUGE-L', desc: 'On case law documents' },
        { icon: <Server className="w-8 h-8 text-yellow-400" />, value: '99.5%', label: 'Model API Uptime', desc: 'Last 30 days' },
        { icon: <Bot className="w-8 h-8 text-purple-400" />, value: '92.3%', label: 'Q&A Accuracy (RAG)', desc: 'On uploaded document context' },
    ];
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Project Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                        <div className="flex items-center justify-between mb-4">{stat.icon}<span className="text-3xl font-bold text-gray-800">{stat.value}</span></div>
                        <div><p className="text-lg font-semibold text-gray-600">{stat.label}</p><p className="text-sm text-gray-500">{stat.desc}</p></div>
                    </motion.div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Model Performance Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}><LineChart data={modelPerformanceData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} /><Legend /><Line type="monotone" dataKey="LegalBERT-F1" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} /><Line type="monotone" dataKey="T5-Summary-Rouge" stroke="#82ca9d" strokeWidth={2} /></LineChart></ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Clause Extraction F1-Scores</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={clauseExtractionData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis type="number" domain={[0.8, 1]} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={100} stroke="#6b7280" tick={{ width: 100 }} /><Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} /><Bar dataKey="F1-Score" barSize={20} >{clauseExtractionData.map((entry, index) => (<rect key={`bar-${index}`} x={30} y={index * 35 + 25} width={entry['F1-Score'] * 300} height={20} fill={entry.fill} />))}</Bar></BarChart></ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;