import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import IssueCard from '../components/IssueCard';
import CreateIssueModal from '../components/CreateIssueModal';
import { getAllIssues, updateIssue } from '../utils/firestore';
import { Plus, Filter, Loader2, ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
    });

    const { currentUser } = useAuth();

    const fetchIssues = async () => {
        setLoading(true);
        try {
            // guard: ensure user is signed in (Firestore rules may block unauthenticated reads)
            if (!currentUser) {
                console.warn('fetchIssues: no currentUser, skipping fetch');
                setIssues([]);
                setFilteredIssues([]);
                return;
            }

            const data = await getAllIssues();
            setIssues(data);
            setFilteredIssues(data);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
            if (error?.code === 'permission-denied' || /permission|insufficient permissions/i.test(error?.message)) {
                alert('Permission denied when fetching issues. Ensure your Firestore rules allow reads for authenticated users.');
            } else {
                alert('Failed to fetch issues: ' + (error?.message || error));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    useEffect(() => {
        let filtered = [...issues];

        if (filters.status) {
            filtered = filtered.filter((issue) => issue.status === filters.status);
        }

        if (filters.priority) {
            filtered = filtered.filter((issue) => issue.priority === filters.priority);
        }

        setFilteredIssues(filtered);
    }, [filters, issues]);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            await updateIssue(issueId, { status: newStatus });
            fetchIssues();
        } catch (error) {
            console.error('Failed to update issue:', error);
            alert('Failed to update issue status');
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }));
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Issue Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Manage and track all your issues in one place
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Create Issue
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        {(filters.status || filters.priority) && (
                            <div className="flex items-end">
                                <button
                                    onClick={() => setFilters({ status: '', priority: '' })}
                                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-600">Loading issues...</p>
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {issues.length === 0 ? 'No issues yet' : 'No issues match your filters'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {issues.length === 0
                                ? 'Get started by creating your first issue'
                                : 'Try adjusting your filters to see more issues'}
                        </p>
                        {issues.length === 0 && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First Issue
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIssues.map((issue) => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateIssueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onIssueCreated={fetchIssues}
            />
        </Layout>
    );
}
