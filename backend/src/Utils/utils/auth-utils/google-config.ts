import { google } from 'googleapis';
import config from '../../../config/env-config'

const clientId = config.googleclientid;
const clientSecret = config.googleclientsecret;

export const OAuth2Client = new google.auth.OAuth2(clientId, clientSecret, 'postmessage');
