/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleSheetsService {
  private sheets;
  private spreadsheetId;

  constructor(private configService: ConfigService) {
    const email = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    let privateKey = this.configService.get<string>('GOOGLE_PRIVATE_KEY');
    this.spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');

    if (!email || !privateKey || !this.spreadsheetId) {
      console.warn(
        'Google Sheets configuration is missing. Please check GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID in your .env file.',
      );
      return;
    }

    // Handle private key formatting (newlines and quotes)
    if (privateKey) {
      // Trim quotes if they exist
      privateKey = privateKey.trim();
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
    }

    try {
      const auth = new google.auth.JWT({
        email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('Google Sheets API initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error);
    }
  }

  async appendRow(values: any[]) {
    if (!this.sheets) {
      console.error('Attempted to append row but Google Sheets API is not initialized.');
      throw new InternalServerErrorException(
        'Google Sheets API not initialized. Check server logs for details.',
      );
    }

    try {
      console.log(`Appending row to sheet: ${this.spreadsheetId}`);
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'A:Z', // Using a generic range instead of 'Sheet1!A:Z' to avoid issues with sheet names
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values],
        },
      });
      console.log('Row appended successfully.');
      return response.data;
    } catch (error) {
      console.error('Error appending to Google Sheets:', error);
      if (error.response && error.response.data) {
        console.error('Google API Error Details:', JSON.stringify(error.response.data));
      }
      throw new InternalServerErrorException(
        'Failed to save data to Google Sheets. Check server logs for details.',
      );
    }
  }
}
