import { serialize } from '../tools'
import { Injectable } from '@nestjs/common'
import { OrdersResponse } from '../graphql'
import axios, { AxiosInstance } from 'axios'
import { plainToClass } from 'class-transformer'
// Спасибо за подсказку на рейт-лимит API :)
import { ConcurrencyManager } from 'axios-concurrency'
import { CrmType, Order, OrderFilter, OrdersFilter, RetailPagination } from './types'

@Injectable()
export class RetailService {
  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: `${process.env.RETAIL_URL}/api/v5`,
      timeout: 10000,
      headers: {
        'X-API-KEY': process.env.RETAIL_KEY,
      },
    })

    this.axios.interceptors.request.use((config) => {
      process.env.RETAIL_DEBUG && console.log(config.url)
      return config
    })
    this.axios.interceptors.response.use(
      (r) => {
        process.env.RETAIL_DEBUG && console.log('Result:', r.data)
        return r
      },
      (r) => {
        process.env.RETAIL_DEBUG && console.log('Result:', r.data)
        return r
      },
    )

    ConcurrencyManager(this.axios, +process.env.MAX_CONCURRENT_REQUESTS)
  }

  async orders(filter?: OrdersFilter): Promise<OrdersResponse> {
    const params = serialize(filter, '')
    const resp = await this.axios.get('/orders?' + params)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const orders = plainToClass(Order, resp.data.orders as Array<any>)
    const pagination: RetailPagination = resp.data.pagination

    return {orders, pagination}
  }

  async findOrder(id: string, filter: OrderFilter): Promise<Order | null> {
    const params = serialize(filter, '')
    const resp = await this.axios.get(`/orders/${id}?` + params)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const orders = plainToClass(Order, resp.data.order)

    return orders
  }

  private async getReference({reference, key}: {reference: string, key: string}): Promise<CrmType[]> {
    const resp = await this.axios.get(`/reference/${reference}`)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const statuses = plainToClass(CrmType, resp.data[key] as Array<any>)

    return Object.values(statuses) // API возвращает объект, а не массив как обещало ¯\_(ツ)_/¯
  }

  orderStatuses(): Promise<CrmType[]> {
    return this.getReference({reference: 'statuses', key: 'statuses'})
  }

  productStatuses(): Promise<CrmType[]> {
    return this.getReference({reference: 'product-statuses', key: 'productStatuses'})
  }

  deliveryTypes(): Promise<CrmType[]> {
    return this.getReference({reference: 'delivery-types', key: 'deliveryTypes'})
  }
}
