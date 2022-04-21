import { OrdersResponse } from '../graphql'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { RetailService } from '../retail_api/retail.service'

@Resolver('Orders')
export class OrdersResolver {
  constructor(private retailService: RetailService) {}

  @Query()
  async getOrders(): Promise<OrdersResponse> {
    return await this.retailService.orders()
  }

  @Query()
  async order(@Args('number') id: string) {
    try {
      return await this.retailService.findOrder(id, {
        site: process.env.SITE
      })
    } catch (e) {
      console.log(e)
      return e
    }
  }
}
