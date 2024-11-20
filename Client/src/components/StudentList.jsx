import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await studentAPI.getAllStudents();
                setStudents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Students List</h2>
            {students.map(student => (
                <div key={student._id} className="student-card">
                    <h3>{student.name}</h3>
                    <p>Student ID: {student.studentId}</p>
                    <p>Email: {student.institutionalEmail}</p>
                    <p>Year Level: {student.yearLevel}</p>
                    <p>Program: {student.program}</p>
                    <p>Status: {student.status}</p>
                    <p>Payment Status: {student.paymentstatus}</p>
                </div>
            ))}
        </div>
    );
};

export default StudentList; 