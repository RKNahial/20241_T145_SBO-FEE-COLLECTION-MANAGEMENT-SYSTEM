import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';

const ActivityLogs = ({ studentId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await studentAPI.getStudentLogs(studentId);
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [studentId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Activity Logs</h2>
            {logs.map(log => (
                <div key={log._id} className="log-entry">
                    <p>Action: {log.action}</p>
                    <p>Details: {log.details}</p>
                    <p>Status: {log.status}</p>
                    <p>Time: {new Date(log.createdAt).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default ActivityLogs; 