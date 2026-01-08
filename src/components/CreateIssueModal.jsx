import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createIssue, getAllIssues } from '../utils/firestore';
import { findSimilarIssues } from '../utils/similarity';

export default function CreateIssueModal({ isOpen, onClose, onIssueCreated }) {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignedTo: '',
    });
    const [loading, setLoading] = useState(false);
    const [similarIssues, setSimilarIssues] = useState([]);
    const [showSimilarWarning, setShowSimilarWarning] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                assignedTo: '',
            });
            setSimilarIssues([]);
            setShowSimilarWarning(false);
        }
    }, [isOpen]);

    const checkSimilarIssues = async () => {
        if (!formData.title.trim()) return;

        // Guard: don't attempt to fetch issues when user is not signed in
        if (!currentUser) {
            console.warn('checkSimilarIssues: user not signed in, skipping similarity check');
            alert('Sign in to check for similar issues.');
            return false;
        }

        try {
            const existingIssues = await getAllIssues();
            const similar = findSimilarIssues(
                { title: formData.title, description: formData.description },
                existingIssues
            );

            if (similar.length > 0) {
                setSimilarIssues(similar);
                setShowSimilarWarning(true);
                return true;
            }
            return false;
        } catch (err) {
            console.error('checkSimilarIssues: failed to fetch issues', err);
            alert('Unable to check for similar issues: ' + (err?.message || err));
            return false;
        }
    };  

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('CreateIssueModal: handleSubmit start', { formData, currentUser, showSimilarWarning });

        if (!showSimilarWarning) {
            const hasSimilar = await checkSimilarIssues();
            console.log('CreateIssueModal: checkSimilarIssues returned', hasSimilar);
            if (hasSimilar) return;
        }

        // Guard: ensure user is signed in before creating an issue
        if (!currentUser || !currentUser.email) {
            console.error('CreateIssueModal: no currentUser available', currentUser);
            alert('You must be signed in to create an issue.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                status: 'Open',
                createdBy: currentUser.email,
                userId: currentUser.uid, // required by Firestore rules
            };
            console.log('CreateIssueModal: calling createIssue with payload', payload);

            try {
                await createIssue(payload);
                console.log('CreateIssueModal: createIssue succeeded');
                if (onIssueCreated) onIssueCreated();
                if (onClose) onClose();
            } catch (err) {
                console.error('CreateIssueModal: createIssue network/error', err);
                if (err?.code === 'permission-denied' || /permission|insufficient/i.test(err?.message)) {
                    alert('Permission denied creating issue. Ensure Firestore rules allow authenticated users to write issues and that you are signed in.');
                    return;
                }
                throw err; // re-throw for other unexpected errors
            }
        } catch (error) {
            console.error('Failed to create issue:', error);
            alert('Failed to create issue. Please try again. ' + (error?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (showSimilarWarning) {
            setShowSimilarWarning(false);
            setSimilarIssues([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Issue</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!currentUser && (
                    <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        You must be signed in to check for similar issues or create a new issue.
                    </div>
                )}

                {showSimilarWarning && similarIssues.length > 0 && (
                    <div className="m-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-1">
                                    Similar Issues Found
                                </h3>
                                <p className="text-sm text-yellow-800 mb-3">
                                    We found {similarIssues.length} similar issue(s). Are you sure you want to create this issue?
                                </p>
                                <div className="space-y-2">
                                    {similarIssues.slice(0, 3).map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="bg-white p-3 rounded border border-yellow-200"
                                        >
                                            <div className="font-medium text-sm text-gray-900">
                                                {issue.title}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {Math.round(issue.similarityScore * 100)}% similar
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !currentUser}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Anyway'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowSimilarWarning(false);
                                    setSimilarIssues([]);
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Modify Issue
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief description of the issue"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Detailed description of the issue"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority *
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assigned To *
                            </label>
                            <input
                                type="text"
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Email or name"
                                required
                            />
                        </div>
                    </div>

                    {!showSimilarWarning && (
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading || !currentUser}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? 'Creating...' : 'Create Issue'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
