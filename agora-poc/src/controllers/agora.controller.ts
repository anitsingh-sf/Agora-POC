import {get, param} from '@loopback/rest';
import {RtcTokenBuilder} from 'agora-access-token';
import axios from 'axios';

export class AgoraController {
  appID = '';
  appCertificate = '';
  
  customerID = '';
  customerCert = '';
  baseUrl = 'https://api.agora.io/dev/';

  getEncodedCred() {
    return Buffer.from(this.customerID + ':' + this.customerCert).toString('base64');
  }

  @get('/token/{uid}/{channelName}')
  token(@param.path.number('uid') uid: number,
    @param.path.string('channelName') channelName: string): string {
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // role 1 - publisher, 2 - subscriber
    const token = RtcTokenBuilder.buildTokenWithUid(this.appID, this.appCertificate, channelName, uid, 1, privilegeExpiredTs);
    console.log(token);

    return JSON.stringify(token);
  }

  // Other way of generating token using a string type id.
  // @get('/token/{accountId}/{channelName}')
  // token(@param.path.number('accountId') accountId: string,
  //   @param.path.string('channelName') channelName: string): string {
  //   const expirationTimeInSeconds = 3600;
  //   const currentTimestamp = Math.floor(Date.now() / 1000);
  //   const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  //   // role 1 - publisher, 2 - subscriber
  //   const token = RtcTokenBuilder.buildTokenWithUid(this.appID, this.appCertificate, channelName, accountId, 1, privilegeExpiredTs);
  //   console.log(token);

  //   return JSON.stringify(token);
  // }

  //List of projects
  @get('/projects')
  async projects() {
    const projectsList = await axios.get(this.baseUrl + 'v1/projects', {headers: {Authorization: 'Basic ' + this.getEncodedCred()}})
      .then(response => {
        return response.data.projects;
      })
      .catch(error => console.log('Error: ', error))

    return projectsList;
  }

  //List of channels
  @get('/channels')
  async channels() {
    const channelsList = await axios.get(this.baseUrl + 'v1/channel/' + this.appID, {headers: {Authorization: 'Basic ' + this.getEncodedCred()}})
      .then(response => {
        return response.data.data.channels;
      })
      .catch(error => console.log('Error: ', error))

    return channelsList;
  }

  //Users in a channel
  @get('/users/{channel}')
  async users(@param.path.string('channel') channel: string) {
    const channelData = await axios.get(this.baseUrl + 'v1/channel/user/' + this.appID + '/' + channel, {headers: {Authorization: 'Basic ' + this.getEncodedCred()}})
      .then(response => {
        return response.data.data;
      })
      .catch(error => console.log('Error: ', error))

    return channelData;
  }

  //User role in a channel
  @get('/users/role/{channel}/{uid}')
  async role(@param.path.string('channel') channel: string,
    @param.path.number('uid') uid: number) {
    const userDataInChannel = await axios.get(this.baseUrl + 'v1/channel/user/property/' + this.appID + '/' + uid + '/' + channel, {headers: {Authorization: 'Basic ' + this.getEncodedCred()}})
      .then(response => {
        return response.data.data;
      })
      .catch(error => console.log('Error: ', error))

    return userDataInChannel;
  }
}
