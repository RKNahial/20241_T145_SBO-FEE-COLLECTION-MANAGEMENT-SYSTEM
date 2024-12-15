const { google } = require('googleapis');
const { auth } = require('../config/driveConfig');

class GooglePeopleService {
    constructor() {
        this.peopleService = google.people({ version: 'v1', auth });
    }

    async getPersonInfo(email) {
        try {
            const response = await this.peopleService.people.searchContacts({
                query: email,
                readMask: 'emailAddresses,names,phoneNumbers,photos'
            });

            if (response.data.results && response.data.results.length > 0) {
                return response.data.results[0].person;
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching person info:', error);
            throw error;
        }
    }

    async getProfilePhoto(resourceName) {
        try {
            const response = await this.peopleService.people.get({
                resourceName: resourceName,
                personFields: 'photos'
            });

            if (response.data.photos && response.data.photos.length > 0) {
                return response.data.photos[0].url;
            }

            return null;
        } catch (error) {
            console.error('Error fetching profile photo:', error);
            throw error;
        }
    }
}

module.exports = new GooglePeopleService(); 