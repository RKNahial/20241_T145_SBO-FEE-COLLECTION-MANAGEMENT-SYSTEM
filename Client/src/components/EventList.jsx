// src/components/EventList.jsx
import React from 'react';

const EventList = ({ events }) => {
    return (
        <div className="event-list">
            <h2>Upcoming Events</h2>
            <ul>
                {events.map(event => (
                    <li key={event.id}>
                        <strong>{event.summary}</strong>
                        <p>{new Date(event.start.dateTime || event.start.date).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventList;