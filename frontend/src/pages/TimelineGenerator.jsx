import React, { useState, useEffect } from 'react';
import { Loader, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from '../api';

const sampleLegalText = `Case Brief: Marbury v. Madison, 5 U.S. 137 (1803)
Parties: William Marbury (Plaintiff), James Madison, Secretary of State (Defendant)
Facts: In the final days of his presidency, John Adams appointed several individuals to judicial positions. These appointments were confirmed by the Senate, and commissions were signed by President Adams and sealed by the Secretary of State, John Marshall (who later became Chief Justice). However, due to the rush of the last days of the administration, some commissions, including Marbury's for a justice of the peace role, were not delivered before Jefferson took office.
Upon assuming office, President Jefferson, through his Secretary of State James Madison, refused to deliver the remaining commissions, believing they were invalid because they hadn't been delivered. Marbury sued Madison directly in the Supreme Court, seeking a writ of mandamus to compel Madison to deliver his commission.
Legal Question:
1.  Did Marbury have a right to the commission?
2.  If he had a right, and that right was violated, did the laws of the United States afford him a remedy?
3.  If they did afford him a remedy, was that remedy a writ of mandamus issuing from the Supreme Court?
Holding:
1.  Yes, Marbury had a right to the commission once it was signed and sealed, as the appointment process was complete.
2.  Yes, where there is a legal right, there must be a legal remedy.
3.  No, the Supreme Court did not have the original jurisdiction to issue the writ of mandamus in this case. The Judiciary Act of 1789, which purported to give the Supreme Court original jurisdiction in such cases, was unconstitutional because it expanded the Court's original jurisdiction beyond what Article III, Section 2, Clause 2 of the Constitution explicitly permitted.
Reasoning (Chief Justice John Marshall):
The Court established the principle of "judicial review," holding that it is "emphatically the province and duty of the judicial department to say what the law is." This means the Supreme Court has the authority to declare an act of Congress unconstitutional if it conflicts with the Constitution. While Marbury had a right to his commission, the specific method he chose to obtain it (original jurisdiction writ of mandamus from the Supreme Court) was unconstitutional. The Court thus denied Marbury's request, but in doing so, asserted its significant power to review the constitutionality of legislative acts.
Impact: Established judicial review, strengthening the Supreme Court's role as an independent branch of government and defining its powers.
`;

const TimelineGenerator = ({ userId, isAuthReady }) => {
    const [text, setText] = useState(sampleLegalText);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [timelineSummary, setTimelineSummary] = useState(''); // New state for summary
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const timelineId = "latest_timeline"; // Using a fixed ID for the latest timeline

    // Effect to load saved data from Firestore
    useEffect(() => {
        if (!userId || !isAuthReady) return;

        const docRef = doc(db, `users/${userId}/timelines`, timelineId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Ensure default values if data is missing
                setText(data.text || sampleLegalText);
                setTimelineEvents(data.timeline_events || []); // Changed to timeline_events
                setTimelineSummary(data.timeline_summary || ''); // Set summary from saved data
            }
        });
        return () => unsubscribe(); // Cleanup subscription
    }, [userId, isAuthReady]);

    // Function to save data to Firestore
    const saveData = async (currentText, currentTimelineEvents, currentTimelineSummary) => {
        if (!userId) return;
        setIsSaving(true);
        const docRef = doc(db, `users/${userId}/timelines`, timelineId);
        try {
            await setDoc(docRef, {
                text: currentText,
                timeline_events: currentTimelineEvents, // Changed to timeline_events
                timeline_summary: currentTimelineSummary, // Save summary
                updatedAt: serverTimestamp()
            });
            console.log("Timeline data saved successfully.");
        } catch (e) {
            console.error("Error saving timeline data:", e);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle text area changes (and auto-save)
    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        // Optional: Implement a debounce for auto-save to prevent too many writes
        // For simplicity, we'll just save on generate or on unmount/interval
    };


    const handleGenerateTimeline = async () => {
        if (!text.trim() || !isAuthReady) {
            setError("Please enter some text to generate a timeline.");
            return;
        }

        setIsLoading(true);
        setError('');
        setTimelineEvents([]); // Clear previous events
        setTimelineSummary(''); // Clear previous summary

        try {
            // Pass userId for backend logging/tracking
            const response = await api.generateTimeline(text, userId);

            if (response.error) {
                setError(response.error);
                // Optionally clear data if there was an error
                setTimelineEvents([]);
                setTimelineSummary('');
            } else {
                // Ensure we are getting the correct keys from the backend response
                const fetchedEvents = response.timeline_events || [];
                const fetchedSummary = response.timeline_summary || 'No summary generated.';

                setTimelineEvents(fetchedEvents);
                setTimelineSummary(fetchedSummary);

                // Save the newly generated data
                await saveData(text, fetchedEvents, fetchedSummary);
            }
        } catch (e) {
            console.error("Timeline generation failed:", e);
            setError(`Failed to generate timeline: ${e.message}. Please check your network connection or server status.`);
            // Clear timeline on critical errors
            setTimelineEvents([]);
            setTimelineSummary('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 gap-8">
            <div className="flex-shrink-0">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Case Chronology Generator</h2>
                <p className="text-gray-600">Paste case text to automatically generate a visual timeline. Your work is saved automatically.</p>
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Input Document Text</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {isSaving ? <><Loader className="w-4 h-4 animate-spin" /><span>Saving...</span></> : <><Save className="w-4 h-4" /><span>Auto-saved</span></>}
                        </div>
                    </div>
                    <textarea
                        value={text}
                        onChange={handleTextChange} // Use the new handler
                        placeholder="Paste court case text here..."
                        className="flex-1 w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleGenerateTimeline}
                        disabled={isLoading || !isAuthReady || !text.trim()} // Disable if text is empty
                        className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
                    >
                        {isLoading ? <Loader className="animate-spin w-6 h-6" /> : "Generate Timeline"}
                    </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-y-auto">
                    <h3 className="text-xl font-semibold text-gray-700 mb-6">Generated Timeline</h3>
                    {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}

                    {/* Display Summary */}
                    {timelineSummary && (
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Summary:</h4>
                            <p className="text-gray-700">{timelineSummary}</p>
                        </div>
                    )}

                    {/* Display Events */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full min-h-[100px]"><Loader className="animate-spin w-12 h-12 text-indigo-600" /></div>
                    ) : timelineEvents.length > 0 ? (
                        <div className="relative border-l-2 border-indigo-300 pl-8 space-y-10">
                            {timelineEvents.map((event, index) => (
                                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative">
                                    <div className="absolute -left-[38px] top-1.5 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white"></div>
                                    <p className="text-sm font-semibold text-indigo-600">{event.date || 'No Date'}</p>
                                    <h4 className="text-lg font-bold text-gray-800 mt-1">{event.title || 'Untitled Event'}</h4> {/* Changed from event_title */}
                                    <p className="text-gray-600 mt-1">{event.description || 'No description.'}</p> {/* Changed from event_description */}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 pt-10">The generated timeline will appear here. Enter text and click "Generate Timeline".</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimelineGenerator;