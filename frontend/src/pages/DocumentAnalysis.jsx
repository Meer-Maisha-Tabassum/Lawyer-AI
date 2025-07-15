import React, { useState, useEffect } from 'react';
import { Loader, Upload, Save, Tags } from 'lucide-react';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from '../api';

const sampleLegalText = `Case Brief: Marbury v. Madison, 5 U.S. 137 (1803)
Parties: William Marbury (Plaintiff), James Madison, Secretary of State (Defendant)
Facts: In the final days of his presidency, John Adams appointed several individuals to judicial positions...`; // Truncated for brevity

const DocumentAnalysis = ({ userId, isAuthReady }) => {
    const [fileName, setFileName] = useState('');
    const [text, setText] = useState(sampleLegalText);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('summary');
    const [results, setResults] = useState({ summary: '', clauses: [], qa: [], entities: [] });
    const [question, setQuestion] = useState('');
    const [isAnswering, setIsAnswering] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const docId = "latest_analysis";

    const entityColors = {
        PERSON: 'bg-blue-100 text-blue-800',
        ORG: 'bg-green-100 text-green-800',
        GPE: 'bg-purple-100 text-purple-800',
        LAW: 'bg-red-100 text-red-800',
        DATE: 'bg-yellow-100 text-yellow-800',
        default: 'bg-gray-100 text-gray-800',
    };

    useEffect(() => {
        if (!userId || !isAuthReady) return;
        const docRef = doc(db, `users/${userId}/documents`, docId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setText(data.text || sampleLegalText);
                setResults(data.results || { summary: '', clauses: [], qa: [], entities: [] });
                setFileName(data.fileName || 'Loaded from database');
            }
        });
        return () => unsubscribe();
    }, [userId, isAuthReady]);

    const saveData = async (currentText, currentResults, currentFileName) => {
        if (!userId) return;
        setIsSaving(true);
        const docRef = doc(db, `users/${userId}/documents`, docId);
        await setDoc(docRef, {
            text: currentText,
            results: currentResults,
            fileName: currentFileName,
            updatedAt: serverTimestamp()
        }, { merge: true });
        setIsSaving(false);
    };

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFileName(uploadedFile.name);
            const reader = new FileReader();
            reader.onload = (event) => setText(event.target.result);
            reader.readAsText(uploadedFile);
        }
    };

    const handleProcessDocument = async () => {
        if (!text || !isAuthReady) return;
        setIsProcessing(true);
        setActiveTab('summary');
        const initialResults = { summary: '', clauses: [], qa: results.qa || [], entities: [] };
        setResults(initialResults);

        try {
            const backendResults = await api.analyzeDocument(text);
            const newResults = { ...initialResults, ...backendResults };
            setResults(newResults);
            await saveData(text, newResults, fileName);
        } catch (error) {
            console.error("Analysis failed:", error);
            setResults({ ...initialResults, summary: `Error: ${error.message}` });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim() || !text || !isAuthReady) return;
        setIsAnswering(true);
        try {
            const qaResult = await api.askQuestionOnDocument(text, question);
            const newQa = [...(results.qa || []), { question, answer: qaResult.answer }];
            const newResults = { ...results, qa: newQa };
            setResults(newResults);
            await saveData(text, newResults, fileName);
            setQuestion('');
        } catch (error) {
            console.error("Q&A failed:", error);
        } finally {
            setIsAnswering(false);
        }
    };

    const renderResultContent = () => {
        if (isProcessing) {
            return <div className="flex justify-center items-center h-full"><Loader className="animate-spin w-12 h-12 text-indigo-600" /></div>;
        }

        if (!results.summary && (!results.clauses || results.clauses.length === 0) && (!results.entities || results.entities.length === 0)) {
            return <div className="text-center text-gray-500 p-8">Upload and process a document to see the analysis.</div>;
        }

        switch (activeTab) {
            case 'summary':
                return <div className="p-6 prose max-w-none"><h3>Document Summary</h3><p>{results.summary || "No summary generated yet."}</p></div>;
            case 'clauses':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Extracted Clauses & Principles</h3>
                        <div className="space-y-4">
                            {results.clauses && results.clauses.length > 0 ? results.clauses.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                    <strong className="text-indigo-700">{item.clause_type || 'Uncategorized'}</strong>
                                    <p className="mt-2 text-gray-700">{item.clause_text}</p>
                                </div>
                            )) : <p>No specific clauses or principles were identified.</p>}
                        </div>
                    </div>
                );
            case 'entities':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Named Entity Recognition (NER)</h3>
                        <div className="flex flex-wrap gap-4">
                            {results.entities && results.entities.length > 0 ? results.entities.map((item, index) => (
                                <div key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${entityColors[item.label] || entityColors.default}`}>
                                    {item.text}
                                    <span className="ml-2 font-semibold text-xs opacity-75">{item.label}</span>
                                </div>
                            )) : <p>No entities were identified.</p>}
                        </div>
                    </div>
                );
            case 'qa':
                return (
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {results.qa && results.qa.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-end">
                                        <p className="bg-indigo-600 text-white p-3 rounded-lg max-w-xl">{item.question}</p>
                                    </div>
                                    <div className="flex justify-start mt-2">
                                        <p className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xl">{item.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question about the document..." className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" disabled={isAnswering || !isAuthReady} />
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center w-24" disabled={isAnswering || !isAuthReady}>
                                {isAnswering ? <Loader className="animate-spin w-5 h-5" /> : 'Ask'}
                            </button>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col p-8 gap-8">
            <div className="flex-shrink-0 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-start">
                    <div><h2 className="text-2xl font-bold text-gray-800 mb-4">Document Analysis Engine</h2></div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {isSaving ? <><Loader className="w-4 h-4 animate-spin" /><span>Saving...</span></> : <><Save className="w-4 h-4" /><span>Auto-saved</span></>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Upload className="w-5 h-5" /><span>{fileName ? 'Change File' : 'Upload Document'}</span></label>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md" />
                    {fileName && <span className="text-gray-600">{fileName}</span>}
                    <button onClick={handleProcessDocument} disabled={!text || isProcessing || !isAuthReady} className="ml-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center w-40">{isProcessing ? <Loader className="animate-spin w-5 h-5" /> : "Analyze Document"}</button>
                </div>
            </div>
            <div className="flex-grow bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
                <div className="flex-shrink-0 border-b p-2 flex gap-2">
                    <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'summary' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>Summary</button>
                    <button onClick={() => setActiveTab('clauses')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'clauses' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>Clauses & Principles</button>
                    <button onClick={() => setActiveTab('entities')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'entities' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}><Tags className="w-4 h-4 mr-2 inline-block" />Entities (NER)</button>
                    <button onClick={() => setActiveTab('qa')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'qa' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>Q&A on Document</button>
                </div>
                <div className="flex-grow overflow-y-auto">{renderResultContent()}</div>
            </div>
        </div>
    );
};

export default DocumentAnalysis;