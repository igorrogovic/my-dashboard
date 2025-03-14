import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_SHEET_URL,
      range: 'Sheet1!A:K', // Adjust based on your sheet structure
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    // Convert sheet data to DataPoint objects
    const data = rows.slice(1).map((row) => ({
      name: row[0],
      cost: parseFloat(row[1]),
      impressions: parseInt(row[2]),
      clicks: parseInt(row[3]),
      ctr: parseFloat(row[4]),
      conversions: parseInt(row[5]),
      value: parseFloat(row[6]),
      cvr: parseFloat(row[7]),
      cpa: parseFloat(row[8]),
      roas: parseFloat(row[9]),
      aov: parseFloat(row[10]),
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
}