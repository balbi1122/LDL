const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('deploy'));

// Initialize Notion client
const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Form submission endpoint
app.post('/submit-application', async (req, res) => {
    try {
        const formData = req.body;

        // Create page in Notion
        await notion.pages.create({
            parent: { database_id: DATABASE_ID },
            properties: {
                'First Name': {
                    title: [{ text: { content: formData.firstName } }]
                },
                'Last Name': {
                    rich_text: [{ text: { content: formData.lastName } }]
                },
                'Email': {
                    email: formData.email
                },
                'Phone': {
                    phone_number: formData.phone
                },
                'Loan Type': {
                    select: { name: formData.loanType }
                },
                'Loan Amount': {
                    number: parseFloat(formData.loanAmount.replace(/[^0-9.-]+/g, ''))
                },
                'Property Type': {
                    select: { name: formData.propertyType }
                },
                'Property Address': {
                    rich_text: [{ text: { content: formData.propertyAddress } }]
                },
                'Property City': {
                    rich_text: [{ text: { content: formData.propertyCity } }]
                },
                'Property State': {
                    rich_text: [{ text: { content: formData.propertyState } }]
                },
                'Property ZIP': {
                    rich_text: [{ text: { content: formData.propertyZip } }]
                },
                'Experience Level': {
                    select: { name: formData.experience }
                },
                'Timeline': {
                    select: { name: formData.timeline }
                },
                'Comments': {
                    rich_text: [{ text: { content: formData.comments || '' } }]
                },
                'Status': {
                    status: { name: 'New' }
                }
            }
        });

        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit application. Please try again later.'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 