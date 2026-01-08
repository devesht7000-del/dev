import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User, AlertCircle, TrendingUp, Activity } from 'lucide-react';

const priorityColors = {
    Low: 'bg-green-100 text-green-700 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    High: 'bg-red-100 text-red-700 border-red-200',
};

const statusColors = {
    Open: 'bg-blue-100 text-blue-700 border-blue-200',
    'In Progress': 'bg-purple-100 text-purple-700 border-purple-200',
    Done: 'bg-green-100 text-green-700 border-green-200',
};

export default function IssueCard({ issue, onStatusChange }) {
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;

        // Enforce status transition rule: cannot go directly from Open to Done
        if (issue.status === 'Open' && newStatus === 'Done') {
            alert(
                'Issues cannot move directly from Open to Done. Please move to "In Progress" first.'
            );
            e.target.value = issue.status;
            return;
        }

        onStatusChange(issue.id, newStatus);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {issue.title}
                </h3>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[issue.priority]}`}>
                        {issue.priority}
                    </span>
                </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Assigned to: <span className="font-medium">{issue.assignedTo}</span></span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Created {formatDate(issue.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span>Created by: <span className="font-medium">{issue.createdBy}</span></span>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <label className="text-sm text-gray-700 font-medium">Status:</label>
                <select
                    value={issue.status}
                    onChange={handleStatusChange}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColors[issue.status]} cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all`}
                >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
        </div>
    );
}
