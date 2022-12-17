import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json'
import { ConfigService } from '@nestjs/config';


const TOKENIZED_VOTES_ADDRESS = "0xF9de83d41e68d3a15b98Cf3d4656eaf4CF3Aac8B";

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;

  constructor(private configService: ConfigService) {
    this.provider = ethers.getDefaultProvider("goerli");
  }

  getTokenAddress() {
    return {result: TOKENIZED_VOTES_ADDRESS};
  }

  async claimTokens(address: string) {
    // TODO: Build the contract object
    // TODO: pick the signer using the .env keys
    // TODO: connect the contract object to the signer
    // TODO: make the transaction to mint the tokens
    // TODO: await the transaction get the receipt return the has
    // TODO: 
    // TODO: 
    return {result: `Claiming tokens for ${address}`};
  }

}
