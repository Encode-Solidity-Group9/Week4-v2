import { Controller, Get, Param } from '@nestjs/common';
import { Post } from '@nestjs/common/decorators';
import { Body } from '@nestjs/common/decorators';
import { Query } from '@nestjs/common/decorators';
import { ethers } from 'ethers';
import { AppService } from './app.service';

export class claimTokensDto {
  address: string;

}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('token-address')
  getTokenAddress() {
    return this.appService.getTokenAddress();
  }

  @Get('ballot-address')
  getBallotAddress() {
    return this.appService.getBallotAddress();
  }

  @Post("claim-tokens")
  claimPaymentOrder(@Body() body: claimTokensDto) {
    return this.appService.claimTokens(body.address);
  }

}
