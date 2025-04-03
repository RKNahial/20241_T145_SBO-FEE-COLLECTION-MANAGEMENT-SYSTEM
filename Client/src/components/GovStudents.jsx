const confirmAction = async (id) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/students/${id}/toggle-archive`);
        // Handle success
        // Refresh your student list or update UI
    } catch (error) {
        console.error('Archive action error:', error);
        // Handle error appropriately
    }
}; 